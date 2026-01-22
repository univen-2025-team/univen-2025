FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for tsx)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Verify server.ts exists and list files for debugging
RUN echo "=== Files in /app ===" && ls -la /app | head -20 && \
    test -f /app/server.ts || (echo "ERROR: server.ts not found!" && exit 1)

# Create necessary directories
RUN mkdir -p logs public

# Expose port
EXPOSE 4000

# Start the server (use npx tsx directly to respect NODE_ENV from environment)
CMD ["npx", "tsx", "./server.ts"]
