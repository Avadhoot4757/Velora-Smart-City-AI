import json
from google.cloud import pubsub_v1

PROJECT_ID = "velora-demo"

def publish_test_incident():
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(PROJECT_ID, "incident-upload")
    test_incident = {
        "incidentType": "accident",
        "gcs_uri": "gs://velora-demo-uploads/test_accident.jpg",
        "geolocation": {"latitude": 37.42, "longitude": -122.08},
        "reporter": "test-user-123",
        "timestamp": "2025-07-26T19:00:00Z",
        "reportCount": 1,
        "sensorConfirmed": False,
        "isMajorRoad": True
    }
    data = json.dumps(test_incident).encode("utf-8")
    future = publisher.publish(topic_path, data=data)
    message_id = future.result()
    print(f"Published test incident. Message ID: {message_id}")

if __name__ == "__main__":
    publish_test_incident()
