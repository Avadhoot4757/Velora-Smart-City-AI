# commuter_rerouter/main.py

from route_engine import compute_reroute

if __name__ == "__main__":
    user_start = "Koramangala, Bengaluru"
    user_end = "Indiranagar, Bengaluru"

    reroute = compute_reroute(user_start, user_end)

    print({
        "user_id": "u567",
        "reroute": reroute or "Fallback used",
        "parking_suggestion": {
            "location": [12.9607, 77.5848],
            "available": 5
        },
        "fallback": reroute is None
    })
