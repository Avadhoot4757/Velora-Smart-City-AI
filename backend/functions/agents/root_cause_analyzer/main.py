# # main.py
# import json
# from pattern_detection import extract_patterns
# from rca_model import RCAReasoningAgent
# import os
#
# def load_json(path):
#     with open(path, 'r') as f:
#         return json.load(f)
#
# if __name__ == "__main__":
#     print("Running Pattern Detector...")
#     pattern_results = extract_patterns()
#
#     reroute_logs = load_json("local_data_test/reroute_logs.json")
#     incident_reports = load_json("local_data_test/incident_reports.json")
#     user_profiles = load_json("local_data_test/user_profiles.json")
#
#     print("Running RCA Reasoning Agent...")
#     rca_agent = RCAReasoningAgent(
#         pattern_data=pattern_results,
#         reroute_logs=reroute_logs,
#         incident_reports=incident_reports,
#         user_profiles=user_profiles,
#     )
#
#     rca_summary = rca_agent.generate_summary()
#
#     os.makedirs("results", exist_ok=True)
#
#     with open("results/rca_summary.json", "w") as f:
#         json.dump(rca_summary, f, indent=4)
#
#     print("✅ RCA summary saved to 'results/rca_summary.json'")

import asyncio
import platform
from pattern_detection import extract_patterns
from rca_model import RCAReasoningAgent
from firebase_admin import firestore, initialize_app, credentials

# Initialize Firebase Admin SDK
cred = credentials.Certificate("../service-account.json")
initialize_app(cred)
db = firestore.client()

FPS = 60

async def main():
    # setup()  # Initialize any necessary setup
    print("Running Pattern Detector...")
    pattern_results = extract_patterns()

    print("Running RCA Reasoning Agent...")
    rca_agent = RCAReasoningAgent(
        pattern_data=pattern_results,
    )

    rca_summary = rca_agent.generate_summary()

    # Save to Firestore instead of JSON file
    doc_ref = db.collection('rca_summaries').document('latest_summary')
    doc_ref.set({
        "summary": rca_summary.get("summary", ""),
        "incident_overlap": rca_summary.get("incident_overlap", ""),
        "user_impact": rca_summary.get("user_impact", ""),
        "suggestions": rca_summary.get("suggestions", []),
        "confidence_score": rca_summary.get("confidence_score", 0.0)
    })

    print("✅ RCA summary saved to Firestore 'rca_summaries/latest_summary'")

if platform.system() == "Emscripten":
    asyncio.ensure_future(main())
else:
    if __name__ == "__main__":
        asyncio.run(main())
