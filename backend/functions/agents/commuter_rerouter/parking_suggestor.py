from firebase_functions import https_fn
from core.utils import get_firestore_client
from haversine import haversine, Unit
import json

@https_fn.on_request(max_instances=10, region='asia-south1')
def suggest_parking(req: https_fn.Request) -> https_fn.Response:
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204, headers=headers)

    try:
        # Validate request method
        if req.method != 'POST':
            return https_fn.Response(
                json.dumps({'error': 'Method not allowed, use POST'}),
                status=405,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        # Parse request data
        request_data = req.get_json(silent=True)
        if not request_data or 'destination' not in request_data:
            return https_fn.Response(
                json.dumps({'error': 'Missing required parameter: destination'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        destination = request_data['destination']
        if not isinstance(destination, (list, tuple)) or len(destination) != 2:
            return https_fn.Response(
                json.dumps({'error': 'Destination must be a [lat, lng] list or tuple'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        dest_point = tuple(destination)  # [lat, lng]

        # Get Firestore client
        db = get_firestore_client()
        
        # Query available parking spots
        parking_ref = db.collection("parking_spots")
        results = parking_ref.where("is_available", "==", True).stream()

        closest_spot = None
        min_distance = float("inf")

        for doc in results:
            data = doc.to_dict()
            park_point = (data["lat"], data["lng"])
            distance = haversine(dest_point, park_point, unit=Unit.METERS)

            if distance < min_distance:
                min_distance = distance
                closest_spot = {
                    "name": data.get("name", "Unnamed"),
                    "location": {
                        "lat": data["lat"],
                        "lng": data["lng"]
                    },
                    "type": data.get("type", "general"),
                    "distance_m": round(distance, 2)
                }

        if closest_spot:
            return https_fn.Response(
                json.dumps({"parking_suggestion": closest_spot}),
                status=200,
                headers={**headers, 'Content-Type': 'application/json'}
            )
        else:
            return https_fn.Response(
                json.dumps({"error": "No available parking spots nearby."}),
                status=404,
                headers={**headers, 'Content-Type': 'application/json'}
            )

    except Exception as e:
        return https_fn.Response(
            json.dumps({'error': f'Server error: {str(e)}'}),
            status=500,
            headers={**headers, 'Content-Type': 'application/json'}
        )
