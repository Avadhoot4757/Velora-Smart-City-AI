# deploy.py
"""
Deploys the CommuterIncidentAgent to Vertex AI Agent Engine & Agent Garden.

Pre-requisites:
- Google Cloud project created with billing enabled.
- Required enabled.
- Service account 'agent-engine-deployer' created with proper roles.
- Python virtual environment activated with required packages installed.
- Cloud Storage bucket created for staging (see STAGING_BUCKET).
- agent1.py is in the same directory and contains CommuterIncidentAgent class.
"""

import os
import pickle
from vertexai import agent_engines
from vertexai.preview import reasoning_engines
import vertexai

from agent1 import CommuterIncidentAgent  # Your agent class


def main():
    # ===== CONFIGURE THESE VALUES ===========================
    PROJECT_ID = "velora-by-kshitij"                     # Your GCP project ID
    REGION = "us-central1"                               # GCP region
    STAGING_BUCKET = f"gs://{PROJECT_ID}-agent-engine"   # Cloud Storage staging bucket
    AGENT_DISPLAY_NAME = "Commuter Incident Verifier"   # Agent display name in Vertex AI
    # ========================================================

    # Initialize Vertex AI with proper project, region, and staging bucket
    vertexai.init(project=PROJECT_ID, location=REGION, staging_bucket=STAGING_BUCKET)

    # Instantiate your agent with lightweight constructor params only
    root_agent = CommuterIncidentAgent(
        project=PROJECT_ID,
        location=REGION,
        gemini_model="gemini-1.5-flash",  # Adjust if you want a different model
    )

    # Wrap the agent in the ADK's AdkApp wrapper for tracing & integration
    app = reasoning_engines.AdkApp(
        agent=root_agent,
        enable_tracing=True,  # Enables Cloud Trace integration
    )

    print("Starting deployment... This might take several minutes.")

    # Deploy the agent engine with:
    # - ADK wrapped app pickled and uploaded
    # - requirements.txt file in same folder uploaded & installed
    # - NO reserved environment variables to avoid conflicts
    remote_app = agent_engines.create(
        agent_engine=app,
        display_name=AGENT_DISPLAY_NAME,
        requirements="requirements.txt",  # Ensure this file exists in this folder
        extra_packages=[],                 # Add wheels if needed, else []
        # If you need custom variables, use non-reserved names, for example:
        # env_vars={
        #     "CUSTOM_PROJECT": PROJECT_ID,
        #     "DEPLOY_REGION": REGION,
        # }
    )

    print(f"Deployment complete.\nAgent Resource Name: {remote_app.resource_name}")

    print("\n--- Post-deployment Instructions ---")
    print("1. Grant the Vertex AI Runtime service agent the necessary role:")
    print("   Replace PROJECT_NUMBER with your project number (find with `gcloud projects describe`):\n")
    print(f"   gcloud projects add-iam-policy-binding {PROJECT_ID} "
          "--member='serviceAccount:service-PROJECT_NUMBER@gcp-sa-aiplatform-gae.iam.gserviceaccount.com' "
          "--role='roles/aiplatform.re.serviceAgent'")
    print("\n2. Verify deployment by visiting Google Cloud Console > Vertex AI > Agent Engine.")
    print("3. Share your agent to Agent Garden if desired.\n")


if __name__ == "__main__":
    main()
