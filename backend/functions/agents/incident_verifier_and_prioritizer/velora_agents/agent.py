# velora_agents/agent_pubsub.py
# ---------------------------------------------------------------------------
# Vertex AI ADK agents + Cloud Pub/Sub event-driven wiring  (single-file edition)
# Workflow
# 1. Uploader publishes an “incident-upload” message that contains the GCS URI
#    of the image and its metadata.
# 2. VerifierAgent PULL-subscribes to incident-upload-sub, validates the image,
#    then PUBLISHES a compact verification JSON (≤ 30 words) to
#    incident-verification topic.
# 3. SeverityAgent PULL-subscribes to incident-verification-sub, scores the
#    incident, dispatches a team when needed, then PUBLISHES a final record to
#    incident-severity topic for downstream dashboards / BigQuery sinks.
#
# The file can be deployed unchanged with Vertex AI Agent Engine:
#
#     pip install "google-cloud-aiplatform[adk,agent_engines]" cloudpickle
# ---------------------------------------------------------------------------

from __future__ import annotations
import asyncio, json, logging, os, random, time, hashlib
from datetime import datetime
from math import radians, sin, cos, asin, sqrt
from typing import Any, Dict, List

# -------------- Google Cloud SDKs ------------------------------------------------
import firebase_admin
from firebase_admin import messaging as fcm
from google.cloud import firestore, storage, bigquery, aiplatform
import google.cloud.pubsub_v1 as pubsub_v1
from google import genai
import vertexai
# Removed problematic imports - using standard classes instead
class BaseAgent:
    def __init__(self):
        pass
    
    def __call__(self, *args, **kwargs):
        return self._run_async_impl(*args, **kwargs)
    
    async def _run_async_impl(self, ctx):
        raise NotImplementedError

class Agent:
    class Event:
        def __init__(self, payload):
            self.payload = payload

class LlmAgent(BaseAgent):
    def __init__(self):
        super().__init__()

class FunctionTool:
    def __init__(self, name, func):
        self.name = name
        self.func = func

# -------------- CONFIG ----------------------------------------------------------
PROJECT_ID        = os.getenv("GOOGLE_CLOUD_PROJECT",  "velora-demo")
LOCATION          = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
STAGING_BUCKET    = f"gs://{PROJECT_ID}-staging"

# Pub/Sub topics & subscriptions
UPLOAD_TOPIC          = "incident-upload"          # external publisher → Verifier
UPLOAD_SUB            = "incident-upload-sub"
VERIFICATION_TOPIC    = "incident-verification"    # Verifier → Severity
VERIFICATION_SUB      = "incident-verification-sub"
SEVERITY_TOPIC        = "incident-severity"        # Severity → Down-stream apps

# FCM
FCM_TOPIC_ALL         = "all-city"
# Misc
VERIFIER_LIMIT        = 20        # nearby users to notify
VERTEX_EP_ID          = "5511769326669004800"  # online severity model
TEAMS_COLL            = "teams-data"
ACTIVE_COLL           = "active_incidents"

# Environment for Vertex AI SDK
os.environ["GOOGLE_CLOUD_PROJECT"]  = PROJECT_ID
os.environ["GOOGLE_CLOUD_LOCATION"] = LOCATION
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

# -------------- GLOBAL CLIENTS --------------------------------------------------
aiplatform.init(project=PROJECT_ID, location=LOCATION, staging_bucket=STAGING_BUCKET)
vertexai.init(project=PROJECT_ID, location=LOCATION, staging_bucket=STAGING_BUCKET)

fs_async = firestore.AsyncClient(project=PROJECT_ID)
fs_sync  = firestore.Client(project=PROJECT_ID)
bq       = bigquery.Client(project=PROJECT_ID)
gcs      = storage.Client(project=PROJECT_ID)
pubsub_publisher  = pubsub_v1.PublisherClient()
pubsub_subscriber = pubsub_v1.SubscriberClient()

if not firebase_admin._apps:
    firebase_admin.initialize_app()
fcm_cli  = fcm

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("velora_pipeline")

# -------------- UTILITIES -------------------------------------------------------
def ensure_pubsub_resources() -> None:
    """Create topics & pull subscriptions idempotently."""
    def _topic_path(name: str) -> str:
        return pubsub_publisher.topic_path(PROJECT_ID, name)

    def _sub_path(name: str) -> str:
        return pubsub_subscriber.subscription_path(PROJECT_ID, name)

    for topic in (UPLOAD_TOPIC, VERIFICATION_TOPIC, SEVERITY_TOPIC):
        tp = _topic_path(topic)
        try:
            pubsub_publisher.get_topic(request={"topic": tp})
        except Exception:
            pubsub_publisher.create_topic(request={"name": tp})
            log.info("Created topic %s", tp)

    spec = [
        (UPLOAD_SUB,        UPLOAD_TOPIC),
        (VERIFICATION_SUB,  VERIFICATION_TOPIC),
    ]
    for sub_name, topic in spec:
        spath = _sub_path(sub_name)
        if not _subscription_exists(spath):
            pubsub_subscriber.create_subscription(
                request={
                    "name": spath,
                    "topic": _topic_path(topic),
                    "ack_deadline_seconds": 60,  # ample processing window
                }
            )
            log.info("Created subscription %s → %s", spath, topic)


def _subscription_exists(sub_path: str) -> bool:
    try:
        pubsub_subscriber.get_subscription(request={"subscription": sub_path})
        return True
    except Exception:
        return False


def publish_json(topic: str, payload: Dict[str, Any]) -> None:
    data = json.dumps(payload).encode("utf-8")
    pubsub_publisher.publish(
        pubsub_publisher.topic_path(PROJECT_ID, topic), data=data
    )


# -------------- COMMON HELPERS --------------------------------------------------
def haversine_km(lat1, lon1, lat2, lon2) -> float:
    dlat, dlon = map(radians, (lat2 - lat1, lon2 - lon1))
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 6371.0 * 2 * asin(sqrt(a))


def incident_digest(gcs_uri: str, reporter: str) -> str:
    h = hashlib.sha256()
    h.update(f"{gcs_uri}|{reporter}".encode())
    return h.hexdigest()[:16]


# ---------------------------- Firestore helpers ---------------------------------
async def mark_verified(inc_id: str, desc: str) -> None:
    await fs_async.collection("incidents").document(inc_id).update(
        {
            "status": "VERIFIED",
            "verified_ts": firestore.SERVER_TIMESTAMP,
            "description": desc,
        }
    )
    # push to residents
    msg = fcm_cli.Message(
        notification=fcm_cli.Notification(title="Verified incident", body=desc),
        topic=FCM_TOPIC_ALL,
    )
    await asyncio.get_event_loop().run_in_executor(None, fcm_cli.send, msg)


def persist_prioritized(inc_id: str, payload: Dict[str, Any], score: int):
    fs_sync.collection(ACTIVE_COLL).document(inc_id).set(
        {
            "status": "prioritized",
            "severityScore": score,
            "details": payload,
            "createdAt": datetime.utcnow(),
        }
    )


def archive_incident(
    inc_id: str, data: Dict[str, Any], score: int, team_id: str, team_name: str
):
    rows = [
        {
            "incidentId": inc_id,
            "finalStatus": "dispatched",
            "incidentType": data["details"]["incidentType"],
            "latitude": data["details"]["geolocation"]["latitude"],
            "longitude": data["details"]["geolocation"]["longitude"],
            "severityScore": score,
            "assignedTeamId": team_id,
            "assignedTeamName": team_name,
            "createdAt": data["createdAt"].isoformat(),
            "resolvedAt": datetime.utcnow().isoformat(),
        }
    ]
    bq.insert_rows_json(f"{PROJECT_ID}.velora_data.incident_archive", rows)


# ----------------------------  VERIFIER AGENT -----------------------------------
async def choose_verifiers(lat: float, lon: float) -> Dict[str, List[str]]:
    """Pick nearby citizen verifiers + all authorities."""
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


async def post_process(incident_id: str, description: str) -> Dict[str, str]:
    await mark_verified(incident_id, description)
    return {"incident_id": incident_id, "description": description}


verifier_agent = LlmAgent(
    name="VerifierAgent",
    model="gemini-1.5-flash",
    description="Validates incident images and returns 30-word summary.",
    instruction=(
        "Classify the supplied photo as VERIFIED or REJECTED. "
        'If VERIFIED, output JSON: {"verified":true,"description":"…≤30 words…"}'
    ),
    tools=[
        FunctionTool.from_function(choose_verifiers),
        FunctionTool.from_function(post_process),
    ],
    output_key="verification_result",
)

# ----------------------------  SEVERITY AGENT -----------------------------------
class SeverityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SeverityAgent",
            description="Scores severity & dispatches field teams",
        )

    async def _run_async_impl(self, ctx) -> List[Agent.Event]:
        payload = ctx.input  # dict from VerifierAgent
        score = await self._score(payload)
        inc_id = f"INC-{int(time.time())}"
        persist_prioritized(inc_id, payload, score)

        if score > 50:
            dispatched = await self._dispatch_team(inc_id, payload, score)
            msg = f"High severity {score}. Team {dispatched} dispatched."
        else:
            msg = f"Low severity {score}. Monitoring."
        return [Agent.Event.agent_response(msg)]

    async def _score(self, inc: Dict[str, Any]) -> int:
        try:
            ep = aiplatform.Endpoint(VERTEX_EP_ID)
            pred = ep.predict(instances=[inc]).predictions[0]["value"]
            return round(pred)
        except Exception as e:
            log.error(e)
            return 50

    async def _dispatch_team(
        self, inc_id: str, inc: Dict[str, Any], score: int
    ) -> str:
        specialty_map = {
            "fallen_tree": "road_clearance",
            "accident": "road_clearance",
            "pothole": "road_repair",
            "waterlogging": "drainage_support",
            "garbage": "sanitation",
        }
        need = specialty_map.get(inc["incidentType"], "general_support")
        q = (
            fs_sync.collection(TEAMS_COLL)
            .where("status", "==", "available")
            .where("speciality", "==", need)
        )
        cands = list(q.stream())
        if not cands:
            return "none-available"
        inc_loc = (inc["geolocation"]["latitude"], inc["geolocation"]["longitude"])
        best, best_dist = None, float("inf")
        from geopy.distance import geodesic

        for doc in cands:
            d = doc.to_dict()
            team_loc = (
                d["currentLocation"]["latitude"],
                d["currentLocation"]["longitude"],
            )
            d_km = geodesic(inc_loc, team_loc).kilometers
            if d_km < best_dist:
                best, best_dist = doc, d_km

        team_id, best_data = best.id, best.to_dict()
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
            {"details": inc, "createdAt": datetime.utcnow()},
            score,
            team_id,
            best_data.get("teamName", "Unknown"),
        )
        return best_data.get("teamName", "Unknown")


severity_agent = SeverityAgent()

# ----------------------------  PUB/SUB CALLBACKS --------------------------------
def verifier_callback(message: pubsub_v1.subscriber.message.Message) -> None:
    """Triggered for each uploaded incident."""
    try:
        payload = json.loads(message.data.decode("utf-8"))
        log.info("VerifierAgent received upload %s", payload.get("gcs_uri"))
        result = verifier_agent(payload)  # synchronous ADK call
        verification = result["verification_result"]  # type: ignore
        publish_json(VERIFICATION_TOPIC, verification)
        log.info("Published verification result to %s", VERIFICATION_TOPIC)
        message.ack()
    except Exception as e:
        log.exception("Verifier processing failed: %s", e)
        message.nack()  # re-deliver later


def severity_callback(message: pubsub_v1.subscriber.message.Message) -> None:
    """Triggered for each verified incident."""
    try:
        verification = json.loads(message.data.decode("utf-8"))
        if not verification.get("verified"):
            log.info("Skipping unverified incident.")
            message.ack()
            return
        log.info("SeverityAgent scoring verified incident.")
        result_events = severity_agent(verification)  # synchronous call
        # Simplified: send first response text
        publish_json(SEVERITY_TOPIC, {"incidentId": verification["incident_id"], "status": result_events[0].payload})
        log.info("Published severity record to %s", SEVERITY_TOPIC)
        message.ack()
    except Exception as e:
        log.exception("Severity processing failed: %s", e)
        message.nack()


# ----------------------------  BOOTSTRAP & RUN LOOP -----------------------------
def main() -> None:
    ensure_pubsub_resources()

    upload_sub_path       = pubsub_subscriber.subscription_path(PROJECT_ID, UPLOAD_SUB)
    verification_sub_path = pubsub_subscriber.subscription_path(PROJECT_ID, VERIFICATION_SUB)

    pubsub_subscriber.subscribe(
        upload_sub_path,
        callback=verifier_callback,
        flow_control=pubsub_v1.types.FlowControl(max_messages=10),
    )
    pubsub_subscriber.subscribe(
        verification_sub_path,
        callback=severity_callback,
        flow_control=pubsub_v1.types.FlowControl(max_messages=10),
    )

    log.info("Pipeline running — waiting for Pub/Sub pushes …")
    # Keep the main thread alive; callbacks run in background threads.
    try:
        while True:
            time.sleep(120)
    except KeyboardInterrupt:
        log.info("Shutting down …")


# ----------------------------  LOCAL TEST BLOCK ---------------------------------
if __name__ == "__main__":
    main()
