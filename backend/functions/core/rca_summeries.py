from firebase_functions import https_fn
from .utils import get_firestore_client
import json

@https_fn.on_request(max_instances=10, region='asia-south1')
def get_all_firestore_data(req: https_fn.Request) -> https_fn.Response:
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    if req.method == 'OPTIONS':
        return https_fn.Response('', status=204, headers=headers)

    try:
        # Get Firestore client using utils
        db = get_firestore_client()
        rca_summaries_ref = db.collection('rca_summaries')
        all_summaries = rca_summaries_ref.get()

        data = {
            "summaries": [
                {
                    "id": doc.id,
                    "summary": doc.to_dict().get("summary", ""),
                    "incident_overlap": doc.to_dict().get("incident_overlap", ""),
                    "user_impact": doc.to_dict().get("user_impact", ""),
                    "suggestions": doc.to_dict().get("suggestions", []),
                    "confidence_score": doc.to_dict().get("confidence_score", 0.0)
                }
                for doc in all_summaries
            ]
        }
        
        return https_fn.Response(
            json.dumps(data),
            status=200,
            headers={**headers, 'Content-Type': 'application/json'}
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({'error': f'Server error: {str(e)}'}),
            status=500,
            headers={**headers, 'Content-Type': 'application/json'}
        )