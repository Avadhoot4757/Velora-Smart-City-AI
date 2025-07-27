from firebase_functions import https_fn
from core.utils import get_firestore_client
from agents.commuter_rerouter.maps_api import get_directions
import pandas as pd
import json
from haversine import haversine, Unit
import warnings
warnings.simplefilter("ignore", UserWarning)

# Load and preprocess crime data once (static for now)
crime_data = pd.read_excel("local_data_test/Copy of South Crime Details.xlsx")
crime_points = list(zip(crime_data['Latitude'], crime_data['Longitude']))
CRIME_RADIUS_KM = 0.25  # 250 meters

def is_safe_point(point, crime_points):
    """Check if a given point is at a safe distance from all crime points."""
    for crime in crime_points:
        distance = haversine(point, crime, unit=Unit.KILOMETERS)
        if distance < CRIME_RADIUS_KM:
            return False
    return True

def filter_safe_steps(route_steps, crime_points):
    """Filter out route steps that pass through unsafe areas."""
    safe_steps = []
    for step in route_steps:
        lat = step['start_location']['lat']
        lng = step['start_location']['lng']
        if is_safe_point((lat, lng), crime_points):
            safe_steps.append(step)
    return safe_steps

@https_fn.on_request(max_instances=10, region='asia-south1')
def get_safe_route(req: https_fn.Request) -> https_fn.Response:
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
        if not request_data or not all(key in request_data for key in ['origin', 'destination']):
            return https_fn.Response(
                json.dumps({'error': 'Missing required parameters: origin, destination'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        origin = request_data['origin']
        destination = request_data['destination']
        if not (isinstance(origin, (list, tuple)) and isinstance(destination, (list, tuple)) and len(origin) == 2 and len(destination) == 2):
            return https_fn.Response(
                json.dumps({'error': 'Origin and destination must be [lat, lng] lists or tuples'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        # Get directions using maps_api
        directions_response = get_directions(origin, destination)
        if not directions_response:
            return https_fn.Response(
                json.dumps({'error': 'Failed to fetch directions'}),
                status=500,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        steps = directions_response[0]['legs'][0]['steps']
        safe_steps = filter_safe_steps(steps, crime_points)

        if not safe_steps:
            return https_fn.Response(
                json.dumps({'error': 'No safe route found. All paths pass through high-crime areas.'}),
                status=404,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        # Return safe route coordinates
        safe_route_coords = [{
            "lat": step["start_location"]["lat"],
            "lng": step["start_location"]["lng"],
            "instruction": step["html_instructions"]
        } for step in safe_steps]

        return https_fn.Response(
            json.dumps({"safe_route": safe_route_coords}),
            status=200,
            headers={**headers, 'Content-Type': 'application/json'}
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({'error': f'Server error: {str(e)}'}),
            status=500,
            headers={**headers, 'Content-Type': 'application/json'}
        )
