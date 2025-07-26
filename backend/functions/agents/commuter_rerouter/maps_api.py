import googlemaps
import os
from googlemaps.exceptions import ApiError, TransportError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    gmaps = googlemaps.Client(key=os.environ["GOOGLE_MAPS_API_KEY"])
except KeyError:
    raise Exception("GOOGLE_MAPS_API_KEY environment variable not set")

def get_directions(origin, destination, waypoints=None):
    try:
        return gmaps.directions(
            origin,
            destination,
            waypoints=waypoints,
            mode="driving",
            traffic_model="best_guess",
            departure_time="now"
        )
    except (ApiError, TransportError, ValueError) as e:
        raise Exception(f"Google Maps API error: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error in get_directions: {str(e)}")

def extract_route_info(response):
    try:
        if response and isinstance(response, list) and response[0].get('legs'):
            leg = response[0]['legs'][0]
            return {
                "distance": leg['distance']['text'],
                "duration": leg['duration']['text'],
                "polyline": response[0]['overview_polyline']['points']
            }
        return {}
    except (KeyError, IndexError) as e:
        raise Exception(f"Error parsing Google Maps response: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error in extract_route_info: {str(e)}")
