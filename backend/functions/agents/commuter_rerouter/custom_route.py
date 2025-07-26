from firebase_functions import https_fn
from core.utils import get_firestore_client
from agents.commuter_rerouter.maps_api import get_directions, extract_route_info
import json

@https_fn.on_request(max_instances=10, region='asia-south1')
def get_custom_route(req: https_fn.Request) -> https_fn.Response:
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204, headers=headers)

    try:
        # Validate request method and data
        if req.method != 'POST':
            return https_fn.Response(
                json.dumps({'error': 'Method not allowed, use POST'}),
                status=405,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        # Parse request data
        request_data = req.get_json()
        if not request_data or not all(key in request_data for key in ['user_id', 'origin', 'destination']):
            return https_fn.Response(
                json.dumps({'error': 'Missing required parameters: user_id, origin, destination'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        user_id = request_data['user_id']
        origin = request_data['origin']
        destination = request_data['destination']

        # Get Firestore client using utils
        db = get_firestore_client()
        
        # Fetch user profile
        profile_ref = db.collection("user_profiles").document(user_id)
        profile = profile_ref.get()
        if not profile.exists:
            return https_fn.Response(
                json.dumps({'error': f'User profile not found for user_id: {user_id}'}),
                status=404,
                headers={**headers, 'Content-Type': 'application/json'}
            )
        
        profile_data = profile.to_dict()
        interests = profile_data.get("interests", [])
        
        # Fetch areas of interest
        aoi_docs = list(db.collection("areas_of_interest").stream())
        matched_areas = [a.to_dict() for a in aoi_docs if a.to_dict().get("type") in interests]
        
        # Limit waypoints to 3
        waypoints = [f"{a['lat']},{a['lon']}" for a in matched_areas][:3]
        
        # Get route information
        response = get_directions(origin, destination, waypoints=waypoints)
        route_info = extract_route_info(response)
        
        return https_fn.Response(
            json.dumps({"route": route_info}),
            status=200,
            headers={**headers, 'Content-Type': 'application/json'}
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({'error': f'Server error: {str(e)}'}),
            status=500,
            headers={**headers, 'Content-Type': 'application/json'}
        )
