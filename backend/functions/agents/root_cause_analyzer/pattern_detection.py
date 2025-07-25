# pattern_detection.py
import json
from collections import defaultdict
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

def extract_patterns():
    print("Running Pattern Detector...")

    # Load datasets
    failure_logs = load_json("local_data_test/failure_logs.json")
    user_profiles = load_json("local_data_test/user_profiles.json")
    incident_reports = load_json("local_data_test/incident_reports.json")
    reroute_logs = load_json("local_data_test/reroute_logs.json")

    user_map = {u["user_id"]: u for u in user_profiles}
    locality_incidents = defaultdict(list)
    for i in incident_reports:
        locality_incidents[i["locality"].lower()].append(i)

    failure_sentences = [f["details"] for f in failure_logs]
    incident_sentences = [i["type"] for i in incident_reports]

    failure_embs = model.encode(failure_sentences, convert_to_tensor=True)
    incident_embs = model.encode(incident_sentences, convert_to_tensor=True)

    patterns = []

    for i, failure in enumerate(failure_logs):
        sim_scores = util.pytorch_cos_sim(failure_embs[i], incident_embs)[0]
        top_idx = int(sim_scores.argmax())
        matched_incident = incident_reports[top_idx]
        similarity = float(sim_scores[top_idx])

        user_reroutes = [r for r in reroute_logs if r["user_id"] in user_map]
        correlated_reroutes = []

        for reroute in user_reroutes:
            user = user_map.get(reroute["user_id"])
            if user and matched_incident["locality"].lower() in (user["home_locality"].lower(), user["work_locality"].lower()):
                correlated_reroutes.append({
                    "reroute_id": reroute["reroute_id"],
                    "reason": reroute["reason"],
                    "success": reroute["successful"],
                })

        pattern = {
            "log_id": failure["log_id"],
            "error_type": failure["error_type"],
            "failure_details": failure["details"],
            "matched_incident_type": matched_incident["type"],
            "incident_locality": matched_incident["locality"],
            "similarity_score": round(similarity, 3),
            "reroute_patterns": correlated_reroutes,
        }
        patterns.append(pattern)

    print(f"[✓] Detected {len(patterns)} patterns.")
    return patterns
