#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — First Boot Setup (Docker Deploy Context)
# Runs once on initial deployment to configure the system.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
CONFIG_FILE="${SITA_DIR}/ota-config.json"
MARKER="${SITA_DIR}/.first-boot-done"
LOG_FILE="/var/log/sita-first-boot.log"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

if [ -f "$MARKER" ]; then
  log "First boot already completed. Skipping."
  exit 0
fi

log "═══ SITA OS First Boot ═══"

# Create required directories
mkdir -p "${SITA_DIR}/certs" "${SITA_DIR}/backups" /var/backups/sita /var/log
log "✅ Directories created."

# Generate device ID if not present
if [ ! -f "$CONFIG_FILE" ]; then
  DEVICE_ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || echo "dev-$(date +%s)")
  cat > "$CONFIG_FILE" <<EOF
{
  "device_id": "${DEVICE_ID}",
  "current_version": "1.0.0",
  "supabase_url": "",
  "anon_key": "",
  "user_id": "system",
  "created_at": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
}
EOF
  log "✅ Config created with device ID: ${DEVICE_ID}"
else
  log "✅ Config already exists."
fi

# Build info
BUILD_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
cat > "${SITA_DIR}/build-info.json" <<EOF
{
  "version": "1.0.0",
  "build_date": "${BUILD_DATE}",
  "hostname": "$(hostname 2>/dev/null || echo unknown)",
  "boot_type": "first-boot"
}
EOF
log "✅ Build info written."

# Enable systemd timers if available
if command -v systemctl &>/dev/null; then
  for svc in sita-ota sita-backup sita-metrics; do
    if [ -f "/etc/systemd/system/${svc}.timer" ]; then
      systemctl enable --now "${svc}.timer" 2>/dev/null || true
      log "✅ Enabled ${svc}.timer"
    fi
  done
fi

# Docker health check
if command -v docker &>/dev/null; then
  CONTAINERS=$(docker ps --format '{{.Names}}' 2>/dev/null | wc -l)
  log "✅ Docker running with ${CONTAINERS} container(s)."
fi

# Mark complete
touch "$MARKER"
log "═══ First boot complete ═══"
