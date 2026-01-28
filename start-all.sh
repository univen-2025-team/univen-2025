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

# Function to kill process on a port (Windows/Git Bash compatible)
kill_port() {
    local port=$1
    # Try to find and kill process on port (works on both Linux and Windows Git Bash)
    if command_exists lsof; then
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Killing process on port $port (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            sleep 1
        fi
    fi
}

# Function to stop service if PID file exists
stop_service_if_running() {
    local pid_file=$1
    local service_name=$2
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null)
        if [ ! -z "$pid" ] && ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping existing $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            rm -f "$pid_file"
            sleep 1
        else
            rm -f "$pid_file"
        fi
    fi
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
# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    echo -e "${YELLOW}Creating logs directory...${NC}"
    mkdir -p logs
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Stop any existing services first
echo -e "${YELLOW}Checking for existing services...${NC}"
stop_service_if_running "logs/python-server.pid" "Python server"
stop_service_if_running "logs/nestjs-server.pid" "NestJS server"
stop_service_if_running "logs/nextjs-frontend.pid" "Next.js frontend"

# Kill processes on ports if needed
kill_port 5000
kill_port 4000
kill_port 3000

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
pip install -q -r requirements.txt --upgrade numpy

if port_in_use 5000; then
    echo -e "${YELLOW}⚠ Port 5000 already in use. Attempting to kill existing process...${NC}"
    kill_port 5000
    sleep 2
fi

echo -e "${GREEN}Starting Python server on port 5000...${NC}"
python app.py > ../logs/python-server.log 2>&1 &
PYTHON_PID=$!
echo $PYTHON_PID > ../logs/python-server.pid
sleep 2
if ps -p $PYTHON_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Python server started (PID: $PYTHON_PID)${NC}"
else
    echo -e "${RED}✗ Python server failed to start. Check logs/python-server.log${NC}"
fi

cd ..
echo ""

# Wait a bit for Python server to start
sleep 3

# Note: Python server is a cronjob service, not a Flask API server
# It caches data to MongoDB which NestJS reads from
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
    echo -e "${YELLOW}⚠ Port 4000 already in use. Attempting to kill existing process...${NC}"
    kill_port 4000
    sleep 2
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing NestJS dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}Starting NestJS server on port 4000...${NC}"
npm run dev > ../logs/nestjs-server.log 2>&1 &
NESTJS_PID=$!
echo $NESTJS_PID > ../logs/nestjs-server.pid
sleep 3
if ps -p $NESTJS_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓ NestJS server started (PID: $NESTJS_PID)${NC}"
else
    echo -e "${RED}✗ NestJS server failed to start. Check logs/nestjs-server.log${NC}"
fi

cd ..
echo ""

# Wait for NestJS server to start
sleep 5

# 3. Start Next.js Frontend
echo -e "${YELLOW}Starting Next.js Frontend...${NC}"

cd client

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local...${NC}"
    echo "PYTHON_SERVER_URL=http://localhost:5000" > .env.local
    echo "NEXT_PUBLIC_API_URL=https://univen-1111-api.duckdns.org/v1/api" >> .env.local
fi

if port_in_use 3000; then
    echo -e "${YELLOW}⚠ Port 3000 already in use. Attempting to kill existing process...${NC}"
    kill_port 3000
    sleep 2
fi

# Clean Next.js lock file if exists
if [ -f ".next/dev/lock" ]; then
    echo -e "${YELLOW}Removing Next.js lock file...${NC}"
    rm -f .next/dev/lock
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Next.js dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}Starting Next.js frontend on port 3000...${NC}"
npm run dev > ../logs/nextjs-frontend.log 2>&1 &
NEXTJS_PID=$!
echo $NEXTJS_PID > ../logs/nextjs-frontend.pid
sleep 3
if ps -p $NEXTJS_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Next.js frontend started (PID: $NEXTJS_PID)${NC}"
else
    echo -e "${RED}✗ Next.js frontend failed to start. Check logs/nextjs-frontend.log${NC}"
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
