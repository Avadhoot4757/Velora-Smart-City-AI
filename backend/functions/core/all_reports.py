from firebase_functions import https_fn
from core.utils import get_firestore_client

@https_fn.on_request(max_instances=10, region='asia-south1')
def get_all_reports(req: https_fn.Request) -> https_fn.Response:
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204, headers=headers)

    try:
        # Validate request method
        if req.method != 'GET':
            return https_fn.Response(
                json.dumps({'error': 'Method not allowed, use GET'}),
                status=405,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        # Get Firestore client
        db = get_firestore_client()
        
        # Retrieve all reports
        reports_snapshot = db.collection('reports').get()
        reports = [dict(id=doc.id, **doc.to_dict()) for doc in reports_snapshot]
        
        return https_fn.Response(
            json.dumps({"status": "success", "reports": reports}),
            status=200,
            headers={**headers, 'Content-Type': 'application/json'}
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({'error': f'Server error: {str(e)}'}),
            status=500,
            headers={**headers, 'Content-Type': 'application/json'}
        )
