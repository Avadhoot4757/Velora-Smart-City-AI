import os
import json
import base64
from datetime import datetime

# Import the web framework and the GCP libraries
from flask import Flask, request
from google.cloud import firestore, aiplatform, bigquery
from geopy.distance import geodesic

# ==============================================================================
# --- 1. AGENT CONFIGURATION ---
# ==============================================================================
# We now read the Project ID from an environment variable set by Cloud Run
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
GCP_REGION = "us-central1"
TEAMS_COLLECTION = "teams-data" # As per your Firestore setup
ACTIVE_INCIDENTS_COLLECTION = "active_incidents"
VERTEX_ENDPOINT_ID = "5511769326669004800" # Your deployed model endpoint

# ==============================================================================
# --- 2. INITIALIZE FLASK APP & CLIENTS ---
# ==============================================================================
# This code runs ONCE when a new Cloud Run instance starts up.
app = Flask(__name__)

print("Initializing GCP clients for new instance...")
# Initialize clients once, globally, to be reused across requests
db_client = firestore.Client(project=PROJECT_ID, database="teams")
bq_client = bigquery.Client(project=PROJECT_ID)
aiplatform.init(project=PROJECT_ID, location=GCP_REGION)
print("Clients initialized successfully.")

# ==============================================================================
# --- 3. CORE LOGIC FUNCTIONS (The Agent's "Skills") ---
# ==============================================================================
# These functions are identical to your working local version.

def score_incident(features):
    print("Executing Skill: Scoring...")
    try:
        endpoint = aiplatform.Endpoint(VERTEX_ENDPOINT_ID)
        prediction = endpoint.predict(instances=[features])
        predicted_score = round(prediction.predictions[0]['value'])
        print(f"SUCCESS: Received AI-Powered Score from Vertex AI: {predicted_score}")
        return predicted_score
    except Exception as e:
        print(f"ERROR: Could not get score from Vertex AI: {e}")
        return 50

def verify_incident(incident_data):
    print("Executing Skill: Verification...")
    incident_type = incident_data.get("incidentType")
    lat = incident_data.get("geolocation", {}).get("latitude")
    lon = incident_data.get("geolocation", {}).get("longitude")
    if not all([incident_type, lat, lon]):
        return True
    
    sql_query = f"""
        SELECT incidentId FROM `{PROJECT_ID}.velora_data.incident_archive`
        WHERE finalStatus = 'resolved' AND incidentType = @incident_type
        AND resolvedAt >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
        AND ST_DWITHIN(ST_GEOGPOINT(longitude, latitude), ST_GEOGPOINT(@lon, @lat), 50)
        LIMIT 1
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("incident_type", "STRING", incident_type),
            bigquery.ScalarQueryParameter("lon", "FLOAT64", lon),
            bigquery.ScalarQueryParameter("lat", "FLOAT64", lat),
        ]
    )
    try:
        print("Querying BigQuery for recent duplicates...")
        query_job = bq_client.query(sql_query, job_config=job_config)
        results = list(query_job.result())
        if len(results) > 0:
            print(f"DUPLICATE FOUND.")
            return False
        else:
            print("No recent duplicates found.")
            return True
    except Exception as e:
        print(f"ERROR: Could not verify incident with BigQuery: {e}")
        return True

def allocate_team(incident_id, incident_data):
    print("Executing Skill: Team Allocation...")
    incident_location = (incident_data["geolocation"]["latitude"], incident_data["geolocation"]["longitude"])
    specialty_map = {
        "fallen_tree": "road_clearance", "accident": "road_clearance",
        "pothole": "road_repair", "waterlogging": "drainage_support", "garbage": "sanitation"
    }
    required_specialty = specialty_map.get(incident_data["incidentType"], "general_support")
    teams_ref = db_client.collection(TEAMS_COLLECTION)
    query = teams_ref.where('status', '==', 'available').where('speciality', '==', required_specialty)
    available_teams = list(query.stream())
    if not available_teams:
        print(f"ALERT: No teams found. Escalating.")
        db_client.collection(ACTIVE_INCIDENTS_COLLECTION).document(incident_id).update({"status": "escalation_required"})
        return None
    closest_team_doc, min_distance = None, float('inf')
    for team_doc in available_teams:
        team_data = team_doc.to_dict()
        team_location = (team_data['currentLocation']['latitude'], team_data['currentLocation']['longitude'])
        distance = geodesic(incident_location, team_location).kilometers
        if distance < min_distance:
            min_distance, closest_team_doc = distance, team_doc
    return closest_team_doc, min_distance

def archive_incident(incident_id, incident_data, score, team_id, team_name):
    print("Executing Skill: Archiving...")
    rows_to_insert = [{
        "incidentId": incident_id, "finalStatus": "dispatched",
        "incidentType": incident_data.get("details", {}).get("incidentType"),
        "latitude": incident_data.get("details", {}).get("geolocation", {}).get("latitude"),
        "longitude": incident_data.get("details", {}).get("geolocation", {}).get("longitude"),
        "severityScore": score, "assignedTeamId": team_id, "assignedTeamName": team_name,
        "createdAt": incident_data.get("createdAt").isoformat(),
        "resolvedAt": datetime.now().isoformat()
    }]
    table_id = f"{PROJECT_ID}.velora_data.incident_archive"
    try:
        errors = bq_client.insert_rows_json(table_id, rows_to_insert)
        if not errors:
            print(f"Successfully archived incident {incident_id} to BigQuery.")
        else:
            print(f"ERROR: Archiving failed: {errors}")
    except Exception as e:
        print(f"CRITICAL ERROR: Could not archive incident: {e}")

def dispatch_team(incident_id, team_doc, distance):
    print("Executing Skill: Dispatch...")
    team_id, team_data = team_doc.id, team_doc.to_dict()
    team_name = team_data.get('teamName', 'Unknown Team')
    print(f"Dispatching team '{team_name}' ({team_id}).")
    batch = db_client.batch()
    incident_ref = db_client.collection(ACTIVE_INCIDENTS_COLLECTION).document(incident_id)
    incident_doc = incident_ref.get()
    if not incident_doc.exists: return
    incident_full_data = incident_doc.to_dict()
    predicted_score = incident_full_data.get("severityScore")
    batch.update(incident_ref, {"status": "dispatched", "assignedTeamId": team_id, "assignedTeamName": team_name})
    team_ref = db_client.collection(TEAMS_COLLECTION).document(team_id)
    batch.update(team_ref, {"status": "engaged"})
    batch.commit()
    print(f"SUCCESS: Team '{team_name}' engaged. Incident dispatched.")
    archive_incident(incident_id, incident_full_data, predicted_score, team_id, team_name)

# ==============================================================================
# --- 4. THE MAIN WEB ENDPOINT (Replaces the 'pull' subscription loop) ---
# ==============================================================================
@app.route("/", methods=["POST"])
def main_workflow():
    """
    This function is the new entry point. It's triggered by an HTTP POST
    request from a Pub/Sub "push" subscription.
    """
    envelope = request.get_json()
    if not envelope or "message" not in envelope:
        print("ERROR: Bad request format.")
        return "Bad Request: Invalid Pub/Sub message format", 400

    # --- Step 1: Ingestion (decoding from the push request) ---
    pubsub_message = envelope["message"]
    incident_data = json.loads(base64.b64decode(pubsub_message["data"]).decode("utf-8"))
    print(f"--- New Incident Received via Push: {incident_data} ---")
    
    # --- Step 2: Verification ---
    if not verify_incident(incident_data):
        print("Outcome: Incident is a duplicate. Acknowledging by success.")
        return "Success", 204 # HTTP 204 means "Success, No Content to Return"

    # --- Step 3: Scoring ---
    now = datetime.now()
    features = {
        "incidentId": "prediction-placeholder",
        "incidentType": str(incident_data.get("incidentType", "unknown")),
        "reportCount": str(incident_data.get("reportCount", 1)),
        "timeOfDay": str(now.hour),
        "dayOfWeek": str(now.isoweekday()),
        "reporterType": "citizen",
        "sensorConfirmed": bool(incident_data.get("sensorConfirmed", False)),
        "isMajorRoad": bool(incident_data.get("isMajorRoad", False)),
        "latitude": float(incident_data.get("geolocation", {}).get("latitude", 0.0)),
        "longitude": float(incident_data.get("geolocation", {}).get("longitude", 0.0))
    }
    predicted_score = score_incident(features)

    # --- Step 4: Persistence ---
    incident_id = f"INC-{int(now.timestamp())}"
    incident_ref = db_client.collection(ACTIVE_INCIDENTS_COLLECTION).document(incident_id)
    incident_ref.set({
        "status": "prioritized", "severityScore": predicted_score,
        "details": incident_data, "createdAt": firestore.SERVER_TIMESTAMP
    })
    print(f"Incident {incident_id} logged to Firestore.")
    
    # --- Step 5: Dispatch ---
    if predicted_score > 50:
        print("Decision: High priority. Attempting dispatch.")
        result = allocate_team(incident_id, incident_data)
        if result:
            closest_team, distance = result
            dispatch_team(incident_id, closest_team, distance)
    else:
        print("Decision: Low priority. Monitoring.")

    # Acknowledge the message by returning a success code
    return "Success", 204

# ==============================================================================
# --- 5. AGENT STARTUP SEQUENCE (For Cloud Run) ---
# ==============================================================================
if __name__ == "__main__":
    # This block is what Cloud Run executes when the container starts.
    # It starts the Flask web server.
    PORT = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=PORT, debug=False)

### **What To Do Now**

'''1.  **Replace** your `main.py` with this new code.
2.  **Update** your `requirements.txt` to include `Flask`.
3.  **Rebuild** your container image:
    ```bash
    gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/velora-agents-repo/agent3-service:v1
    ```
4.  **Redeploy** to Cloud Run:
    ```bash
    gcloud run deploy agent3-service \
      --image us-central1-docker.pkg.dev/$PROJECT_ID/velora-agents-repo/agent3-service:v1 \
      # ... (include all your other flags like --region, --service-account, etc.)
    ```

This new version is structured as a proper web service, which is exactly what Cloud Run needs. It will resolve the "failed to start and listen on port" error.'''
