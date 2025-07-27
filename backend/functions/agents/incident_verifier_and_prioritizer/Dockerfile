FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the agent code
COPY velora_agents/ ./velora_agents/
COPY setup_pubsub_velora.py .

# Set environment variables
ENV GOOGLE_CLOUD_PROJECT=velora-demo
ENV GOOGLE_CLOUD_LOCATION=us-central1
ENV GOOGLE_GENAI_USE_VERTEXAI=True

# Expose port
EXPOSE 8080

# Run the agent
CMD ["python", "-m", "velora_agents.agent"] 