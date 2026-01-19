FROM python:3.11-slim

WORKDIR /app

# Install system dependencies and mongodump
RUN apt-get update && apt-get install -y wget && \
    wget -q https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.9.3.tgz && \
    tar -xzf mongodb-database-tools-debian12-x86_64-100.9.3.tgz && \
    mv mongodb-database-tools-debian12-x86_64-100.9.3/bin/mongodump /usr/local/bin/ && \
    rm -rf mongodb-database-tools-debian12-x86_64-100.9.3* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-u", "src/main.py"]
