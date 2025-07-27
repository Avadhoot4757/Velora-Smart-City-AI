import functions_framework
import json
import logging
from velora_agents.agent import main as agent_main, ensure_pubsub_resources

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@functions_framework.cloud_event
def velora_agent_pipeline(cloud_event):
    """Cloud Function entry point for Velora Safety Agent Pipeline."""
    try:
        # Ensure Pub/Sub resources are set up
        ensure_pubsub_resources()
        
        # Start the agent pipeline
        logger.info("Starting Velora Safety Agent Pipeline...")
        agent_main()
        
        return {"status": "success", "message": "Agent pipeline started successfully"}
        
    except Exception as e:
        logger.error(f"Error in Velora agent pipeline: {str(e)}")
        raise

# For local testing
if __name__ == "__main__":
    velora_agent_pipeline(None) 