#!/bin/bash

# Stop all services started by start-all.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping all services...${NC}"
echo ""

# Stop Python server
if [ -f "logs/python-server.pid" ]; then
    PID=$(cat logs/python-server.pid)
    if ps -p $PID > /dev/null; then
        echo -e "${YELLOW}Stopping Python server (PID: $PID)...${NC}"
        kill $PID
        rm logs/python-server.pid
        echo -e "${GREEN}✓ Python server stopped${NC}"
    else
        echo -e "${YELLOW}Python server not running${NC}"
        rm logs/python-server.pid
    fi
fi

# Stop NestJS server
if [ -f "logs/nestjs-server.pid" ]; then
    PID=$(cat logs/nestjs-server.pid)
    if ps -p $PID > /dev/null; then
        echo -e "${YELLOW}Stopping NestJS server (PID: $PID)...${NC}"
        kill $PID
        rm logs/nestjs-server.pid
        echo -e "${GREEN}✓ NestJS server stopped${NC}"
    else
        echo -e "${YELLOW}NestJS server not running${NC}"
        rm logs/nestjs-server.pid
    fi
fi

# Stop Next.js frontend
if [ -f "logs/nextjs-frontend.pid" ]; then
    PID=$(cat logs/nextjs-frontend.pid)
    if ps -p $PID > /dev/null; then
        echo -e "${YELLOW}Stopping Next.js frontend (PID: $PID)...${NC}"
        kill $PID
        rm logs/nextjs-frontend.pid
        echo -e "${GREEN}✓ Next.js frontend stopped${NC}"
    else
        echo -e "${YELLOW}Next.js frontend not running${NC}"
        rm logs/nextjs-frontend.pid
    fi
fi

# Clean up any remaining processes
echo ""
echo -e "${YELLOW}Cleaning up remaining processes...${NC}"
pkill -f "python app.py" 2>/dev/null || true
pkill -f "node.*server.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
