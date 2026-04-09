#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — OTA Update Agent (Docker Deploy Context)
# Checks for container image updates and applies them.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
CONFIG_FILE="${SITA_DIR}/ota-config.json"
LOG_FILE="/var/log/sita-ota.log"
LOCK_FILE="/tmp/sita-ota.lock"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" >> "$LOG_FILE"; }

# Prevent concurrent runs
if [ -f "$LOCK_FILE" ]; then
  LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if kill -0 "$LOCK_PID" 2>/dev/null; then
    log "OTA already running (PID $LOCK_PID). Exiting."
    exit 0
  fi
fi
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

if [ ! -f "$CONFIG_FILE" ]; then
  log "No OTA config found at ${CONFIG_FILE}. Skipping."
  exit 0
fi

SUPABASE_URL=$(jq -r '.supabase_url // empty' "$CONFIG_FILE")
ANON_KEY=$(jq -r '.anon_key // empty' "$CONFIG_FILE")
DEVICE_ID=$(jq -r '.device_id // empty' "$CONFIG_FILE")
CURRENT_VERSION=$(jq -r '.current_version // "0.0.0"' "$CONFIG_FILE")

if [ -z "$SUPABASE_URL" ] || [ -z "$ANON_KEY" ] || [ -z "$DEVICE_ID" ]; then
  log "Missing config values. Skipping OTA check."
  exit 0
fi

log "Checking for updates (current: ${CURRENT_VERSION})..."

RESPONSE=$(curl -sf \
  -X POST "${SUPABASE_URL}/functions/v1/os-status" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "{\"action\":\"check-update\",\"device_id\":\"${DEVICE_ID}\",\"current_version\":\"${CURRENT_VERSION}\"}" \
  2>/dev/null || echo "{}")

NEW_VERSION=$(echo "$RESPONSE" | jq -r '.new_version // empty' 2>/dev/null)
IMAGE_TAG=$(echo "$RESPONSE" | jq -r '.image_tag // empty' 2>/dev/null)

if [ -z "$NEW_VERSION" ] || [ "$NEW_VERSION" = "$CURRENT_VERSION" ]; then
  log "No update available."
  exit 0
fi

log "Update available: ${CURRENT_VERSION} → ${NEW_VERSION} (image: ${IMAGE_TAG})"

# Pull new image
if docker pull "${IMAGE_TAG}" 2>>"$LOG_FILE"; then
  log "Image pulled successfully."
else
  log "Failed to pull image. Aborting update."
  exit 1
fi

# Rolling restart
cd "$SITA_DIR"
if docker compose up -d --no-deps --build 2>>"$LOG_FILE"; then
  log "Containers updated successfully."
  jq ".current_version = \"${NEW_VERSION}\"" "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
  log "Version updated to ${NEW_VERSION}."
else
  log "Update failed. Rolling back..."
  docker compose down 2>>"$LOG_FILE" || true
  docker compose up -d 2>>"$LOG_FILE" || true
  log "Rollback attempted."
  exit 1
fi

log "OTA update complete."
