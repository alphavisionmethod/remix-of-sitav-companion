#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Post-Deployment Smoke Test
# Validates all service endpoints, DB connectivity, and auth flow.
# Usage: ./smoke-test.sh [--host localhost] [--timeout 120]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

HOST="${HOST:-localhost}"
TIMEOUT="${TIMEOUT:-120}"
PASS=0
FAIL=0
WARN=0
RESULTS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)    HOST="$2"; shift 2 ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--host localhost] [--timeout 120]"
      exit 0 ;;
    *) shift ;;
  esac
done

echo "═══════════════════════════════════════════════════════"
echo "  SITA OS — Smoke Test Suite"
echo "  Host: ${HOST}"
echo "═══════════════════════════════════════════════════════"
echo ""

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"

  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" 2>/dev/null || echo "000")

  if [[ "$status" == "$expected" ]]; then
    echo "  ✅ ${name} (HTTP ${status})"
    PASS=$((PASS + 1))
    RESULTS+=("PASS|${name}")
  elif [[ "$status" == "000" ]]; then
    echo "  ❌ ${name} — connection refused"
    FAIL=$((FAIL + 1))
    RESULTS+=("FAIL|${name}|connection refused")
  else
    echo "  ❌ ${name} (HTTP ${status}, expected ${expected})"
    FAIL=$((FAIL + 1))
    RESULTS+=("FAIL|${name}|HTTP ${status}")
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local needle="$3"

  local body
  body=$(curl -sf --connect-timeout 5 --max-time 10 "$url" 2>/dev/null || echo "")

  if echo "$body" | grep -qi "$needle"; then
    echo "  ✅ ${name}"
    PASS=$((PASS + 1))
    RESULTS+=("PASS|${name}")
  else
    echo "  ❌ ${name} — expected '${needle}' not found"
    FAIL=$((FAIL + 1))
    RESULTS+=("FAIL|${name}|missing '${needle}'")
  fi
}

# ── Wait for services ─────────────────────────────────────────
echo "⏳ Waiting for services (max ${TIMEOUT}s)..."
elapsed=0
until curl -sf "http://${HOST}:8080/" > /dev/null 2>&1 || [[ $elapsed -ge $TIMEOUT ]]; do
  sleep 3
  elapsed=$((elapsed + 3))
done

if [[ $elapsed -ge $TIMEOUT ]]; then
  echo "❌ Timeout waiting for services"
  exit 1
fi
echo ""

# ── Frontend ──────────────────────────────────────────────────
echo "▸ Frontend"
check "Web UI" "http://${HOST}:8080/"
check_contains "SPA loads" "http://${HOST}:8080/" "SITA"
echo ""

# ── API Gateway ───────────────────────────────────────────────
echo "▸ API Gateway"
check "API health" "http://${HOST}:3000/health"
echo ""

# ── Brain Core ────────────────────────────────────────────────
echo "▸ Brain Core"
check "Brain health" "http://${HOST}:3001/health"
echo ""

# ── Supabase Kong (API Gateway) ──────────────────────────────
echo "▸ Supabase API (Kong)"
check "Kong root" "http://${HOST}:8000/" "401"
echo ""

# ── Supabase Auth (GoTrue) ───────────────────────────────────
echo "▸ Auth (GoTrue)"
check "Auth health" "http://${HOST}:8000/auth/v1/health"
echo ""

# ── Supabase REST (PostgREST) ────────────────────────────────
echo "▸ REST API (PostgREST)"
check "REST root" "http://${HOST}:8000/rest/v1/" "401"
echo ""

# ── Supabase Realtime ────────────────────────────────────────
echo "▸ Realtime"
check "Realtime health" "http://${HOST}:8000/realtime/v1/"
echo ""

# ── Supabase Storage ─────────────────────────────────────────
echo "▸ Storage"
check "Storage health" "http://${HOST}:8000/storage/v1/" "401"
echo ""

# ── Edge Functions ───────────────────────────────────────────
echo "▸ Edge Functions"
check "Functions runtime" "http://${HOST}:8000/functions/v1/" "401"
echo ""

# ── NATS ─────────────────────────────────────────────────────
echo "▸ NATS JetStream"
check "NATS monitoring" "http://${HOST}:8222/healthz"
echo ""

# ── Database connectivity ────────────────────────────────────
echo "▸ Database"
if docker exec sita-supabase-db pg_isready -U postgres > /dev/null 2>&1; then
  echo "  ✅ PostgreSQL is ready"
  PASS=$((PASS + 1))
  RESULTS+=("PASS|PostgreSQL ready")
else
  echo "  ❌ PostgreSQL is not ready"
  FAIL=$((FAIL + 1))
  RESULTS+=("FAIL|PostgreSQL ready|pg_isready failed")
fi
echo ""

# ── Docker health summary ────────────────────────────────────
echo "▸ Container Health Summary"
docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || \
  docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=sita-" 2>/dev/null || true
echo ""

# ── Results ──────────────────────────────────────────────────
TOTAL=$((PASS + FAIL + WARN))
echo "═══════════════════════════════════════════════════════"
echo "  Results: ${PASS}/${TOTAL} passed, ${FAIL} failed, ${WARN} warnings"
echo "═══════════════════════════════════════════════════════"

if [[ $FAIL -gt 0 ]]; then
  echo ""
  echo "Failed checks:"
  for r in "${RESULTS[@]}"; do
    if [[ "$r" == FAIL* ]]; then
      echo "  • ${r#FAIL|}"
    fi
  done
  exit 1
fi

echo ""
echo "✅ All smoke tests passed — SITA OS is operational"
exit 0
