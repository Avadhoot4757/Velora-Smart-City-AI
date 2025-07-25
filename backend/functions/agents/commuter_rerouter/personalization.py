# personalization.py
def generate_personalized_route(user, incident):
    # Simulated logic: avoid direct route if severe
    if incident["severity"] > 3:
        return {
            "route": [
                [12.949, 77.642],
                [12.953, 77.630],
                [12.960, 77.610],
                [12.9716, 77.5946]
            ],
            "note": "Avoids traffic zone, optimized for AQI and noise"
        }
    else:
        return None
