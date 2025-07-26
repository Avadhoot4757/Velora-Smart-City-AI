from firebase_admin import initialize_app, firestore, auth, credentials
from firebase_admin.storage import bucket
import os
import json
import requests

# Initialize Firebase app with service account and configuration
cred = credentials.Certificate('service-account.json')
initialize_app(cred, {
    'projectId': 'velora-demo',
    'storageBucket': 'velora-demo.appspot.com',
})

def get_firestore_client():
    # Get Firestore client
    db = firestore.client()
    # Emulator settings are handled via FIRESTORE_EMULATOR_HOST environment variable
    return db

def get_storage_bucket():
    return bucket('velora-demo.appspot.com')

def verify_id_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        print(f"Token verified successfully: {decoded_token}")
        return decoded_token
    except auth.AuthError as e:
        print(f"Token verification failed: {str(e)}")
        return None

def firebase_auth_api(endpoint: str, data: dict):
    firebase_config = os.getenv('FIREBASE_CONFIG')
    if not firebase_config:
        raise ValueError("FIREBASE_CONFIG not set")
    config = json.loads(firebase_config)
    api_key = config.get('velora', {}).get('api_key')
    if not api_key:
        raise ValueError("VELORA_API_KEY not set in Firebase config under velora namespace")
    
    url = f"https://identitytoolkit.googleapis.com/v1/{endpoint}?key={api_key}"
    response = requests.post(url, json=data)
    response.raise_for_status()
    return response.json()
