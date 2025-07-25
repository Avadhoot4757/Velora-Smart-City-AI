# firestore_reader.py
def get_verified_incident(incident_id):
    return {
        "id": incident_id,
        "location": [12.9352, 77.6144],
        "severity": 4,
        "category": "traffic_block",
    }

def get_user_profile(user_id):
    return {
        "id": user_id,
        "home": [12.949, 77.642],
        "office": [12.9716, 77.5946],
        "commute_mode": "car",
        "safety_pref": "high",
        "aqi_pref": "medium"
    }

def get_parking_data():
    return [
        {"location": [12.9607, 77.5848], "available": 5},
        {"location": [12.9683, 77.595], "available": 0}
    ]
