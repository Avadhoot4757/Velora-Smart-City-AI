#!/bin/bash
PROJECT_ID="velora-demo"
REGION="us-central1"
echo "Deploying Verifier Agent Cloud Function..."
cd verifier_function
gcloud functions deploy verifier-agent \
    --gen2 \
    --runtime=python311 \
    --region=$REGION \
    --source=. \
    --entry-point=process_incident_upload \
    --trigger-topic=incident-upload \
    --project=$PROJECT_ID \
    --memory=1Gi \
    --timeout=540s \
    --max-instances=10
cd ../severity_function
echo "Deploying Severity Agent Cloud Function..."
gcloud functions deploy severity-agent \
    --gen2 \
    --runtime=python311 \
    --region=$REGION \
    --source=. \
    --entry-point=process_incident_verification \
    --trigger-topic=incident-verification \
    --project=$PROJECT_ID \
    --memory=1Gi \
    --timeout=540s \
    --max-instances=10
echo "Deployment complete!"
