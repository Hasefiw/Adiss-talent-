#!/bin/bash

##############################################################################
# Addis Talent - Automated Setup Script
# This script handles all setup steps automatically
##############################################################################

set -e  # Exit on any error

echo "=========================================="
echo "🎬 Addis Talent - Automated Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

##############################################################################
# STEP 1: Check Prerequisites
##############################################################################

echo -e "${BLUE}Step 1: Checking Prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm not found. Please install npm.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm found: $NPM_VERSION${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. You can still run npm dev, but Docker Compose won't work.${NC}"
    DOCKER_AVAILABLE=false
else
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker found: $DOCKER_VERSION${NC}"
    DOCKER_AVAILABLE=true
fi

echo ""

##############################################################################
# STEP 2: Install Dependencies
##############################################################################

echo -e "${BLUE}Step 2: Installing Dependencies...${NC}"
echo "Running: npm install"
echo ""

npm install

echo ""
echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
echo ""

##############################################################################
# STEP 3: Setup Environment File
##############################################################################

echo -e "${BLUE}Step 3: Setting Up Environment File...${NC}"

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important: Edit .env and add your API keys:${NC}"
    echo "   - GEMINI_API_KEY (from Google AI Studio)"
    echo "   - TELIBIR_API_KEY (for payments)"
    echo ""
    echo "   For now, we'll use placeholder values for testing."
    echo ""
    
    # Add placeholder values
    sed -i.bak 's/your_gemini_api_key_here/test-gemini-key-12345/' .env
    sed -i.bak 's/your_telibir_api_key_here/test-telibir-key-12345/' .env
    rm -f .env.bak
    
    echo -e "${GREEN}✓ Placeholder API keys added${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""

##############################################################################
# STEP 4: Build TypeScript (Optional)
##############################################################################

echo -e "${BLUE}Step 4: Verifying TypeScript Configuration...${NC}"

if [ -f tsconfig.json ]; then
    echo -e "${GREEN}✓ TypeScript configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript configuration not found${NC}"
fi

echo ""

##############################################################################
# STEP 5: Docker Setup (If Available)
##############################################################################

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "${BLUE}Step 5: Docker Setup...${NC}"
    echo ""
    echo "Would you like to start Docker containers? (y/n)"
    read -r -p "> " DOCKER_CHOICE
    
    if [[ $DOCKER_CHOICE == "y" || $DOCKER_CHOICE == "Y" ]]; then
        echo ""
        echo "Starting Docker containers..."
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✓ Docker containers started!${NC}"
        echo ""
        echo "Waiting for services to be ready (30 seconds)..."
        sleep 30
        
        echo ""
        echo -e "${BLUE}Testing API Health...${NC}"
        
        # Test health endpoint
        HEALTH_RESPONSE=$(curl -s http://localhost:3000/health || echo "failed")
        
        if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
            echo -e "${GREEN}✓ API is healthy!${NC}"
            echo ""
            echo "API Response:"
            echo "$HEALTH_RESPONSE" | jq . 2>/dev/null || echo "$HEALTH_RESPONSE"
        else
            echo -e "${YELLOW}⚠️  API might still be starting. Check logs with:${NC}"
            echo "   docker-compose logs -f api"
        fi
    else
        echo -e "${YELLOW}Skipping Docker startup. You can run it manually with:${NC}"
        echo "   docker-compose up -d"
    fi
else
    echo -e "${YELLOW}Docker not available. Skip to manual setup.${NC}"
fi

echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${GREEN}=========================================="
echo "✅ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "📋 Quick Reference:"
echo ""
echo -e "${BLUE}Start Development Server:${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}Start with Docker:${NC}"
echo "   docker-compose up -d"
echo ""
echo -e "${BLUE}Stop Docker:${NC}"
echo "   docker-compose down"
echo ""
echo -e "${BLUE}View Logs:${NC}"
echo "   docker-compose logs -f api"
echo ""
echo -e "${BLUE}Test API:${NC}"
echo "   curl http://localhost:3000/health"
echo ""
echo -e "${BLUE}API Documentation:${NC}"
echo "   See README.md for complete API endpoints"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Add real API keys to .env"
echo "2. Start the server (npm run dev or docker-compose up -d)"
echo "3. Test endpoints"
echo "4. Deploy when ready!"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
