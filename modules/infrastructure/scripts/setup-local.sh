#!/bin/bash

set -e

# Color output for clarity
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}BruceAI Local Development Setup${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}[1/6]${NC} Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed.${NC}"
    echo "Please install Docker from https://www.docker.com"
    exit 1
fi
echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"
echo ""

# Check if Docker daemon is running
echo -e "${YELLOW}[2/6]${NC} Checking Docker daemon..."
if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker daemon is not running.${NC}"
    echo "Please start Docker and try again."
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"
echo ""

# Check if .env exists; if not, copy from .env.example
echo -e "${YELLOW}[3/6]${NC} Setting up .env file..."
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    if [ -f "$PROJECT_ROOT/infrastructure/.env.example" ]; then
        cp "$PROJECT_ROOT/infrastructure/.env.example" "$PROJECT_ROOT/.env"
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}  Please edit $PROJECT_ROOT/.env with your actual values${NC}"
    else
        echo -e "${RED}ERROR: .env.example not found at $PROJECT_ROOT/infrastructure/.env.example${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

# Start Docker Compose
echo -e "${YELLOW}[4/6]${NC} Starting Docker Compose services..."
cd "$PROJECT_ROOT"
docker-compose -f infrastructure/docker-compose.local.yml up -d --remove-orphans
echo -e "${GREEN}✓ Docker Compose services started${NC}"
echo ""

# Wait for PostgreSQL to be healthy
echo -e "${YELLOW}[5/6]${NC} Waiting for services to be healthy..."
RETRY_COUNT=0
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "  Waiting for PostgreSQL..."
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f infrastructure/docker-compose.local.yml exec -T postgres pg_isready -U bruceai -d bruceai &> /dev/null; then
        echo -e "  ${GREEN}✓ PostgreSQL is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "  ${RED}✗ PostgreSQL failed to become healthy${NC}"
        exit 1
    fi
    sleep $RETRY_INTERVAL
done

echo "  Waiting for Temporal..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f infrastructure/docker-compose.local.yml exec -T temporal tctl --address localhost:7233 cluster health &> /dev/null; then
        echo -e "  ${GREEN}✓ Temporal is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "  ${RED}✗ Temporal failed to become healthy${NC}"
        exit 1
    fi
    sleep $RETRY_INTERVAL
done

echo "  Waiting for Redis..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f infrastructure/docker-compose.local.yml exec -T redis redis-cli ping &> /dev/null; then
        echo -e "  ${GREEN}✓ Redis is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "  ${RED}✗ Redis failed to become healthy${NC}"
        exit 1
    fi
    sleep $RETRY_INTERVAL
done

echo "  Waiting for Qdrant..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf --connect-timeout 2 "http://localhost:6333/readyz" &> /dev/null; then
        echo -e "  ${GREEN}✓ Qdrant is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "  ${RED}✗ Qdrant failed to become healthy${NC}"
        exit 1
    fi
    sleep $RETRY_INTERVAL
done

echo "  Waiting for MinIO..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f infrastructure/docker-compose.local.yml exec -T minio curl -f http://localhost:9000/minio/health/live &> /dev/null; then
        echo -e "  ${GREEN}✓ MinIO is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "  ${RED}✗ MinIO failed to become healthy${NC}"
        exit 1
    fi
    sleep $RETRY_INTERVAL
done
echo ""

# Create MinIO bucket if it doesn't exist
echo -e "${YELLOW}[6/6]${NC} Configuring object storage..."
# Note: MinIO client setup requires additional CLI installation, so we'll document this step
echo -e "${YELLOW}  Note: To create MinIO buckets, run:${NC}"
echo -e "  ${BLUE}docker-compose -f infrastructure/docker-compose.local.yml exec minio mc alias set minio http://localhost:9000 minioadmin minioadmin${NC}"
echo -e "  ${BLUE}docker-compose -f infrastructure/docker-compose.local.yml exec minio mc mb minio/bruceai-artifacts${NC}"
echo ""

# Print success summary
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo -e "  Database (PostgreSQL):  postgresql://bruceai:bruceai@localhost:5432/bruceai"
echo -e "  Database UI (pgAdmin):  http://localhost:5050"
echo -e "  Cache (Redis):          redis://localhost:6379"
echo -e "  Vector DB (Qdrant):     http://localhost:6333"
echo -e "  Temporal:               http://localhost:7233 (gRPC)"
echo -e "  Temporal UI:            http://localhost:8080"
echo -e "  Object Storage (MinIO): http://localhost:9000 (API), http://localhost:9001 (Console)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review and update ${BLUE}$PROJECT_ROOT/.env${NC} with your configuration"
echo -e "  2. Run database migrations: ${BLUE}bash infrastructure/scripts/migrate.sh${NC}"
echo -e "  3. Start your modules with the appropriate PORT from .env"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:     ${BLUE}docker-compose -f infrastructure/docker-compose.local.yml logs -f${NC}"
echo -e "  Stop services: ${BLUE}docker-compose -f infrastructure/docker-compose.local.yml down${NC}"
echo -e "  View status:   ${BLUE}docker-compose -f infrastructure/docker-compose.local.yml ps${NC}"
echo ""
