from vertexai import init
from vertexai.preview.generative_models import GenerativeModel

# Initialize Vertex AI (update your project and location)
init(project="velora-neha-agent", location="us-central1")

# Try sending a small prompt
model = GenerativeModel("gemini-1.5-pro")
chat = model.start_chat()
response = chat.send_message("Hello, what can you do?")

print(response.text)
