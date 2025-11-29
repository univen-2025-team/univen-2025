#!/bin/bash

# Comprehensive startup script for the univen-2025 project with vnstock integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Univen 2025 - Startup Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# 1. Start Python Server
echo -e "${YELLOW}Starting Python VNStock Server...${NC}"

cd python-server

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
fi

echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -q -r requirements.txt

if port_in_use 5000; then
    echo -e "${YELLOW}⚠ Port 5000 already in use. Skipping Python server start.${NC}"
else
    echo -e "${GREEN}Starting Python server on port 5000...${NC}"
    python app.py > ../logs/python-server.log 2>&1 &
    PYTHON_PID=$!
    echo $PYTHON_PID > ../logs/python-server.pid
    echo -e "${GREEN}✓ Python server started (PID: $PYTHON_PID)${NC}"
fi

cd ..
echo ""

# Wait a bit for Python server to start
sleep 3

# Test Python server
echo -e "${YELLOW}Testing Python server...${NC}"
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✓ Python server is responding${NC}"
else
    echo -e "${YELLOW}⚠ Python server may not be fully ready yet${NC}"
fi
echo ""

# 2. Start NestJS Server
echo -e "${YELLOW}Starting NestJS Server...${NC}"

cd server

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from sample.env...${NC}"
    cp sample.env .env
    echo "VNSTOCK_API_URL=http://localhost:5000" >> .env
fi

if port_in_use 4000; then
    echo -e "${YELLOW}⚠ Port 4000 already in use. Skipping NestJS server start.${NC}"
else
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing NestJS dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}Starting NestJS server on port 4000...${NC}"
    npm run dev > ../logs/nestjs-server.log 2>&1 &
    NESTJS_PID=$!
    echo $NESTJS_PID > ../logs/nestjs-server.pid
    echo -e "${GREEN}✓ NestJS server started (PID: $NESTJS_PID)${NC}"
fi

cd ..
echo ""

# Wait for NestJS server to start
sleep 5

# 3. Start Next.js Frontend
echo -e "${YELLOW}Starting Next.js Frontend...${NC}"

cd client-new

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local...${NC}"
    echo "PYTHON_SERVER_URL=http://localhost:5000" > .env.local
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> .env.local
fi

if port_in_use 3000; then
    echo -e "${YELLOW}⚠ Port 3000 already in use. Skipping Next.js start.${NC}"
else
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing Next.js dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}Starting Next.js frontend on port 3000...${NC}"
    npm run dev > ../logs/nextjs-frontend.log 2>&1 &
    NEXTJS_PID=$!
    echo $NEXTJS_PID > ../logs/nextjs-frontend.pid
    echo -e "${GREEN}✓ Next.js frontend started (PID: $NEXTJS_PID)${NC}"
fi

cd ..
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}All services started successfully!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}Services:${NC}"
echo -e "  • Python VNStock Server: ${BLUE}http://localhost:5000${NC}"
echo -e "  • NestJS Backend:        ${BLUE}http://localhost:4000${NC}"
echo -e "  • Next.js Frontend:      ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}Logs:${NC}"
echo -e "  • Python:  ${BLUE}tail -f logs/python-server.log${NC}"
echo -e "  • NestJS:  ${BLUE}tail -f logs/nestjs-server.log${NC}"
echo -e "  • Next.js: ${BLUE}tail -f logs/nextjs-frontend.log${NC}"
echo ""
echo -e "${YELLOW}To stop all services:${NC}"
echo -e "  ${BLUE}./stop-all.sh${NC}"
echo ""
echo -e "${GREEN}Ready to use! Visit http://localhost:3000/market${NC}"
