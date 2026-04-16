#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — VMware Deployment Script
# Builds and deploys the full stack via Docker Compose
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════"
echo "  SITA OS — VMware Deployment"
echo "═══════════════════════════════════════════════════"

# ── Pre-flight checks ───────────────────────────────────────────

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ Required: $1 is not installed"
    exit 1
  fi
  echo "✅ $1 found"
}

echo ""
echo "📋 Pre-flight checks..."
check_command docker
check_command docker-compose || check_command "docker compose"
check_command node
check_command npm

# ── Environment ─────────────────────────────────────────────────

if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo ""
  echo "⚠️  No .env file found. Creating from template..."
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  echo "📝 Please edit .env with your secrets before continuing."
  echo "   Required: POSTGRES_PASSWORD, JWT_SECRET, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY"
  exit 1
fi

echo "✅ .env file found"

# ── Build Frontend ──────────────────────────────────────────────

echo ""
echo "🔨 Building frontend..."
cd "$PROJECT_DIR"
npm ci --production=false
npx vite build
echo "✅ Frontend built to dist/"

# ── Validate ────────────────────────────────────────────────────

echo ""
echo "🔍 Running validation..."
npx tsx scripts/validate-all.ts
echo "✅ All validators passed"

# ── Deploy ──────────────────────────────────────────────────────

echo ""
echo "🚀 Starting Docker Compose stack..."

if command -v "docker-compose" &>/dev/null; then
  docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d --build
else
  docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d --build
fi

echo ""
echo "⏳ Waiting for services to be healthy..."

# Wait for health checks
MAX_WAIT=120
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  HEALTHY=$(docker ps --filter "health=healthy" --format "{{.Names}}" | wc -l)
  TOTAL=$(docker ps --format "{{.Names}}" | grep "sita-" | wc -l)
  
  if [ "$HEALTHY" -ge "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    echo "✅ All $TOTAL services healthy"
    break
  fi
  
  echo "   $HEALTHY/$TOTAL services healthy (${ELAPSED}s elapsed)..."
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "⚠️  Timeout waiting for all services. Check: docker ps"
fi

# ── Summary ─────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════"
echo "  SITA OS — Deployment Complete"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  🌐 Frontend:     http://localhost:8080"
echo "  🔌 API Gateway:  http://localhost:3000"
echo "  🧠 Brain Core:   http://localhost:3001"
echo "  📡 NATS Monitor: http://localhost:8222"
echo "  🗄️  Supabase:     http://localhost:8000"
echo "  🐘 PostgreSQL:   localhost:5432"
echo ""
echo "  Commands:"
echo "    docker-compose logs -f        # View logs"
echo "    docker-compose ps             # Check status"
echo "    docker-compose down           # Stop all"
echo "    docker-compose down -v        # Stop + remove data"
echo ""
