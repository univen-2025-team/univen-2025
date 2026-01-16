# Production Dockerfile for Python Server
FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies and uv (ultra-fast pip replacement)
RUN apk add --no-cache gcc musl-dev curl && \
    curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy requirements first for better caching
COPY requirements.txt .

# Use uv instead of pip (10-100x faster)
RUN uv pip install --system --no-cache -r requirements.txt

# Copy application code
COPY . .

# Create vnstock config directory and pre-accept terms
RUN mkdir -p /root/.vnstock/id && \
    echo "Terms accepted automatically for Docker" > /root/.vnstock/id/terms_agreement.txt && \
    echo '{"accepted_agreement": true}' > /root/.vnstock/id/environment.json

# Set environment variable for vnai
ENV ACCEPT_TC="tôi đồng ý"
ENV PYTHONUNBUFFERED=1

# Run the cronjob server
CMD ["python", "app.py"]
