# commuter_rerouter/route_engine.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def compute_reroute(start: str, end: str):
    """
    Uses Google Routes API v2 via REST to compute route.
    """

    try:
        url = f"https://routes.googleapis.com/directions/v2:computeRoutes"

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.routeLabels"
        }

        payload = {
            "origin": {
                "address": start
            },
            "destination": {
                "address": end
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE"
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            print("Failed with status:", response.status_code, response.text)
            return None

        data = response.json()
        polyline = data["routes"][0]["polyline"]["encodedPolyline"]

        # Optional: decode polyline here if you want coordinates
        return {
            "route": polyline,
            "note": "Live route via Routes API v2"
        }

    except Exception as e:
        print("Error computing reroute:", e)
        return None
