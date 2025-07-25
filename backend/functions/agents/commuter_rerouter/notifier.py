# notifier.py
def notify_user(user_id, route, parking, fallback=False):
    parking_suggestion = next((p for p in parking if p["available"] > 0), None)
    return {
        "user_id": user_id,
        "reroute": route,
        "parking_suggestion": parking_suggestion,
        "fallback": fallback
    }
