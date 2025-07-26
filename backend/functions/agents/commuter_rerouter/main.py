from firebase_functions import https_fn
from agents.commuter_rerouter.fastest_route import get_fastest_route
from agents.commuter_rerouter.eco_route import get_eco_friendly_route
from agents.commuter_rerouter.custom_route import get_custom_route
import json

@https_fn.on_request(max_instances=10, region='asia-south1')
def reroute_handler(req: https_fn.Request) -> https_fn.Response:
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
        if not request_data or not all(key in request_data for key in ['user_id', 'origin', 'destination', 'route_type']):
            return https_fn.Response(
                json.dumps({'error': 'Missing required fields: user_id, origin, destination, route_type'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        user_id = request_data['user_id']
        origin = request_data['origin']
        destination = request_data['destination']
        route_type = request_data['route_type']

        # Route to appropriate function based on route_type
        if route_type == 'fastest':
            route_info = get_fastest_route(user_id, origin, destination)
        elif route_type == 'eco':
            route_info = get_eco_friendly_route(user_id, origin, destination)
        elif route_type == 'custom':
            route_info = get_custom_route(user_id, origin, destination)
        else:
            return https_fn.Response(
                json.dumps({'error': f'Invalid route_type: {route_type}'}),
                status=400,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        return https_fn.Response(
            json.dumps({'route': route_info}),
            status=200,
            headers={**headers, 'Content-Type': 'application/json'}
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({'error': f'Server error: {str(e)}'}),
            status=500,
            headers={**headers, 'Content-Type': 'application/json'}
        )
