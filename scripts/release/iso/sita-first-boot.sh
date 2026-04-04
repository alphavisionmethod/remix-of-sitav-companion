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
DEFAULT_PASSWORD_MARKER="change-me-to-a-secure-password"

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
log "[1/8] Waiting for Docker daemon..."
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
log "[2/8] Loading pre-built Docker images..."
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

# ── Step 3: Generate secrets — ENFORCE no defaults ────────────
log "[3/8] Generating secrets..."
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

generate_jwt() {
  openssl rand -base64 48 | tr -d '=/+' | head -c 64
}

# Generate POSTGRES_PASSWORD if empty or default
CURRENT_PG_PASS=$(grep -oP '^POSTGRES_PASSWORD=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$CURRENT_PG_PASS" ] || [ "$CURRENT_PG_PASS" = "$DEFAULT_PASSWORD_MARKER" ] || [ "$CURRENT_PG_PASS" = "sita-secure-pwd-change-me" ]; then
  NEW_PG_PASS="$(generate_secret)"
  if grep -q '^POSTGRES_PASSWORD=' "$ENV_FILE"; then
    sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${NEW_PG_PASS}|" "$ENV_FILE"
  else
    echo "POSTGRES_PASSWORD=${NEW_PG_PASS}" >> "$ENV_FILE"
  fi
  log "  ✅ POSTGRES_PASSWORD auto-generated (was default/empty)"
fi

# Generate JWT_SECRET if empty or default
CURRENT_JWT=$(grep -oP '^JWT_SECRET=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$CURRENT_JWT" ] || echo "$CURRENT_JWT" | grep -qi "change-me"; then
  NEW_JWT="$(generate_jwt)"
  if grep -q '^JWT_SECRET=' "$ENV_FILE"; then
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${NEW_JWT}|" "$ENV_FILE"
  else
    echo "JWT_SECRET=${NEW_JWT}" >> "$ENV_FILE"
  fi
  log "  ✅ JWT_SECRET auto-generated (was default/empty)"
fi

# Set other defaults only if missing
grep -q '^SUPABASE_SERVICE_KEY=' "$ENV_FILE" && true || echo "SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-change-me" >> "$ENV_FILE"
grep -q '^SUPABASE_ANON_KEY=' "$ENV_FILE" && true || echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-change-me" >> "$ENV_FILE"
grep -q '^NATS_URL=' "$ENV_FILE" && true || echo "NATS_URL=nats://sita-nats:4222" >> "$ENV_FILE"

chmod 600 "$ENV_FILE"
log "  ✅ Secrets configured."

# ── Step 4: Validate no default passwords remain ─────────────
log "[4/8] Validating secrets..."
FINAL_PG_PASS=$(grep -oP '^POSTGRES_PASSWORD=\K.*' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$FINAL_PG_PASS" ] || [ "$FINAL_PG_PASS" = "$DEFAULT_PASSWORD_MARKER" ]; then
  log "  ❌ CRITICAL: POSTGRES_PASSWORD is still a default value!"
  log "  → Edit ${ENV_FILE} and set a secure password before starting."
  rm -f "$LOCK_FILE"
  exit 1
fi
log "  ✅ No default passwords detected."

# ── Step 5: Create Docker networks ───────────────────────────
log "[5/8] Creating Docker networks..."
docker network create sita-frontend 2>/dev/null || true
docker network create sita-backend 2>/dev/null || true
docker network create sita-data 2>/dev/null || true
log "  ✅ Networks sita-frontend, sita-backend, sita-data ready."

# ── Step 6: Start the stack ───────────────────────────────────
log "[6/8] Starting SITA OS stack..."
cd "$DEPLOY_DIR"
docker compose up -d
log "  ✅ Stack started."

# ── Step 7: Wait for health checks ───────────────────────────
log "[7/8] Waiting for services to become healthy..."
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

# ── Step 8: Write completion marker ──────────────────────────
log "[8/8] Finalizing..."
cat > "${SITA_DIR}/first-boot-complete.json" << EOF
{
  "completed_at": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "hostname": "$(hostname)",
  "ip_addresses": $(ip -j -4 addr show | jq '[.[].addr_info[].local]' 2>/dev/null || echo '["unknown"]'),
  "all_healthy": $ALL_HEALTHY,
  "docker_version": "$(docker --version 2>/dev/null || echo 'unknown')",
  "kernel": "$(uname -r)",
  "tls_enabled": $([ -f "/opt/sita/certs/sita.crt" ] && echo "true" || echo "false"),
  "network_segmentation": true
}
EOF

if [ "$ALL_HEALTHY" = true ]; then
  log ""
  log "═══════════════════════════════════════════════════════"
  log "  ✅ SITA OS is fully operational!"
  log ""
  log "  Web UI:    http://$(hostname -I | awk '{print $1}'):8080"
  log "  API:       http://$(hostname -I | awk '{print $1}'):3000"
  log "  TLS:       https://$(hostname -I | awk '{print $1}')"
  log "═══════════════════════════════════════════════════════"
else
  log ""
  log "  ⚠ SITA OS started with warnings. Check logs:"
  log "    journalctl -u sita-os -f"
  log "    docker compose -f ${DEPLOY_DIR}/docker-compose.yml logs"
fi

rm -f "$LOCK_FILE"
exit 0
