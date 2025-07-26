"""agent1.py - Commuter Incident Verifier & Urban Threads Agent
----------------------------------------------------------------
A single-file custom agent template that follows the Vertex AI Agent Engine
“agent garden” pattern.  It subscribes to the *CitizenIncidentTopic* Pub/Sub
stream, verifies commuter-reported incidents against CCTV & sensor evidence in
BigQuery, deduplicates by (lat,lon,type) hash, persists verified incidents to
Firestore, and calls the Gemini API for multimodal reasoning.  All logic lives
inside the Agent class so it can be deployed directly via Vertex AI Agent
Engine or executed locally for testing.

❖ How to run locally
────────────────────
$ export PROJECT_ID="my-gcp-project"
$ export LOCATION="us-central1"
$ python agent1.py  # starts the pull loop & FastAPI dashboard

❖ Important
────────────
•  Only configuration parameters are stored in __init__; all heavy clients are
   built in set_up() to keep the object picklable.
•  query() processes a *single* incident payload and is the default operation.
•  stream_query() is wired as a generator to mirror Pub/Sub ingestion so the
   agent can be queried in real-time dashboards.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import signal
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, Sequence

from google.cloud import bigquery, pubsub_v1
from google.cloud.firestore_v1 import AsyncClient
import firebase_admin
from firebase_admin import messaging as fcm
from google.api_core.exceptions import AlreadyExists
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google import genai
from google.genai import types

# ──────────────────────────────────────────────────────────────────────────────
#  Agent Definition (Google GenAI SDK custom template)
# ──────────────────────────────────────────────────────────────────────────────

class CommuterIncidentAgent:
    """Google GenAI custom agent that verifies commuter incidents."""

    def __init__(
        self,
        project: str,
        location: str,
        gemini_model: str = "gemini-1.5-flash",
        topic: str = "CitizenIncidentTopic",
        sub_id: str = "civ-agent-sub",
        geofence_km: float = 4.0,
        inner_km: float = 2.0,
    ) -> None:
        self.project = project
        self.location = location
        self.model_name = gemini_model
        self.topic = topic
        self.sub_id = sub_id
        self.geofence_km = geofence_km
        self.inner_km = inner_km

        # Place-holders; real clients are built in set_up()
        self._bq: bigquery.Client | None = None
        self._fs: AsyncClient | None = None
        self._client: genai.Client | None = None
        self._fcm: fcm.MessagingServiceClient | None = None
        self._subscriber: pubsub_v1.SubscriberClient | None = None

        # Runtime state
        self._running = False
        self.logger = logging.getLogger("CIV-Agent")
        self.logger.setLevel(logging.INFO)
        self._shutdown_event = asyncio.Event()

    # ‑--------------------------------------------------------------------------
    # HELPER UTILITIES
    # ‑--------------------------------------------------------------------------

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Return distance in kilometres between two lat/lon pairs."""
        from math import radians, sin, cos, asin, sqrt

        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(
            dlon / 2
        ) ** 2
        return 6371.0 * 2 * asin(sqrt(a))

    def _geofence_ok(self, lat: float, lon: float) -> bool:
        d = self._haversine(lat, lon, *self._center)
        return self.inner_km <= d <= self.geofence_km

    @staticmethod
    def _hash_incident(inc: Dict[str, Any]) -> str:
        sha = hashlib.sha256()
        sha.update(f"{inc['type']}|{inc['lat']:.4f}|{inc['lon']:.4f}".encode())
        return sha.hexdigest()[:16]

    # ‑--------------------------------------------------------------------------
    #  set_up() – heavy-weight initialisation
    # ‑--------------------------------------------------------------------------

    def set_up(self) -> None:
        """Initialise Google Cloud clients and the GenAI model."""
        # Set environment variables for GenAI SDK
        os.environ["GOOGLE_CLOUD_PROJECT"] = self.project
        os.environ["GOOGLE_CLOUD_LOCATION"] = self.location
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

        # BigQuery & Firestore async clients
        self._bq = bigquery.Client(project=self.project, location=self.location)
        self._fs = AsyncClient(project=self.project)

        # GenAI multimodal client
        self._client = genai.Client(vertexai=True, project=self.project, location=self.location)

        # FCM (Firebase Admin SDK)
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        self._fcm = fcm

        # Pub/Sub subscriber (lazy pull loop)
        self._subscriber = pubsub_v1.SubscriberClient()
        self._sub_path = (
            f"projects/{self.project}/subscriptions/{self.sub_id}"
        )

        # Ensure subscription exists (idempotent)
        try:
            self._subscriber.create_subscription(
                name=self._sub_path,
                topic=f"projects/{self.project}/topics/{self.topic}",
            )
        except AlreadyExists:
            pass

        # Derive city centre once (example: San Francisco)
        self._center = (37.7749, -122.4194)

        self.logger.info("Starting agent setup...")
        self.logger.info("Pub/Sub subscriber configured")
        self.logger.info("BigQuery client initialized")
        self.logger.info("GenAI client ready")
        self.logger.info("Firestore client connected")
        self.logger.info("Agent set_up complete – listening for incidents…")
        # Launch background pull loop
        self._running = True
        asyncio.create_task(self._pull_loop())
        # Launch heartbeat
        asyncio.create_task(self._heartbeat_loop())

    # ‑--------------------------------------------------------------------------
    #  PUB/SUB BACKGROUND LOOP
    # ‑--------------------------------------------------------------------------

    async def _pull_loop(self) -> None:
        """Continuously pull messages and pipe into verification pipeline."""
        assert self._subscriber is not None  # no-QA : S101

        def _cb(msg: pubsub_v1.subscriber.message.Message) -> None:  # Sync CB
            payload = json.loads(msg.data.decode())
            asyncio.create_task(self._process_message(payload, msg))

        self._subscriber.subscribe(self._sub_path, callback=_cb)
        while self._running and not self._shutdown_event.is_set():
            await asyncio.sleep(15)  # keep task alive

    async def _process_message(
        self, payload: Dict[str, Any], msg: pubsub_v1.subscriber.message.Message
    ) -> None:
        logger.info(f"Received incident: {payload}")
        try:
            verified = await self._verify_incident(payload)
            if verified:
                logger.info("Incident processing completed and verified.")
                msg.ack()
            else:
                logger.info("Incident processing failed verification or duplicate.")
                msg.nack()
        except Exception as exc:  # pylint: disable=broad-except
            logger.error(f"Failed to process incident: {exc}")
            msg.nack()

    # ‑--------------------------------------------------------------------------
    #  CORE VERIFICATION LOGIC
    # ‑--------------------------------------------------------------------------

    async def _verify_incident(self, inc: Dict[str, Any]) -> bool:
        """Return True if the incident is verified."""
        lat, lon = inc["lat"], inc["lon"]
        if not self._geofence_ok(lat, lon):
            return False

        # 1) CCTV / sensor evidence lookup in BigQuery
        frame_uri = inc.get("frame_uri")
        if not frame_uri:
            frame_uri = await self._cctv_lookup(lat, lon, inc["timestamp"])
        if not frame_uri:
            return False

        # 2) GenAI multimodal validation
        if not await self._genai_validate(frame_uri, inc["type"]):
            return False

        # 3) Deduplication – simple hash stored in Firestore
        hash_id = self._hash_incident(inc)
        dup_ref = self._fs.collection("dedup").document(hash_id)
        if (await dup_ref.get()).exists:
            return False  # duplicate
        await dup_ref.set({"ts": datetime.utcnow()})

        # 4) Persist & notify
        await self._fs.collection("verified_incidents").add(inc)
        await self._push_fcm(inc)
        return True

    # BigQuery helper
    async def _cctv_lookup(self, lat: float, lon: float, ts_iso: str) -> str | None:
        assert self._bq is not None
        ts = datetime.fromisoformat(ts_iso)
        sql = """
            SELECT uri
            FROM `civic.cctv_events`
            WHERE ST_DWITHIN(geo, ST_GEOGPOINT(@lon,@lat), 4000)
              AND timestamp BETWEEN @start AND @end
            LIMIT 1
        """
        job = self._bq.query(
            sql,
            job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("lon", "FLOAT64", lon),
                    bigquery.ScalarQueryParameter("lat", "FLOAT64", lat),
                    bigquery.ScalarQueryParameter(
                        "start", "TIMESTAMP", ts - timedelta(minutes=10)
                    ),
                    bigquery.ScalarQueryParameter(
                        "end", "TIMESTAMP", ts + timedelta(minutes=10)
                    ),
                ]
            ),
        )
        rows = await job.result_async()
        async for row in rows:  # returns AsyncRowIterator
            return row["uri"]
        return None

    # GenAI helper
    async def _genai_validate(self, frame_uri: str, inc_type: str) -> bool:
        assert self._client is not None
        # Use the new GenAI SDK for multimodal reasoning
        contents = [
            f"This is a CCTV frame. Answer only 'yes' or 'no': does it show a {inc_type}?",
            types.BlobData(uri=frame_uri, mime_type="image/jpeg"),
        ]
        response = self._client.models.generate_content(
            model=self.model_name,
            contents=contents
        )
        return response.candidates[0].text.strip().lower().startswith("yes")

    # FCM push
    async def _push_fcm(self, inc: Dict[str, Any]) -> None:
        assert self._fcm is not None
        msg = self._fcm.Message(
            notification=self._fcm.Notification(
                title="Verified Incident",
                body=f"{inc['type'].title()} near your route",
            ),
            topic="commuters",
        )
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, self._fcm.send, msg)

    # ‑--------------------------------------------------------------------------
    # Agent Engine REQUIRED METHODS
    # ‑--------------------------------------------------------------------------

    async def query(self, *, input: Dict[str, Any], **_) -> Dict[str, Any]:
        """Handle a *single* incident verification request (sync API)."""
        ok = await self._verify_incident(input)
        return {"verified": ok, "incident": input}

    def stream_query(self, *, input: Dict[str, Any], **_) -> Iterable[Dict[str, Any]]:
        """Yield back progress milestones while verifying an incident."""
        async def _gen():
            yield {"stage": "received", "incident": input}
            lat, lon = input["lat"], input["lon"]
            if not self._geofence_ok(lat, lon):
                yield {"stage": "geofence_failed"}
                return
            yield {"stage": "geofence_passed"}
            frame = await self._cctv_lookup(lat, lon, input["timestamp"])
            if not frame:
                yield {"stage": "no_cctv"}
                return
            yield {"stage": "cctv_found", "frame": frame}
            genai_ok = await self._genai_validate(frame, input["type"])
            yield {"stage": "genai_result", "ok": genai_ok}
            if not genai_ok:
                return
            ok_final = await self._verify_incident(input)
            yield {"stage": "verified" if ok_final else "duplicate"}

        # Wrap coroutine generator as sync iterator for Agent Engine
        return asyncio.run(_gen())

    def register_operations(self) -> Dict[str, Sequence[str]]:
        """Expose both standard and streaming ops."""
        return {"": ["query"], "stream": ["stream_query"]}

    async def _heartbeat_loop(self):
        while not self._shutdown_event.is_set():
            await asyncio.sleep(30)
            logger.info("Agent heartbeat - waiting for incidents...")


# ──────────────────────────────────────────────────────────────────────────────
#  Local standalone entry-point for IDE testing (not used in deployed agent)
# ──────────────────────────────────────────────────────────────────────────────

async def main():
    import argparse
    import logging

    parser = argparse.ArgumentParser("Run CommuterIncidentAgent locally")
    parser.add_argument("--project", required=True)
    parser.add_argument("--location", default="us-central1")
    args = parser.parse_args()

    agent = CommuterIncidentAgent(project=args.project, location=args.location)
    agent.set_up()

    # Set up signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        logging.info(f"Received signal {signum}, shutting down gracefully...")
        agent._shutdown_event.set()
        agent._running = False

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    timeout_seconds = 300  # 5 minutes for testing
    try:
        await asyncio.wait_for(_main_loop(agent), timeout=timeout_seconds)
    except asyncio.TimeoutError:
        logging.info(f"Agent main loop timed out after {timeout_seconds} seconds.")
    except asyncio.CancelledError:
        logging.info("Main task cancelled")
    except KeyboardInterrupt:
        logging.info("KeyboardInterrupt received, shutting down...")
    finally:
        logging.info("Cleanup completed")

async def _main_loop(agent):
    while agent._running and not agent._shutdown_event.is_set():
        await asyncio.sleep(1)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] {%(name)s:%(lineno)d} %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('agent_debug.log'),
            logging.StreamHandler()
        ]
    )
    logger = logging.getLogger("CIV-Agent")
    logging.getLogger('google.cloud.pubsub_v1.subscriber').setLevel(logging.DEBUG)
    logging.getLogger('google.cloud.pubsub_v1.publisher').setLevel(logging.DEBUG)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Program interrupted by user")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
    finally:
        logging.info("Program terminated")
