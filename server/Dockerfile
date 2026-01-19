FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for tsx)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs public

# Expose port
EXPOSE 4000

# Start the server (use npx tsx directly to respect NODE_ENV from environment)
CMD ["npx", "tsx", "server.ts"]
