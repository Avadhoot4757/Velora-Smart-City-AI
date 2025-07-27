import subprocess
import os

def deploy_agent_function():
    PROJECT_ID = "velora-demo"
    REGION = "us-central1"
    FUNCTION_NAME = "velora-agent-pipeline"
    
    print(f"🚀 Deploying Velora Agent as Cloud Function...")
    print(f"Project: {PROJECT_ID}")
    print(f"Region: {REGION}")
    print(f"Function: {FUNCTION_NAME}")
    
    try:
        # Deploy the main agent function
        subprocess.run([
            "gcloud", "functions", "deploy", FUNCTION_NAME,
            "--gen2",
            "--runtime", "python311",
            "--region", REGION,
            "--source", ".",
            "--entry-point", "main",
            "--trigger-topic", "incident-upload",
            "--project", PROJECT_ID,
            "--memory", "2Gi",
            "--timeout", "540s",
            "--max-instances", "10",
            "--set-env-vars", f"GOOGLE_CLOUD_PROJECT={PROJECT_ID},GOOGLE_CLOUD_LOCATION={REGION},GOOGLE_GENAI_USE_VERTEXAI=True"
        ], check=True)
        
        print("✅ Agent Function deployment successful!")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Deployment failed: {e}")
        raise

if __name__ == "__main__":
    deploy_agent_function() 