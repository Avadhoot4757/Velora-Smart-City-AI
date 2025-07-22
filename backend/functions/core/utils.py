from firebase_admin import initialize_app, firestore, auth, credentials
from firebase_admin.storage import bucket
import os
import requests
import json

cred = credentials.Certificate('/home/avadhoot/projects/Velora-Smart-City-AI/backend/functions/service-account.json')
initialize_app(cred, {
    'projectId': 'velora-demo',
    'storageBucket': 'velora-demo.appspot.com',
})

if os.getenv('FUNCTIONS_EMULATOR') == 'true':
    firestore().settings(host='127.0.0.1:8080', ssl=False)

def get_firestore_client():
    return firestore.client()

def get_storage_bucket():
    return bucket('velora-demo.appspot.com')

def verify_id_token(id_token: str):
    try:
        return auth.verify_id_token(id_token)
    except auth.AuthError:
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
