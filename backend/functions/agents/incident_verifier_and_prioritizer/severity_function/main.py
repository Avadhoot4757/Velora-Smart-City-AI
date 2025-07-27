import json
import logging
import os
import time
from datetime import datetime
from typing import Dict, Any
from flask import jsonify
from geopy.distance import geodesic

import functions_framework
from flask import jsonify
from google.cloud import firestore, bigquery, pubsub_v1, aiplatform

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "velora-demo")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
VERTEX_EP_ID = "5511769326669004800"
TEAMS_COLL = "teams-data"
ACTIVE_COLL = "active_incidents"

fs_sync = firestore.Client(project=PROJECT_ID)
bq = bigquery.Client(project=PROJECT_ID)
pubsub_publisher = pubsub_v1.PublisherClient()
aiplatform.init(project=PROJECT_ID, location=LOCATION)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("severity_agent")

def persist_prioritized(inc_id: str, payload: Dict[str, Any], score: int):
    fs_sync.collection(ACTIVE_COLL).document(inc_id).set({
        "status": "prioritized",
        "severityScore": score,
        "details": payload,
        "createdAt": datetime.utcnow()
    })

def archive_incident(inc_id: str, data: Dict[str, Any], score: int, team_id: str, team_name: str):
    rows = [{
        "incidentId": inc_id,
        "finalStatus": "dispatched",
        "incidentType": data["original_data"]["incidentType"],
        "latitude": data["original_data"]["geolocation"]["latitude"],
        "longitude": data["original_data"]["geolocation"]["longitude"],
        "severityScore": score,
        "assignedTeamId": team_id,
        "assignedTeamName": team_name,
        "createdAt": data["timestamp"],
        "resolvedAt": datetime.utcnow().isoformat()
    }]
    bq.insert_rows_json(f"{PROJECT_ID}.velora_data.incident_archive", rows)

def score_incident(incident_data: Dict[str, Any]) -> int:
    try:
        ep = aiplatform.Endpoint(VERTEX_EP_ID)
        prediction_input = incident_data["original_data"]
        pred = ep.predict(instances=[prediction_input]).predictions['value']
        return round(pred)
    except Exception as e:
        log.error(f"Scoring failed: {e}")
        incident_type = incident_data["original_data"].get("incidentType", "unknown")
        severity_map = {
            "accident": 80,
            "fallen_tree": 70,
            "waterlogging": 60,
            "pothole": 40,
            "garbage": 30
        }
        return severity_map.get(incident_type, 50)

def dispatch_team(inc_id: str, incident_data: Dict[str, Any], score: int) -> str:
    specialty_map = {
        "fallen_tree": "road_clearance",
        "accident": "road_clearance",
        "pothole": "road_repair",
        "waterlogging": "drainage_support",
        "garbage": "sanitation"
    }
    incident_type = incident_data["original_data"]["incidentType"]
    need = specialty_map.get(incident_type, "general_support")
    q = fs_sync.collection(TEAMS_COLL).where("status", "==", "available").where("speciality", "==", need)
    candidates = list(q.stream())
    if not candidates:
        return "none-available"
    inc_loc = (
        incident_data["original_data"]["geolocation"]["latitude"],
        incident_data["original_data"]["geolocation"]["longitude"]
    )
    best_team, best_distance = None, float("inf")
    for doc in candidates:
        team_data = doc.to_dict()
        team_loc = (
            team_data["currentLocation"]["latitude"],
            team_data["currentLocation"]["longitude"]
        )
        distance = geodesic(inc_loc, team_loc).kilometers
        if distance < best_distance:
            best_team, best_distance = doc, distance
    team_id, best_data = best_team.id, best_team.to_dict()
    batch = fs_sync.batch()
    batch.update(
        fs_sync.collection(ACTIVE_COLL).document(inc_id),
        {
            "status": "dispatched",
            "assignedTeamId": team_id,
            "assignedTeamName": best_data.get("teamName", "Unknown"),
        },
    )
    batch.update(
        fs_sync.collection(TEAMS_COLL).document(team_id), {"status": "engaged"}
    )
    batch.commit()
    archive_incident(
        inc_id,
        incident_data,
        score,
        team_id,
        best_data.get("teamName", "Unknown"),
    )
    return best_data.get("teamName", "Unknown")

def publish_to_topic(topic_name: str, payload: Dict[str, Any]) -> None:
    topic_path = pubsub_publisher.topic_path(PROJECT_ID, topic_name)
    data = json.dumps(payload).encode("utf-8")
    pubsub_publisher.publish(topic_path, data=data)
    log.info(f"Published to {topic_name}: {payload.get('incident_id', 'unknown')}")

@functions_framework.cloud_event
def process_incident_verification(cloud_event):
    """Cloud Function that processes Pub/Sub messages."""
    try:
        # Extract data from cloud event
        message_data = cloud_event.data.get("message", {}).get("data", "")
        if not message_data:
            log.error("No message data in cloud event")
            return
        
        verification_data = json.loads(message_data)
        
        if not verification_data.get("verified"):
            log.info("Skipping unverified incident")
            return

        incident_id = verification_data["incident_id"]
        log.info(f"Processing verified incident for severity: {incident_id}")
        severity_score = score_incident(verification_data)
        persist_prioritized(incident_id, verification_data, severity_score)
        
        result_payload = {
            "incident_id": incident_id,
            "severity_score": severity_score,
            "status": "assessed",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if severity_score > 50:
            team_name = dispatch_team(incident_id, verification_data, severity_score)
            result_payload.update({
                "status": "dispatched",
                "assigned_team": team_name,
                "priority": "high"
            })
            log.info(f"High severity {severity_score}. Team {team_name} dispatched for {incident_id}")
        else:
            result_payload.update({
                "status": "monitoring",
                "priority": "low"
            })
            log.info(f"Low severity {severity_score}. Monitoring incident {incident_id}")
        
        publish_to_topic("incident-severity", result_payload)
        log.info(f"Successfully processed incident {incident_id}")
        return
        
    except Exception as e:
        log.error(f"Severity processing failed: {e}")
        raise
