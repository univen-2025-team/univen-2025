#!/bin/bash

# Manual verification script for VNStockService changes
# This script tests the Python server integration

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================="
echo "VNStockService Integration Test"
echo "======================================="
echo ""

# Test 1: Check if Python server is configured
echo -e "${YELLOW}Test 1: Checking Python server configuration...${NC}"
if [ -f "python-server/.env" ]; then
    echo -e "${GREEN}✓ python-server/.env exists${NC}"
    if grep -q "VNSTOCK_SOURCE=TCBS" python-server/.env; then
        echo -e "${GREEN}✓ VNSTOCK_SOURCE is set to TCBS${NC}"
    else
        echo -e "${RED}✗ VNSTOCK_SOURCE is not set to TCBS${NC}"
    fi
else
    echo -e "${RED}✗ python-server/.env does not exist${NC}"
fi
echo ""

# Test 2: Check if NestJS server is configured
echo -e "${YELLOW}Test 2: Checking NestJS server configuration...${NC}"
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓ server/.env exists${NC}"
    if grep -q "VNSTOCK_API_URL" server/.env; then
        echo -e "${GREEN}✓ VNSTOCK_API_URL is configured${NC}"
    else
        echo -e "${RED}✗ VNSTOCK_API_URL is not configured${NC}"
    fi
else
    echo -e "${RED}✗ server/.env does not exist${NC}"
fi
echo ""

# Test 3: Check if Next.js is configured
echo -e "${YELLOW}Test 3: Checking Next.js configuration...${NC}"
if [ -f "client-new/.env.local" ]; then
    echo -e "${GREEN}✓ client-new/.env.local exists${NC}"
    if grep -q "PYTHON_SERVER_URL" client-new/.env.local; then
        echo -e "${GREEN}✓ PYTHON_SERVER_URL is configured${NC}"
    else
        echo -e "${RED}✗ PYTHON_SERVER_URL is not configured${NC}"
    fi
else
    echo -e "${RED}✗ client-new/.env.local does not exist${NC}"
fi
echo ""

# Test 4: Check if VNStockService has the new methods
echo -e "${YELLOW}Test 4: Checking VNStockService implementation...${NC}"
if [ -f "server/src/api/services/vnstock.service.ts" ]; then
    if grep -q "testConnection" server/src/api/services/vnstock.service.ts; then
        echo -e "${GREEN}✓ testConnection() method exists${NC}"
    else
        echo -e "${RED}✗ testConnection() method not found${NC}"
    fi
    
    if grep -q "getMarketData" server/src/api/services/vnstock.service.ts; then
        echo -e "${GREEN}✓ getMarketData() method exists${NC}"
    else
        echo -e "${RED}✗ getMarketData() method not found${NC}"
    fi
    
    if grep -q "getStockDetail" server/src/api/services/vnstock.service.ts; then
        echo -e "${GREEN}✓ getStockDetail() method exists${NC}"
    else
        echo -e "${RED}✗ getStockDetail() method not found${NC}"
    fi
    
    if grep -q "pythonServerUrl" server/src/api/services/vnstock.service.ts; then
        echo -e "${GREEN}✓ pythonServerUrl property exists${NC}"
    else
        echo -e "${RED}✗ pythonServerUrl property not found${NC}"
    fi
else
    echo -e "${RED}✗ vnstock.service.ts not found${NC}"
fi
echo ""

# Test 5: Check if Python dependencies are available
echo -e "${YELLOW}Test 5: Checking Python dependencies...${NC}"
if [ -f "python-server/requirements.txt" ]; then
    echo -e "${GREEN}✓ requirements.txt exists${NC}"
    if grep -q "vnstock3" python-server/requirements.txt; then
        echo -e "${GREEN}✓ vnstock3 is listed as dependency${NC}"
    else
        echo -e "${RED}✗ vnstock3 is not listed${NC}"
    fi
else
    echo -e "${RED}✗ requirements.txt not found${NC}"
fi
echo ""

# Test 6: Check if troubleshooting guide exists
echo -e "${YELLOW}Test 6: Checking documentation...${NC}"
if [ -f "TROUBLESHOOTING.md" ]; then
    echo -e "${GREEN}✓ TROUBLESHOOTING.md exists${NC}"
else
    echo -e "${RED}✗ TROUBLESHOOTING.md not found${NC}"
fi
echo ""

# Summary
echo "======================================="
echo -e "${GREEN}Verification Complete!${NC}"
echo "======================================="
echo ""
echo "Next steps:"
echo "1. Start the Python server: cd python-server && ./start.sh"
echo "2. Test health endpoint: curl http://localhost:5000/health"
echo "3. Start NestJS server: cd server && npm run dev"
echo "4. Start Next.js frontend: cd client-new && npm run dev"
echo "5. Visit http://localhost:3000/market"
echo ""
echo "For troubleshooting, see: TROUBLESHOOTING.md"
