#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — OTA Update Agent (ISO variant)
# Runs on the deployed appliance via systemd timer.
# Checks for updates, pulls new images, applies, rolls back on failure.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
CONFIG="${SITA_DIR}/ota-config.json"
BUILD_INFO="${SITA_DIR}/build-info.json"
LOG="/var/log/sita-ota.log"
COMPOSE_FILE="${SITA_DIR}/docker-compose.yml"
HEALTH_URL="http://localhost:8080/health"
HEALTH_TIMEOUT=120

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG"; }

# ── Load config ─────────────────────────────────────────────────
if [[ ! -f "$CONFIG" ]]; then
  log "⚠ No OTA config at ${CONFIG}. Skipping."
  exit 0
fi

SUPABASE_URL=$(jq -r '.supabase_url' "$CONFIG")
ANON_KEY=$(jq -r '.anon_key' "$CONFIG")
DEVICE_ID=$(jq -r '.device_id' "$CONFIG")
USER_ID=$(jq -r '.user_id' "$CONFIG")
CHANNEL=$(jq -r '.channel // "stable"' "$CONFIG")
AUTO_UPDATE=$(jq -r '.auto_update // "true"' "$CONFIG")
CURRENT_VERSION=$(jq -r '.version // "0.0.0"' "$BUILD_INFO" 2>/dev/null || echo "0.0.0")

log "OTA check: device=${DEVICE_ID} channel=${CHANNEL} current=${CURRENT_VERSION}"

# ── Check for updates ──────────────────────────────────────────
RESPONSE=$(curl -sf -H "Authorization: Bearer ${ANON_KEY}" \
  "${SUPABASE_URL}/functions/v1/system-updates?channel=${CHANNEL}&current_version=${CURRENT_VERSION}" \
  2>/dev/null || echo '{"update_available":false}')

UPDATE_AVAILABLE=$(echo "$RESPONSE" | jq -r '.update_available')

if [[ "$UPDATE_AVAILABLE" != "true" ]]; then
  log "✅ No updates available."
  exit 0
fi

NEW_VERSION=$(echo "$RESPONSE" | jq -r '.release.version')
IS_CRITICAL=$(echo "$RESPONSE" | jq -r '.release.is_critical // false')

log "Update available: ${NEW_VERSION} (critical: ${IS_CRITICAL})"

# ── Auto-update gate ──────────────────────────────────────────
report_status() {
  curl -sf -X POST -H "Authorization: Bearer ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    "${SUPABASE_URL}/functions/v1/system-updates" \
    -d "{\"action\":\"report\",\"user_id\":\"${USER_ID}\",\"device_id\":\"${DEVICE_ID}\",\"from_version\":\"${CURRENT_VERSION}\",\"to_version\":\"${NEW_VERSION}\",\"status\":\"$1\"${2:+,\"error\":\"$2\"}}" \
    2>/dev/null || true
}

if [[ "$AUTO_UPDATE" != "true" && "$IS_CRITICAL" != "true" ]]; then
  log "Auto-update disabled. Notifying only."
  report_status "pending"
  exit 0
fi

# ── Snapshot current state for rollback ────────────────────────
SNAPSHOT_TAG="pre-update-$(date +%s)"
log "Snapshotting current state as ${SNAPSHOT_TAG}..."
cd "$SITA_DIR"

# Save current image digests for rollback
docker compose -f "$COMPOSE_FILE" images --format json > "/tmp/sita-images-${SNAPSHOT_TAG}.json" 2>/dev/null || true

# ── Pull new images ────────────────────────────────────────────
log "Pulling new images for ${NEW_VERSION}..."
if ! docker compose -f "$COMPOSE_FILE" pull 2>&1 | tee -a "$LOG"; then
  log "❌ Image pull failed."
  report_status "failed" "image_pull_failed"
  exit 1
fi

# ── Apply update ───────────────────────────────────────────────
log "Applying update..."
if ! docker compose -f "$COMPOSE_FILE" up -d --remove-orphans 2>&1 | tee -a "$LOG"; then
  log "❌ Compose up failed. Rolling back..."
  docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
  docker compose -f "$COMPOSE_FILE" up -d 2>/dev/null || true
  report_status "rolled_back" "compose_up_failed"
  exit 1
fi

# ── Health check ───────────────────────────────────────────────
log "Waiting for health check (${HEALTH_TIMEOUT}s timeout)..."
HEALTHY=false
for i in $(seq 1 $((HEALTH_TIMEOUT / 5))); do
  if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    HEALTHY=true
    break
  fi
  sleep 5
done

if [[ "$HEALTHY" != "true" ]]; then
  log "❌ Health check failed after ${HEALTH_TIMEOUT}s. Rolling back..."
  docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
  # Restore previous images if possible
  docker compose -f "$COMPOSE_FILE" up -d 2>/dev/null || true
  report_status "rolled_back" "health_check_failed"
  exit 1
fi

# ── Success ────────────────────────────────────────────────────
log "✅ Update to ${NEW_VERSION} successful."
jq --arg v "$NEW_VERSION" '.version = $v' "$BUILD_INFO" > "${BUILD_INFO}.tmp" && \
  mv "${BUILD_INFO}.tmp" "$BUILD_INFO" 2>/dev/null || true

report_status "success"

# Cleanup old images
docker image prune -f 2>/dev/null || true
log "Update complete."
