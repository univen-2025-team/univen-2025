#!/bin/bash

# Deploy script for Univen 2025 (Backend Only)

echo "Starting deployment..."

# Pull updates usually handled by git pull before running this script
# git pull

# Build and Start Services using the Production Compose File
echo "Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

# Prune unused images to save space
echo "Cleaning up..."
docker image prune -f

echo "Deployment completed!"
echo "Check logs with: docker compose -f docker-compose.prod.yml logs -f"
