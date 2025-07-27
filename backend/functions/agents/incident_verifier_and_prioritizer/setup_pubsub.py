from google.cloud import pubsub_v1
import logging

PROJECT_ID = "velora-demo"

def setup_pubsub_infrastructure():
    publisher = pubsub_v1.PublisherClient()
    subscriber = pubsub_v1.SubscriberClient()
    topics = [
        "incident-upload",
        "incident-verification",
        "incident-severity"
    ]
    for topic_name in topics:
        topic_path = publisher.topic_path(PROJECT_ID, topic_name)
        try:
            publisher.create_topic(request={"name": topic_path})
            print(f"✅ Created topic: {topic_name}")
        except Exception as e:
            print(f"Topic {topic_name} might already exist: {e}")
    print("Pub/Sub infrastructure setup complete!")

if __name__ == "__main__":
    setup_pubsub_infrastructure()
