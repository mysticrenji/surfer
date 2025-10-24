#!/bin/bash

# Surfer Quick Start Script
# This script helps you get started with Surfer quickly

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   🏄 Surfer Quick Start Setup 🏄      ║"
echo "║   Kubernetes Management UI            ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env

    echo -e "${BLUE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ⚙️  Configuration Required"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"

    echo "Before you can use Surfer, you need to:"
    echo ""
    echo "1. Setup Google OAuth credentials:"
    echo "   - Go to: https://console.cloud.google.com/"
    echo "   - Create OAuth 2.0 credentials"
    echo "   - Add redirect URI: http://localhost:8080/api/v1/auth/google/callback"
    echo ""
    echo "2. Edit the .env file and add your credentials:"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo ""

    read -p "Press Enter after you've configured .env file..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Check if Google OAuth is configured
if grep -q "your-google-client-id" .env; then
    echo -e "${RED}Warning: Google OAuth credentials not configured!${NC}"
    echo "Please edit .env file and add your Google OAuth credentials"
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Generate JWT secret if not set
if grep -q "your-jwt-secret-change-this" .env; then
    echo -e "${YELLOW}Generating JWT secret...${NC}"
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    sed -i "s/your-jwt-secret-change-this/$JWT_SECRET/" .env
    echo -e "${GREEN}✓ JWT secret generated${NC}"
fi

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Starting Surfer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Build and start services
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ Surfer is running!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8080"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Click 'Sign in with Google'"
    echo "   3. After login, you'll need admin approval"
    echo ""
    echo "👤 Create first admin user:"
    echo "   docker-compose exec postgres psql -U surfer -d surfer -c \\"
    echo "   \"UPDATE users SET role='admin', status='approved' WHERE email='your-email@example.com';\""
    echo ""
    echo "📖 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker-compose down"
    echo ""
else
    echo -e "${RED}Error: Failed to start services${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

echo -e "${BLUE}For more information, check the documentation in the docs/ directory${NC}"
