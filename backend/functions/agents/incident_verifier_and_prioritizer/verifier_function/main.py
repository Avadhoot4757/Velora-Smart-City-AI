import json
import logging
import os
import random
import time
import hashlib
from datetime import datetime
from math import radians, sin, cos, asin, sqrt
from typing import Dict, List, Any
from flask import jsonify

import functions_framework
from google.cloud import firestore, storage, pubsub_v1, aiplatform
from google import genai
import firebase_admin
from firebase_admin import messaging as fcm
import vertexai

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "velora-demo")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
STAGING_BUCKET = f"gs://{PROJECT_ID}-staging"
FCM_TOPIC_ALL = "all-city"
VERIFIER_LIMIT = 20
AUTHORITY_MIN = 1
YES_RATIO_MIN = 0.6

if not firebase_admin._apps:
    firebase_admin.initialize_app()

vertexai.init(project=PROJECT_ID, location=LOCATION, staging_bucket=STAGING_BUCKET)
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

fs_async = firestore.AsyncClient(project=PROJECT_ID)
fs_sync = firestore.Client(project=PROJECT_ID)
gcs = storage.Client(project=PROJECT_ID)
pubsub_publisher = pubsub_v1.PublisherClient()
fcm_cli = fcm
genai_cli = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("verifier_agent")

def haversine_km(lat1, lon1, lat2, lon2) -> float:
    dlat, dlon = map(radians, (lat2-lat1, lon2-lon1))
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    return 6371.0 * 2 * asin(sqrt(a))

def incident_digest(gcs_uri: str, reporter: str) -> str:
    h = hashlib.sha256()
    h.update(f"{gcs_uri}|{reporter}".encode())
    return h.hexdigest()[:16]

async def mark_verified(inc_id: str, desc: str) -> None:
    await fs_async.collection("incidents").document(inc_id).update({
        "status": "VERIFIED",
        "verified_ts": firestore.SERVER_TIMESTAMP,
        "description": desc
    })
    msg = fcm_cli.Message(
        notification=fcm_cli.Notification(
            title="Verified incident", body=desc),
        topic=FCM_TOPIC_ALL
    )
    fcm_cli.send(msg)

async def find_verifiers(lat: float, lon: float) -> Dict[str, List[str]]:
    users, auths = [], []
    async for d in fs_async.collection("user_locations").stream():
        u = d.to_dict()
        if haversine_km(lat, lon, u["lat"], u["lon"]) <= 0.2:
            users.append(u["uid"])
    random.shuffle(users)
    users = users[:VERIFIER_LIMIT]
    a_snap = await fs_async.collection("authorities").get()
    auths = [doc.id for doc in a_snap]
    return {"nearby_user_ids": users, "authority_ids": auths}

def publish_to_topic(topic_name: str, payload: Dict[str, Any]) -> None:
    topic_path = pubsub_publisher.topic_path(PROJECT_ID, topic_name)
    data = json.dumps(payload).encode("utf-8")
    pubsub_publisher.publish(topic_path, data=data)
    log.info(f"Published to {topic_name}: {payload.get('incident_id', 'unknown')}")

async def verify_incident_with_ai(incident_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        gcs_uri = incident_data.get("gcs_uri", "")
        incident_type = incident_data.get("incidentType", "unknown")
        if not gcs_uri:
            return {"verified": False, "description": "No image provided"}
        model = genai_cli.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                "Analyze this incident image. Is this a legitimate safety incident? "
                f"Expected type: {incident_type}. "
                "Respond with JSON: {\"verified\": true/false, \"description\": \"max 30 words\"}"
            ]
        )
        response_text = model.text.strip()
        if response_text.startswith("```"):
            response_text = response_text[7:-3]
        ai_result = json.loads(response_text)
        return {
            "verified": ai_result.get("verified", False),
            "description": ai_result.get("description", "AI verification completed")[:30]
        }
    except Exception as e:
        log.error(f"AI verification failed: {e}")
        return {"verified": False, "description": "Verification failed"}

@functions_framework.cloud_event
def process_incident_upload(cloud_event):
    """Cloud Function that processes Pub/Sub messages."""
    try:
        # Extract data from cloud event
        message_data = cloud_event.data.get("message", {}).get("data", "")
        if not message_data:
            log.error("No message data in cloud event")
            return
        
        incident_data = json.loads(message_data)
            
            log.info(f"Processing incident upload: {incident_data.get('gcs_uri')}")
            incident_id = f"INC-{incident_digest(incident_data.get('gcs_uri', ''), incident_data.get('reporter', ''))}"
            
            lat = incident_data.get("geolocation", {}).get("latitude", 0)
            lon = incident_data.get("geolocation", {}).get("longitude", 0)
            
            import asyncio
            verifiers = asyncio.run(find_verifiers(lat, lon))
            verification_result = asyncio.run(verify_incident_with_ai(incident_data))
            
            if verification_result["verified"]:
                asyncio.run(mark_verified(incident_id, verification_result["description"]))
                verification_payload = {
                    "incident_id": incident_id,
                    "verified": True,
                    "description": verification_result["description"],
                    "original_data": incident_data,
                    "verifiers": verifiers,
                    "timestamp": datetime.utcnow().isoformat()
                }
                publish_to_topic("incident-verification", verification_payload)
                log.info(f"Incident {incident_id} verified and published for severity assessment")
            else:
                log.info(f"Incident {incident_id} rejected: {verification_result['description']}")
            
            log.info(f"Successfully processed incident {incident_id}")
            return
    except Exception as e:
        log.error(f"Verifier processing failed: {e}")
        raise
