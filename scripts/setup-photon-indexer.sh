#!/bin/bash

# PoD Protocol - Photon Indexer Setup Script
# This script sets up the Photon indexer for ZK compression with Light Protocol

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PHOTON_VERSION="v1.0.0"
POSTGRES_VERSION="15"
WORKING_DIR="$HOME/.pod-protocol"
INDEXER_DIR="$WORKING_DIR/photon-indexer"
DATABASE_NAME="photon_indexer"
DATABASE_USER="postgres"
DATABASE_PASSWORD="pod_protocol_password"

echo -e "${BLUE}🚀 Setting up Photon Indexer for PoD Protocol ZK Compression${NC}"
echo "=================================================="

# Create working directory
echo -e "${YELLOW}📁 Creating working directory...${NC}"
mkdir -p "$WORKING_DIR"
mkdir -p "$INDEXER_DIR"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install dependencies
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"

# Check Docker
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose
if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if PostgreSQL container is running
echo -e "${YELLOW}🐘 Setting up PostgreSQL database...${NC}"
if [ ! "$(docker ps -q -f name=postgres-photon)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=postgres-photon)" ]; then
        # Cleanup
        docker rm postgres-photon
    fi
    # Run PostgreSQL container
    docker run --name postgres-photon \
        -e POSTGRES_DB="$DATABASE_NAME" \
        -e POSTGRES_USER="$DATABASE_USER" \
        -e POSTGRES_PASSWORD="$DATABASE_PASSWORD" \
        -p 5432:5432 \
        -d postgres:$POSTGRES_VERSION
    
    echo -e "${GREEN}✅ PostgreSQL container started${NC}"
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
else
    echo -e "${GREEN}✅ PostgreSQL container already running${NC}"
fi

# Copy configuration file
echo -e "${YELLOW}📋 Setting up configuration...${NC}"
cp photon-indexer.config.json "$INDEXER_DIR/config.json"

# Update configuration with actual database URL
sed -i "s|postgresql://postgres:password@localhost:5432/photon_indexer|postgresql://$DATABASE_USER:$DATABASE_PASSWORD@localhost:5432/$DATABASE_NAME|g" "$INDEXER_DIR/config.json"

echo -e "${GREEN}✅ Configuration file created at $INDEXER_DIR/config.json${NC}"

# Create Docker Compose file for Photon Indexer
echo -e "${YELLOW}🐳 Creating Docker Compose configuration...${NC}"
cat > "$INDEXER_DIR/docker-compose.yml" << EOF
version: '3.8'

services:
  photon-indexer:
    image: lightprotocol/photon-indexer:$PHOTON_VERSION
    container_name: photon-indexer
    ports:
      - "8080:8080"
      - "9090:9090"
      - "8081:8081"
    environment:
      - DATABASE_URL=postgresql://$DATABASE_USER:$DATABASE_PASSWORD@host.docker.internal:5432/$DATABASE_NAME
      - RPC_URL=https://devnet.helius-rpc.com/?api-key=\${HELIUS_API_KEY}
      - LOG_LEVEL=info
    volumes:
      - ./config.json:/app/config.json:ro
      - photon-data:/app/data
    depends_on:
      - postgres
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"

  postgres:
    image: postgres:$POSTGRES_VERSION
    container_name: postgres-photon
    environment:
      - POSTGRES_DB=$DATABASE_NAME
      - POSTGRES_USER=$DATABASE_USER
      - POSTGRES_PASSWORD=$DATABASE_PASSWORD
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  photon-data:
  postgres-data:
EOF

echo -e "${GREEN}✅ Docker Compose file created${NC}"

# Create environment file
echo -e "${YELLOW}🔐 Creating environment configuration...${NC}"
cat > "$INDEXER_DIR/.env" << EOF
# Helius API Key (required for RPC access)
HELIUS_API_KEY=your-helius-api-key-here

# Database configuration
DATABASE_URL=postgresql://$DATABASE_USER:$DATABASE_PASSWORD@localhost:5432/$DATABASE_NAME

# Light Protocol configuration
LIGHT_PROTOCOL_PROGRAM_ID=HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
EOF

echo -e "${GREEN}✅ Environment file created${NC}"

# Create start script
echo -e "${YELLOW}📝 Creating start script...${NC}"
cat > "$INDEXER_DIR/start.sh" << 'EOF'
#!/bin/bash

set -e

# Check if environment variables are set
if [ -z "$HELIUS_API_KEY" ] || [ "$HELIUS_API_KEY" = "your-helius-api-key-here" ]; then
    echo "❌ Please set your HELIUS_API_KEY in the .env file"
    echo "You can get a free API key at: https://helius.xyz/"
    exit 1
fi

echo "🚀 Starting Photon Indexer..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start services
docker-compose up -d

echo "✅ Photon Indexer started successfully!"
echo ""
echo "📊 Services:"
echo "  - Indexer API: http://localhost:8080"
echo "  - Metrics: http://localhost:9090"
echo "  - Health Check: http://localhost:8081"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "📝 Logs:"
echo "  docker-compose logs -f photon-indexer"
echo ""
echo "🛑 Stop:"
echo "  docker-compose down"
EOF

chmod +x "$INDEXER_DIR/start.sh"

# Create stop script
cat > "$INDEXER_DIR/stop.sh" << 'EOF'
#!/bin/bash

echo "🛑 Stopping Photon Indexer..."
docker-compose down

echo "✅ Photon Indexer stopped"
EOF

chmod +x "$INDEXER_DIR/stop.sh"

# Create status script
cat > "$INDEXER_DIR/status.sh" << 'EOF'
#!/bin/bash

echo "📊 Photon Indexer Status"
echo "======================="

# Check if containers are running
if [ "$(docker ps -q -f name=photon-indexer)" ]; then
    echo "✅ Photon Indexer: Running"
else
    echo "❌ Photon Indexer: Stopped"
fi

if [ "$(docker ps -q -f name=postgres-photon)" ]; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Stopped"
fi

echo ""
echo "🔗 Endpoints:"
echo "  - API: http://localhost:8080"
echo "  - Metrics: http://localhost:9090"
echo "  - Health: http://localhost:8081"

echo ""
echo "📊 Quick Health Check:"
curl -s http://localhost:8081/health || echo "❌ Health check failed"

echo ""
echo "📈 API Status:"
curl -s http://localhost:8080/status || echo "❌ API not responding"
EOF

chmod +x "$INDEXER_DIR/status.sh"

echo -e "${GREEN}✅ Setup scripts created${NC}"

# Create README
echo -e "${YELLOW}📚 Creating documentation...${NC}"
cat > "$INDEXER_DIR/README.md" << 'EOF'
# PoD Protocol Photon Indexer

This directory contains the configuration and scripts for running the Photon Indexer with PoD Protocol's ZK compression features.

## Prerequisites

- Docker and Docker Compose
- Helius API key (free at https://helius.xyz/)

## Quick Start

1. **Configure API Key**:
   ```bash
   # Edit .env file and set your Helius API key
   nano .env
   ```

2. **Start the indexer**:
   ```bash
   ./start.sh
   ```

3. **Check status**:
   ```bash
   ./status.sh
   ```

4. **Stop the indexer**:
   ```bash
   ./stop.sh
   ```

## API Endpoints

- **Indexer API**: http://localhost:8080
- **Metrics**: http://localhost:9090
- **Health Check**: http://localhost:8081

## Common Queries

### Get compressed messages for a channel
```bash
curl "http://localhost:8080/compressed-messages?channel=CHANNEL_PUBKEY&limit=50"
```

### Get channel statistics
```bash
curl "http://localhost:8080/channel-stats/CHANNEL_PUBKEY"
```

### Get compressed participants
```bash
curl "http://localhost:8080/compressed-participants?channel=CHANNEL_PUBKEY"
```

## Monitoring

- View logs: `docker-compose logs -f photon-indexer`
- Metrics: http://localhost:9090/metrics
- Health: http://localhost:8081/health

## Configuration

Main configuration is in `config.json`. Key settings:

- `rpc.url`: Solana RPC endpoint
- `indexer.database_url`: PostgreSQL connection
- `light_protocol.program_ids`: Programs to index
- `compression.enable_batch_compression`: Enable batching

## Troubleshooting

1. **Database connection issues**: Ensure PostgreSQL container is running
2. **RPC issues**: Check your Helius API key
3. **Permission issues**: Ensure scripts have execute permissions

## Development

To modify the indexer configuration:

1. Edit `config.json`
2. Restart the indexer: `./stop.sh && ./start.sh`

For custom queries, see the API documentation at http://localhost:8080/docs
EOF

echo -e "${GREEN}✅ Documentation created${NC}"

echo ""
echo -e "${GREEN}🎉 Photon Indexer setup complete!${NC}"
echo ""
echo -e "${BLUE}📍 Installation location: $INDEXER_DIR${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Get a Helius API key: ${BLUE}https://helius.xyz/${NC}"
echo -e "  2. Edit the .env file: ${BLUE}nano $INDEXER_DIR/.env${NC}"
echo -e "  3. Start the indexer: ${BLUE}cd $INDEXER_DIR && ./start.sh${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  • Check status: ${BLUE}$INDEXER_DIR/status.sh${NC}"
echo -e "  • View logs: ${BLUE}cd $INDEXER_DIR && docker-compose logs -f${NC}"
echo -e "  • Stop indexer: ${BLUE}$INDEXER_DIR/stop.sh${NC}"
echo ""
echo -e "${GREEN}Happy indexing! 🚀${NC}"