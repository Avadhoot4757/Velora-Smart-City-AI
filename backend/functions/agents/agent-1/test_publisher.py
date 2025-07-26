from google.cloud import pubsub_v1
import json
from datetime import datetime
import os

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "velora-by-kshitij")
TOPIC_ID = "CitizenIncidentTopic"

def publish_test_incident():
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

    # Test incident data with a public image URI
    test_incident = {
        "id": "test-img-001",
        "type": "accident",
        "lat": 37.7749,  # San Francisco coordinates
        "lon": -122.4194,
        "timestamp": datetime.now().isoformat(),
        "description": "Test with image for multimodal validation",
        "frame_uri": "https://storage.googleapis.com/cloud-samples-data/vision/using_curl/shanghai.jpeg"
    }

    data = json.dumps(test_incident).encode('utf-8')
    future = publisher.publish(topic_path, data)
    print(f"Published test message: {future.result()}")

if __name__ == "__main__":
    publish_test_incident() 