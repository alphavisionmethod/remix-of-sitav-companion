#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Secrets Rotation Script
# Generates new secrets, updates .env, and restarts services
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/sita/deploy}"
ENV_FILE="${DEPLOY_DIR}/.env"
LOG_FILE="/var/log/sita-secrets-rotation.log"
BACKUP_DIR="${DEPLOY_DIR}/.env-backups"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

generate_secret() {
  openssl rand -base64 "$1" | tr -d '=/+' | head -c "$1"
}

generate_jwt_secret() {
  openssl rand -base64 48 | tr -d '=/+' | head -c 64
}

# ── Validate environment ─────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  log "❌ .env file not found at $ENV_FILE"
  exit 1
fi

log "═══════════════════════════════════════════════════════"
log "  SITA OS — Secrets Rotation"
log "═══════════════════════════════════════════════════════"

# ── Backup current .env ──────────────────────────────────────
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/.env.$(date -u '+%Y%m%d_%H%M%S')"
cp "$ENV_FILE" "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"
log "[1/5] Backed up current .env to ${BACKUP_FILE}"

# ── Keep only last 10 backups ────────────────────────────────
ls -t "${BACKUP_DIR}"/.env.* 2>/dev/null | tail -n +11 | xargs -r rm -f

# ── Parse which secrets to rotate ────────────────────────────
ROTATE_JWT="${ROTATE_JWT:-true}"
ROTATE_POSTGRES="${ROTATE_POSTGRES:-true}"
ROTATE_SERVICE_KEY="${ROTATE_SERVICE_KEY:-false}"

log "[2/5] Generating new secrets..."

if [ "$ROTATE_POSTGRES" = "true" ]; then
  NEW_PG_PASS="$(generate_secret 48)"
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${NEW_PG_PASS}|" "$ENV_FILE"
  log "  ✅ POSTGRES_PASSWORD rotated"
fi

if [ "$ROTATE_JWT" = "true" ]; then
  NEW_JWT="$(generate_jwt_secret)"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${NEW_JWT}|" "$ENV_FILE"
  log "  ✅ JWT_SECRET rotated"
fi

if [ "$ROTATE_SERVICE_KEY" = "true" ]; then
  log "  ⚠ SUPABASE_SERVICE_KEY rotation requires regenerating JWT — skipping automatic rotation"
  log "  → Generate new keys via supabase dashboard or jwt.io with the new JWT_SECRET"
fi

chmod 600 "$ENV_FILE"
log "[3/5] Secrets written to .env"

# ── Restart affected services ────────────────────────────────
log "[4/5] Restarting affected services..."
cd "$DEPLOY_DIR"

if [ "$ROTATE_POSTGRES" = "true" ]; then
  docker compose restart sita-supabase-db sita-supabase-rest sita-supabase-auth sita-supabase-storage sita-supabase-meta 2>/dev/null || true
  log "  ✅ Database services restarted"
fi

if [ "$ROTATE_JWT" = "true" ]; then
  docker compose restart sita-supabase-kong sita-supabase-auth sita-supabase-rest sita-api-gateway sita-brain-core 2>/dev/null || true
  log "  ✅ Auth/API services restarted"
fi

# ── Audit log entry ──────────────────────────────────────────
log "[5/5] Logging rotation event..."
ROTATED_KEYS=""
[ "$ROTATE_JWT" = "true" ] && ROTATED_KEYS="${ROTATED_KEYS}JWT_SECRET,"
[ "$ROTATE_POSTGRES" = "true" ] && ROTATED_KEYS="${ROTATED_KEYS}POSTGRES_PASSWORD,"

cat >> "$LOG_FILE" << EOF
{
  "event": "secrets_rotation",
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "rotated_keys": "${ROTATED_KEYS%,}",
  "backup_file": "${BACKUP_FILE}",
  "operator": "$(whoami)"
}
EOF

log ""
log "═══════════════════════════════════════════════════════"
log "  ✅ Secrets rotation complete"
log ""
log "  ⚠ If JWT_SECRET was rotated, all existing sessions"
log "    will be invalidated. Users must re-authenticate."
log "═══════════════════════════════════════════════════════"
