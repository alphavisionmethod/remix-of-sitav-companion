#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — First Boot Script
# Runs once after fresh install to load Docker images and
# start the full SITA OS stack
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
DEPLOY_DIR="${SITA_DIR}/deploy"
IMAGES_DIR="${SITA_DIR}/images"
LOG_FILE="/var/log/sita-first-boot.log"
LOCK_FILE="/var/run/sita-first-boot.lock"
HEALTH_TIMEOUT=120

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

# ── Guard: run only once ──────────────────────────────────────
if [ -f "$LOCK_FILE" ]; then
  log "⚠ First-boot already running or completed. Exiting."
  exit 0
fi
touch "$LOCK_FILE"

log "═══════════════════════════════════════════════════════"
log "  SITA OS — First Boot Provisioning"
log "═══════════════════════════════════════════════════════"

# ── Step 1: Wait for Docker daemon ────────────────────────────
log "[1/7] Waiting for Docker daemon..."
for i in $(seq 1 60); do
  if docker info &>/dev/null; then
    log "  Docker is ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    log "  ❌ Docker failed to start within 60s"
    exit 1
  fi
  sleep 2
done

# ── Step 2: Load pre-built Docker images ──────────────────────
log "[2/7] Loading pre-built Docker images..."
if [ -d "$IMAGES_DIR" ]; then
  for img in "$IMAGES_DIR"/*.tar.gz; do
    if [ -f "$img" ]; then
      log "  Loading $(basename "$img")..."
      docker load < "$img"
    fi
  done
  log "  ✅ All images loaded."
else
  log "  ⚠ No pre-built images found at $IMAGES_DIR — will pull from registry."
fi

# ── Step 3: Generate secrets if not present ───────────────────
log "[3/7] Generating secrets..."
ENV_FILE="${DEPLOY_DIR}/.env"
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "${DEPLOY_DIR}/.env.example" ]; then
    cp "${DEPLOY_DIR}/.env.example" "$ENV_FILE"
  else
    touch "$ENV_FILE"
  fi
fi

generate_secret() {
  openssl rand -base64 32 | tr -d '=/+' | head -c 48
}

# Only set secrets that aren't already configured
grep -q '^JWT_SECRET=' "$ENV_FILE" && true || echo "JWT_SECRET=$(generate_secret)" >> "$ENV_FILE"
grep -q '^POSTGRES_PASSWORD=' "$ENV_FILE" && true || echo "POSTGRES_PASSWORD=$(generate_secret)" >> "$ENV_FILE"
grep -q '^SUPABASE_SERVICE_KEY=' "$ENV_FILE" && true || echo "SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-change-me" >> "$ENV_FILE"
grep -q '^SUPABASE_ANON_KEY=' "$ENV_FILE" && true || echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-change-me" >> "$ENV_FILE"
grep -q '^NATS_URL=' "$ENV_FILE" && true || echo "NATS_URL=nats://sita-nats:4222" >> "$ENV_FILE"

chmod 600 "$ENV_FILE"
log "  ✅ Secrets configured."

# ── Step 4: Create Docker network ─────────────────────────────
log "[4/7] Creating Docker network..."
docker network create sita-net 2>/dev/null || true
log "  ✅ Network sita-net ready."

# ── Step 5: Start the stack ───────────────────────────────────
log "[5/7] Starting SITA OS stack..."
cd "$DEPLOY_DIR"
docker compose up -d
log "  ✅ Stack started."

# ── Step 6: Wait for health checks ───────────────────────────
log "[6/7] Waiting for services to become healthy..."
SERVICES=("8080:Web" "3000:API-Gateway" "3001:Brain-Core" "8000:Kong")
ALL_HEALTHY=true

for svc in "${SERVICES[@]}"; do
  port="${svc%%:*}"
  name="${svc##*:}"
  HEALTHY=false
  for i in $(seq 1 $((HEALTH_TIMEOUT / 2))); do
    if curl -sf "http://localhost:${port}/health" &>/dev/null || \
       curl -sf "http://localhost:${port}/" &>/dev/null; then
      log "  ✅ ${name} (port ${port}) — healthy"
      HEALTHY=true
      break
    fi
    sleep 2
  done
  if [ "$HEALTHY" = false ]; then
    log "  ⚠ ${name} (port ${port}) — not responding after ${HEALTH_TIMEOUT}s"
    ALL_HEALTHY=false
  fi
done

# ── Step 7: Write completion marker ──────────────────────────
log "[7/7] Finalizing..."
cat > "${SITA_DIR}/first-boot-complete.json" << EOF
{
  "completed_at": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "hostname": "$(hostname)",
  "ip_addresses": $(ip -j -4 addr show | jq '[.[].addr_info[].local]' 2>/dev/null || echo '["unknown"]'),
  "all_healthy": $ALL_HEALTHY,
  "docker_version": "$(docker --version 2>/dev/null || echo 'unknown')",
  "kernel": "$(uname -r)"
}
EOF

if [ "$ALL_HEALTHY" = true ]; then
  log ""
  log "═══════════════════════════════════════════════════════"
  log "  ✅ SITA OS is fully operational!"
  log ""
  log "  Web UI:    http://$(hostname -I | awk '{print $1}'):8080"
  log "  API:       http://$(hostname -I | awk '{print $1}'):3000"
  log "  Studio:    http://$(hostname -I | awk '{print $1}'):3100"
  log "═══════════════════════════════════════════════════════"
else
  log ""
  log "  ⚠ SITA OS started with warnings. Check logs:"
  log "    journalctl -u sita-os -f"
  log "    docker compose -f ${DEPLOY_DIR}/docker-compose.yml logs"
fi

rm -f "$LOCK_FILE"
exit 0
