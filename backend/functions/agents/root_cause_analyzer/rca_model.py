import json
import re
from vertexai import init
from vertexai.generative_models import GenerativeModel, GenerationConfig

# Initialize Vertex AI (do this once per process)
init(project="velora-demo", location="asia-south1")

class RCAReasoningAgent:
    def __init__(self, pattern_data, reroute_logs=None, incident_reports=None, user_profiles=None):
        self.pattern_data = pattern_data or []
        self.reroute_logs = reroute_logs or []
        self.incident_reports = incident_reports or []
        self.user_profiles = user_profiles or []

        self.model = GenerativeModel("gemini-1.5-pro")
        self.generation_config = GenerationConfig(
            temperature=0.4,
            max_output_tokens=1024,
            top_p=1,
            top_k=40,
        )
        self.chat = self.model.start_chat()

    def _build_user_prompt(self):
        prompt = f"""
You are an expert smart-city failure analyst.

Analyze the following data:

--- Pattern Data ---
{json.dumps(self.pattern_data[:3], indent=2)}

--- Reroute Logs ---
{json.dumps(self.reroute_logs[:3], indent=2)}

--- Incident Reports ---
{json.dumps(self.incident_reports[:3], indent=2)}

--- User Profiles ---
{json.dumps(self.user_profiles[:3], indent=2)}

Please respond exactly in this JSON format:
{{
  "summary": "...",
  "incident_overlap": "...",
  "user_impact": "...",
  "suggestions": "...",
  "confidence_score": "..."
}}

Include analysis, overlap detection, affected groups/locations, mitigation advice, and a confidence score (0-1).
"""
        return prompt

    def generate_summary(self):
        prompt = self._build_user_prompt()

        response = self.chat.send_message(
            prompt, generation_config=self.generation_config
        )

        # Extract JSON content from Markdown code block
        response_text = response.text.strip()
        # Remove ```json and ``` markers, and any surrounding whitespace
        json_pattern = r"```json\s*(.*?)\s*```"
        match = re.match(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1)
        else:
            json_content = response_text  # Fallback to raw text if no Markdown

        try:
            result = json.loads(json_content)
        except Exception as e:
            print(f"Failed to parse response as JSON: {str(e)}")
            result = {
                "summary": response_text,
                "incident_overlap": "Unknown",
                "user_impact": "Unknown",
                "suggestions": "Review data for more details.",
                "confidence_score": "0.50",
            }
        return result