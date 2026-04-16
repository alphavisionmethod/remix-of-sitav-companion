#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — OTA Update Agent
# Checks cloud for updates, downloads, verifies, and applies.
# Runs via systemd timer every 6 hours.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
CONFIG="${SITA_DIR}/ota-config.json"
LOG="/var/log/sita-ota.log"
DOWNLOAD_DIR="/tmp/sita-ota"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG"; }

# Load config
if [[ ! -f "$CONFIG" ]]; then
  log "⚠ No OTA config found at ${CONFIG}. Skipping."
  exit 0
fi

SUPABASE_URL=$(jq -r '.supabase_url' "$CONFIG")
ANON_KEY=$(jq -r '.anon_key' "$CONFIG")
DEVICE_ID=$(jq -r '.device_id' "$CONFIG")
USER_ID=$(jq -r '.user_id' "$CONFIG")
CHANNEL=$(jq -r '.channel // "stable"' "$CONFIG")
AUTO_UPDATE=$(jq -r '.auto_update // "true"' "$CONFIG")
CURRENT_VERSION=$(jq -r '.version // "0.0.0"' "${SITA_DIR}/build-info.json" 2>/dev/null || echo "0.0.0")

log "OTA check: device=${DEVICE_ID} channel=${CHANNEL} current=${CURRENT_VERSION}"

# Check for updates via edge function
RESPONSE=$(curl -sf -H "Authorization: Bearer ${ANON_KEY}" \
  "${SUPABASE_URL}/functions/v1/system-updates?channel=${CHANNEL}&current_version=${CURRENT_VERSION}" \
  2>/dev/null || echo '{"update_available":false}')

UPDATE_AVAILABLE=$(echo "$RESPONSE" | jq -r '.update_available')

if [[ "$UPDATE_AVAILABLE" != "true" ]]; then
  log "✅ No updates available."
  exit 0
fi

NEW_VERSION=$(echo "$RESPONSE" | jq -r '.release.version')
DOWNLOAD_URL=$(echo "$RESPONSE" | jq -r '.release.download_url // empty')
CHECKSUM=$(echo "$RESPONSE" | jq -r '.release.checksum_sha256 // empty')
IS_CRITICAL=$(echo "$RESPONSE" | jq -r '.release.is_critical // false')

log "Update available: ${NEW_VERSION} (critical: ${IS_CRITICAL})"

# If not auto-update and not critical, notify only
if [[ "$AUTO_UPDATE" != "true" && "$IS_CRITICAL" != "true" ]]; then
  log "Auto-update disabled. Sending notification."
  curl -sf -X POST -H "Authorization: Bearer ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    "${SUPABASE_URL}/functions/v1/system-updates" \
    -d "{\"action\":\"report\",\"user_id\":\"${USER_ID}\",\"device_id\":\"${DEVICE_ID}\",\"from_version\":\"${CURRENT_VERSION}\",\"to_version\":\"${NEW_VERSION}\",\"status\":\"pending\"}" \
    2>/dev/null || true
  exit 0
fi

# Download update
if [[ -n "$DOWNLOAD_URL" ]]; then
  mkdir -p "$DOWNLOAD_DIR"
  BUNDLE="${DOWNLOAD_DIR}/sita-update-${NEW_VERSION}.tar.gz"
  
  log "Downloading update bundle..."
  curl -sfL -o "$BUNDLE" "$DOWNLOAD_URL"
  
  # Verify checksum
  if [[ -n "$CHECKSUM" ]]; then
    ACTUAL=$(sha256sum "$BUNDLE" | awk '{print $1}')
    if [[ "$ACTUAL" != "$CHECKSUM" ]]; then
      log "❌ Checksum mismatch! Expected: ${CHECKSUM}, Got: ${ACTUAL}"
      curl -sf -X POST -H "Authorization: Bearer ${ANON_KEY}" \
        -H "Content-Type: application/json" \
        "${SUPABASE_URL}/functions/v1/system-updates" \
        -d "{\"action\":\"report\",\"user_id\":\"${USER_ID}\",\"device_id\":\"${DEVICE_ID}\",\"from_version\":\"${CURRENT_VERSION}\",\"to_version\":\"${NEW_VERSION}\",\"status\":\"failed\",\"error\":\"checksum_mismatch\"}" \
        2>/dev/null || true
      rm -rf "$DOWNLOAD_DIR"
      exit 1
    fi
    log "✅ Checksum verified."
  fi

  # Apply update via sita-update.sh
  log "Applying update..."
  if /opt/sita/sita-update.sh --version "$NEW_VERSION" --images-tar "$BUNDLE"; then
    log "✅ Update to ${NEW_VERSION} successful."
    curl -sf -X POST -H "Authorization: Bearer ${ANON_KEY}" \
      -H "Content-Type: application/json" \
      "${SUPABASE_URL}/functions/v1/system-updates" \
      -d "{\"action\":\"report\",\"user_id\":\"${USER_ID}\",\"device_id\":\"${DEVICE_ID}\",\"from_version\":\"${CURRENT_VERSION}\",\"to_version\":\"${NEW_VERSION}\",\"status\":\"success\"}" \
      2>/dev/null || true
    
    # Update local config
    jq --arg v "$NEW_VERSION" '.version = $v' "${SITA_DIR}/build-info.json" > "${SITA_DIR}/build-info.json.tmp" && \
      mv "${SITA_DIR}/build-info.json.tmp" "${SITA_DIR}/build-info.json" 2>/dev/null || true
  else
    log "❌ Update failed. System may have rolled back."
    curl -sf -X POST -H "Authorization: Bearer ${ANON_KEY}" \
      -H "Content-Type: application/json" \
      "${SUPABASE_URL}/functions/v1/system-updates" \
      -d "{\"action\":\"report\",\"user_id\":\"${USER_ID}\",\"device_id\":\"${DEVICE_ID}\",\"from_version\":\"${CURRENT_VERSION}\",\"to_version\":\"${NEW_VERSION}\",\"status\":\"rolled_back\",\"error\":\"update_script_failed\"}" \
      2>/dev/null || true
  fi
  
  rm -rf "$DOWNLOAD_DIR"
else
  log "No download URL — Docker pull mode."
  if /opt/sita/sita-update.sh --version "$NEW_VERSION"; then
    log "✅ Update to ${NEW_VERSION} successful (pull mode)."
  fi
fi
