FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps --production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs public

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "run", "start"]
