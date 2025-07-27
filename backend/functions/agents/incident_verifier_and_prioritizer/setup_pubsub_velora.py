from google.cloud import pubsub_v1

def setup_pubsub_resources():
    PROJECT_ID = "velora-demo"
    publisher = pubsub_v1.PublisherClient()
    subscriber = pubsub_v1.SubscriberClient()
    topics = ["incident-upload", "incident-verification", "incident-severity"]
    subscriptions = [
        ("incident-upload-sub", "incident-upload"),
        ("incident-verification-sub", "incident-verification")
    ]
    print(f"Setting up Pub/Sub resources for project: {PROJECT_ID}")
    for topic_name in topics:
        topic_path = publisher.topic_path(PROJECT_ID, topic_name)
        try:
            publisher.create_topic(request={"name": topic_path})
            print(f"✅ Created topic: {topic_name}")
        except Exception as e:
            print(f"Topic {topic_name} might already exist: {e}")
    for sub_name, topic_name in subscriptions:
        subscription_path = subscriber.subscription_path(PROJECT_ID, sub_name)
        topic_path = publisher.topic_path(PROJECT_ID, topic_name)
        try:
            subscriber.create_subscription(
                request={"name": subscription_path, "topic": topic_path}
            )
            print(f"✅ Created subscription: {sub_name}")
        except Exception as e:
            print(f"Subscription {sub_name} might already exist: {e}")

if __name__ == "__main__":
    setup_pubsub_resources()
