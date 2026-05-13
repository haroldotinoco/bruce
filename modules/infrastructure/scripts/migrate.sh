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
MIGRATIONS_DIR="$PROJECT_ROOT/infrastructure/migrations"
COMPOSE_FILE="$PROJECT_ROOT/infrastructure/docker-compose.local.yml"

compose() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Run SQL file: local psql, or psql inside bruceai-postgres when no client on host
run_psql_file() {
    local file="$1"
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -f "$file"
    else
        compose -f "$COMPOSE_FILE" exec -T postgres psql "$DATABASE_URL" -f - < "$file"
    fi
}

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}BruceAI Database Migration${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Load .env from repo root only (see README: cp infrastructure/.env.example .env)
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${RED}ERROR: .env not found at $PROJECT_ROOT/.env${NC}"
    echo "Run setup-local.sh or: cp infrastructure/.env.example .env"
    exit 1
fi

set -a
# shellcheck source=/dev/null
. "$PROJECT_ROOT/.env"
set +a

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
    echo "Please check your .env file"
    exit 1
fi

echo -e "${YELLOW}Database URL: ${BLUE}${DATABASE_URL}${NC}"
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}ERROR: Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    if ! compose -f "$COMPOSE_FILE" exec -T postgres true &> /dev/null; then
        echo -e "${RED}ERROR: psql is not installed and the Postgres container is not running.${NC}"
        echo "Start the stack: ./infrastructure/scripts/setup-local.sh"
        echo "Or install a client: brew install libpq && brew link --force libpq"
        exit 1
    fi
    echo -e "${YELLOW}No local psql — using psql inside Docker (postgres service).${NC}"
fi

echo -e "${YELLOW}Starting database migrations...${NC}"
echo ""

# Get list of migration files sorted by name
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${YELLOW}No migration files found in $MIGRATIONS_DIR${NC}"
    exit 0
fi

# Run each migration file
MIGRATION_COUNT=0
for MIGRATION_FILE in $MIGRATION_FILES; do
    MIGRATION_NAME=$(basename "$MIGRATION_FILE")
    echo -e "${YELLOW}[$(($MIGRATION_COUNT + 1))]${NC} Running: ${BLUE}$MIGRATION_NAME${NC}"

    if run_psql_file "$MIGRATION_FILE" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Success${NC}"
    else
        if run_psql_file "$MIGRATION_FILE" 2>&1 | grep -q "already exists"; then
            echo -e "  ${YELLOW}⚠ Already applied${NC}"
        else
            echo -e "  ${RED}✗ Failed${NC}"
            echo ""
            echo -e "${RED}Error details:${NC}"
            run_psql_file "$MIGRATION_FILE" 2>&1
            exit 1
        fi
    fi

    MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
done

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}All migrations completed successfully!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}Migration Summary:${NC}"
echo -e "  Total migrations run: ${GREEN}$MIGRATION_COUNT${NC}"
echo -e "  Database: ${BLUE}${DATABASE_URL}${NC}"
echo ""
