FROM python:3.11-slim

# Install system dependencies needed by pipecat/webrtc
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libssl-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY bot.py .

# Render sets PORT to 10000 and overrides this. Local Docker keeps 7860.
ENV PORT=7860

# Render routes public HTTP to the port in PORT. 10000 is Render's default.
EXPOSE 10000

CMD ["sh", "-c", "exec python bot.py --host 0.0.0.0 --port ${PORT}"]
