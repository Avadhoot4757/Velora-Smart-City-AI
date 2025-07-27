import os
import time
import vertexai
from vertexai.preview.reasoning_engines import Agent

def deploy_velora_agent():
    PROJECT_ID = "velora-demo"
    LOCATION = "us-central1"
    STAGING_BUCKET = "gs://velora-demo-staging"
    vertexai.init(
        project=PROJECT_ID,
        location=LOCATION,
        staging_bucket=STAGING_BUCKET
    )
    from velora_agents.agent import root_agent
    try:
        print("Starting deployment to Vertex AI Agent Engine...")
        print(f"Project: {PROJECT_ID}")
        print(f"Region: {LOCATION}")
        
        # Create the agent using the current vertexai API
        remote_agent = Agent.create(
            root_agent,
            requirements="requirements.txt",
            env_vars={
                "GOOGLE_CLOUD_PROJECT": PROJECT_ID,
                "GOOGLE_CLOUD_LOCATION": LOCATION,
                "GOOGLE_GENAI_USE_VERTEXAI": "True"
            },
            display_name="Velora Safety Agent Pipeline",
            description="Event-driven safety incident processing with Pub/Sub integration for velora-demo",
            gcs_dir_name=f"velora-deployment-{int(time.time())}"
        )
        print(f"✅ Deployment successful!")
        print(f"Agent Resource ID: {remote_agent.resource_name}")
        print(f"Agent Display Name: {remote_agent.display_name}")
        return remote_agent
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        raise

if __name__ == "__main__":
    deployed_agent = deploy_velora_agent()
