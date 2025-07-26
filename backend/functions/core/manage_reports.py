from firebase_functions import https_fn
from .utils import get_firestore_client, get_storage_bucket, verify_id_token
from google.cloud import storage
import base64
from datetime import datetime
import json

@https_fn.on_request(max_instances=10, region='asia-south1')
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
        # Verify authentication
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
            res.status = 200
            res.set_json({'reports': reports})
            return res

        elif req.method == 'POST':
            request_data = req.get_json()
            if not request_data:
                res.status = 400
                res.set_json({'error': 'No data provided'})
                return res

            description = request_data.get('description')
            media = request_data.get('media')  # Base64-encoded string
            media_type = request_data.get('mediaType')
            geo_location = request_data.get('geoLocation')
            report_type = request_data.get('reportType')  # Added to store report type

            if not description or not report_type:
                res.status = 400
                res.set_json({'error': 'Description and reportType are required'})
                return res

            # Example: Call agent for severity detection (uncomment if implemented)
            # from agents.commuter_incident_verifier.agent import detect_severity
            # severity = detect_severity(description)

            report_data = {
                'userId': user_id,
                'description': description,
                'reportType': report_type,
                'severity': None,
                'status': 'pending',  # Default status
                'likes': 0,
                'timestamp': datetime.utcnow().isoformat(),  # ISO format for consistency
                'geoLocation': geo_location or None,
            }

            media_url = None
            if media and media_type:
                file_extension = 'jpg' if media_type == 'photo' else 'mp4'
                file_name = f"reports/{user_id}/{datetime.utcnow().timestamp()}.{file_extension}"
                file = storage_client.blob(file_name)
                buffer = base64.b64decode(media)
                content_type = 'image/jpeg' if media_type == 'photo' else 'video/mp4'
                file.upload_from_string(buffer, content_type=content_type)

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
        res.set_json({'error': f'Server error: {str(e)}'})
        return res
