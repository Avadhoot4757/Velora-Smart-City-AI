# backend/functions/core/manage_reports.py
from firebase_functions import https_fn
from .utils import get_firestore_client, get_storage_bucket
from google.cloud import storage
import base64
from datetime import datetime

@https_fn.on_call(max_instances=10, region='asia-south1')
def manage_reports(req: https_fn.CallableRequest) -> dict:
    try:
        user_id = req.auth.uid
        if not user_id:
            return {"error": "Unauthorized: No user authenticated"}

        db = get_firestore_client()
        storage_client = get_storage_bucket()

        if req.data.get("method") == "GET":
            reports_snapshot = db.collection('reports').where('userId', '==', user_id).get()
            reports = [dict(id=doc.id, **doc.to_dict()) for doc in reports_snapshot]
            return {"status": "success", "reports": reports}

        elif req.data.get("method") == "POST":
            request_data = req.data
            description = request_data.get('description')
            media = request_data.get('media')
            media_type = request_data.get('mediaType')
            geo_location = request_data.get('geoLocation')
            report_type = request_data.get('reportType')

            if not description or not report_type:
                return {"error": "Description and reportType are required"}

            report_data = {
                'userId': user_id,
                'description': description,
                'reportType': report_type,
                'severity': None,
                'status': 'pending',
                'likes': 0,
                'timestamp': datetime.utcnow().isoformat(),
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
            return {"status": "success", "id": report_ref[1].id, **report_data}

        else:
            return {"error": "Method not allowed"}
    except Exception as e:
        return {"error": f"Server error: {str(e)}"}
