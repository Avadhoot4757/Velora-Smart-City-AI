from firebase_functions import https_fn
from utils import firebase_auth_api
import os

API_KEY = os.getenv('FIREBASE_API_KEY', 'YOUR_API_KEY')  # Set via environment or config

@https_fn.on_request(region='asia-south1')
def signup(req: https_fn.Request) -> https_fn.Response:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204, headers=headers)

    res = https_fn.Response(headers=headers)

    try:
        if req.method != 'POST':
            res.status = 405
            res.set_json({'error': 'Method not allowed'})
            return res

        request_data = req.get_json()
        provider = request_data.get('provider', 'email')

        if provider == 'email':
            email = request_data.get('email')
            password = request_data.get('password')
            if not email or not password:
                res.status = 400
                res.set_json({'error': 'Email and password are required'})
                return res

            data = {
                'email': email,
                'password': password,
                'returnSecureToken': True
            }
            result = firebase_auth_api('accounts:signUp', data, API_KEY)
            res.status = 201
            res.set_json({'message': 'User created', 'idToken': result['idToken']})

        elif provider == 'google':
            id_token = request_data.get('idToken')
            if not id_token:
                res.status = 400
                res.set_json({'error': 'Google ID token is required'})
                return res

            data = {
                'postBody': f'id_token={id_token}&providerId=google.com',
                'requestUri': 'http://localhost',
                'returnIdToken': True,
                'returnSecureToken': True
            }
            result = firebase_auth_api('accounts:signInWithIdp', data, API_KEY)
            res.status = 201
            res.set_json({'message': 'User signed up with Google', 'idToken': result['idToken']})

        else:
            res.status = 400
            res.set_json({'error': 'Unsupported provider'})
            return res

    except requests.exceptions.RequestException as e:
        res.status = 400
        res.set_json({'error': str(e)})
    except Exception as e:
        res.status = 500
        res.set_json({'error': str(e)})
    return res
