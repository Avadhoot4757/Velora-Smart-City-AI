from vertexai import agent_engines

PROJECT_ID = "velora-demo"  # Replace with your actual Google Cloud project ID
LOCATION = "us-central1"      # Replace with your actual Google Cloud location

remote = agent_engines.create(
    agent_engine="velora-event-pipeline",
    requirements=[
        "google-cloud-aiplatform[adk,agent_engines]",
        "google-cloud-pubsub",
        "google-cloud-firestore",
        "google-cloud-storage",
        "google-cloud-bigquery",
        "firebase-admin",
        "geopy",
    ],
    extra_packages=["velora_agents/agent_pubsub.py"],
    env_vars={
        "GOOGLE_CLOUD_PROJECT": PROJECT_ID,
        "GOOGLE_CLOUD_LOCATION": LOCATION,
    },
)
print("Deployed AgentEngine resource-id:", remote.name)