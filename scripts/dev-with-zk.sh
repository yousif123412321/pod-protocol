#!/bin/bash

# PoD Protocol - Development with ZK Compression
# This script starts the full development environment including Photon indexer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting PoD Protocol Development Environment with ZK Compression${NC}"
echo "=================================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    
    # Stop Photon indexer if running
    if [ -f "$HOME/.pod-protocol/photon-indexer/docker-compose.yml" ]; then
        cd "$HOME/.pod-protocol/photon-indexer"
        docker-compose down >/dev/null 2>&1 || true
    fi
    
    # Kill any remaining processes
    pkill -f "anchor test" >/dev/null 2>&1 || true
    pkill -f "solana-test-validator" >/dev/null 2>&1 || true
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Check dependencies
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"

if ! command_exists anchor; then
    echo -e "${RED}❌ Anchor CLI not found. Please install Anchor.${NC}"
    exit 1
fi

if ! command_exists solana; then
    echo -e "${RED}❌ Solana CLI not found. Please install Solana CLI.${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi

if ! command_exists bun; then
    echo -e "${RED}❌ Bun not found. Please install Bun.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"

# Check if we're in the right directory
if [ ! -f "Anchor.toml" ]; then
    echo -e "${RED}❌ Please run this script from the PoD Protocol root directory${NC}"
    exit 1
fi

# Setup Photon indexer if not already done
INDEXER_DIR="$HOME/.pod-protocol/photon-indexer"
if [ ! -d "$INDEXER_DIR" ]; then
    echo -e "${YELLOW}📦 Setting up Photon indexer for first time...${NC}"
    ./scripts/setup-photon-indexer.sh
    
    echo -e "${YELLOW}⚠️  Please configure your Helius API key in: $INDEXER_DIR/.env${NC}"
    echo -e "${YELLOW}⚠️  Then run this script again.${NC}"
    exit 0
fi

# Check if API key is configured
if ! grep -q "HELIUS_API_KEY" "$INDEXER_DIR/.env" || grep -q "your-helius-api-key-here" "$INDEXER_DIR/.env"; then
    echo -e "${YELLOW}⚠️  Please configure your Helius API key in: $INDEXER_DIR/.env${NC}"
    echo -e "${YELLOW}⚠️  Get a free API key at: https://helius.xyz/${NC}"
    exit 0
fi

# Start Photon indexer
echo -e "${YELLOW}🔧 Starting Photon indexer...${NC}"
cd "$INDEXER_DIR"
./start.sh

# Wait for indexer to be ready
echo -e "${YELLOW}⏳ Waiting for Photon indexer to be ready...${NC}"
sleep 15

# Check if indexer is healthy
if curl -s http://localhost:8081/health >/dev/null; then
    echo -e "${GREEN}✅ Photon indexer is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Photon indexer health check failed, continuing anyway...${NC}"
fi

# Go back to project root
cd - >/dev/null

# Configure Solana for local development
echo -e "${YELLOW}⚙️  Configuring Solana for local development...${NC}"
solana config set --url localhost >/dev/null
solana config set --keypair ~/.config/solana/id.json >/dev/null

# Build the program
echo -e "${YELLOW}🔨 Building PoD Protocol program...${NC}"
anchor build

# Start local validator and run tests
echo -e "${YELLOW}🧪 Starting tests with ZK compression support...${NC}"
echo -e "${BLUE}📊 Services will be available at:${NC}"
echo -e "  • Solana Test Validator: http://localhost:8899"
echo -e "  • Photon Indexer API: http://localhost:8080"
echo -e "  • Indexer Metrics: http://localhost:9090"
echo -e "  • Indexer Health: http://localhost:8081"
echo ""

# Function to show real-time logs
show_logs() {
    echo -e "${BLUE}📋 Real-time logs (Ctrl+C to stop):${NC}"
    echo "=================================="
    
    # Show both anchor and indexer logs
    {
        echo "=== ANCHOR LOGS ==="
        anchor test --skip-deploy 2>&1 | while read line; do
            echo "[ANCHOR] $line"
        done
    } &
    
    {
        echo "=== INDEXER LOGS ==="
        cd "$INDEXER_DIR"
        docker-compose logs -f photon-indexer 2>&1 | while read line; do
            echo "[INDEXER] $line"
        done
    } &
    
    wait
}

# Run tests
if [ "$1" = "--logs" ]; then
    show_logs
else
    anchor test --skip-deploy
fi

echo -e "\n${GREEN}🎉 Development environment is running!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Run with ${BLUE}--logs${NC} flag to see real-time logs"
echo -e "  • Check indexer status: ${BLUE}$INDEXER_DIR/status.sh${NC}"
echo -e "  • View indexer logs: ${BLUE}cd $INDEXER_DIR && docker-compose logs -f${NC}"
echo -e "  • Test ZK compression: ${BLUE}bun run test:zk${NC}"
echo ""
echo -e "${YELLOW}🔗 Quick API tests:${NC}"
echo -e "  • Indexer health: ${BLUE}curl http://localhost:8081/health${NC}"
echo -e "  • API status: ${BLUE}curl http://localhost:8080/status${NC}"
echo ""
echo -e "${GREEN}Happy coding with ZK compression! 🚀${NC}"