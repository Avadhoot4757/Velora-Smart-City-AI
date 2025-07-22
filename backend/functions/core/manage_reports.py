from firebase_functions import https_fn
from .utils import get_firestore_client, get_storage_bucket, verify_id_token
from google.cloud import storage
import base64
from datetime import datetime

@https_fn.on_request(region='asia-south1')
def manage_reports(req: https_fn.Request) -> https_fn.Response:
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204, headers=headers)

    res = https_fn.Response(headers=headers)

    try:
        auth_header = req.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            res.status = 401
            res.set_json({'error': 'Unauthorized: No token provided'})
            return res

        id_token = auth_header.split('Bearer ')[1]
        decoded_token = verify_id_token(id_token)
        if not decoded_token:
            res.status = 401
            res.set_json({'error': 'Unauthorized: Invalid token'})
            return res

        user_id = decoded_token['uid']

        db = get_firestore_client()
        storage_client = get_storage_bucket()

        if req.method == 'GET':
            reports_snapshot = db.collection('reports').where('userId', '==', user_id).get()
            reports = [dict(id=doc.id, **doc.to_dict()) for doc in reports_snapshot]
            res.set_json({'reports': reports})
            return res

        elif req.method == 'POST':
            request_data = req.get_json()
            description = request_data.get('description')
            media = request_data.get('media')
            media_type = request_data.get('mediaType')
            geo_location = request_data.get('geoLocation')

            if not description:
                res.status = 400
                res.set_json({'error': 'Description is required'})
                return res

            # Example: Call agent for severity detection
            # from agents.commuter_incident_verifier.agent import detect_severity  # Placeholder import
            # severity = detect_severity(description)  # Example call to agent

            report_data = {
                'userId': user_id,
                'description': description,
                'severity': None,
                'status': None,
                'likes': 0,
                'timestamp': datetime.utcnow(),
                'geoLocation': geo_location,
            }

            media_url = None
            if media and media_type:
                file_name = f"{user_id}/{datetime.utcnow().timestamp()}.{media_type}"
                file = storage_client.blob(file_name)
                buffer = base64.b64decode(media)
                file.upload_from_string(buffer, content_type=f'image/jpeg' if media_type == 'photo' else 'video/mp4')

                media_url = file.generate_signed_url(expiration=datetime(2030, 1, 1))
                report_data['mediaUrl'] = media_url

            report_ref = db.collection('reports').add(report_data)
            res.status = 201
            res.set_json({'id': report_ref[1].id, **report_data})
            return res

        else:
            res.status = 405
            res.set_json({'error': 'Method not allowed'})
            return res

    except Exception as e:
        res.status = 500
        res.set_json({'error': str(e)})
        return res
