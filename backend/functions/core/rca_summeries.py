from firebase_admin import firestore

def get_all_firestore_data():
    db = firestore.client()
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
    return data
