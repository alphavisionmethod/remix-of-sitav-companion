#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Recovery / Rollback Script
# Reverts to the previous A/B root partition after a failed update.
# Usage: sudo sita-recovery.sh [--force]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
ROLLBACK_MARKER="${SITA_DIR}/.rollback-ready"
LOG_FILE="/var/log/sita-recovery.log"
FORCE=false

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=true; shift ;;
    --help|-h)
      echo "Usage: $0 [--force]"
      echo "  --force   Skip confirmation prompt"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ $EUID -ne 0 ]]; then
  echo "❌ This script must be run as root"
  exit 1
fi

log "═══════════════════════════════════════════════════════"
log "  SITA OS — Recovery Mode"
log "═══════════════════════════════════════════════════════"

# ── Check rollback marker ─────────────────────────────────────
if [[ ! -f "$ROLLBACK_MARKER" ]]; then
  log "⚠ No rollback marker found at ${ROLLBACK_MARKER}"
  log "  This means either:"
  log "    - No update has been performed yet"
  log "    - The rollback marker was already consumed"

  if [[ "$FORCE" != true ]]; then
    echo ""
    echo "Attempting service-level recovery instead..."
  fi
fi

# ── Service-level recovery ────────────────────────────────────
recover_services() {
  log "Attempting service-level recovery..."

  cd "${SITA_DIR}/deploy" 2>/dev/null || cd /opt/sita/deploy

  log "Stopping all services..."
  docker compose down --remove-orphans 2>&1 | tee -a "$LOG_FILE" || true

  log "Pruning failed containers..."
  docker container prune -f 2>&1 | tee -a "$LOG_FILE" || true

  log "Restarting stack..."
  docker compose up -d 2>&1 | tee -a "$LOG_FILE"

  log "Waiting for health (max 90s)..."
  local retries=0
  while [[ $retries -lt 18 ]]; do
    local healthy
    healthy=$(docker compose ps --format json 2>/dev/null | grep -c '"healthy"' || echo 0)
    if [[ "$healthy" -ge 3 ]]; then
      log "✅ Services recovered (${healthy} healthy)"
      return 0
    fi
    retries=$((retries + 1))
    sleep 5
  done

  log "⚠ Some services may still be unhealthy"
  return 1
}

# ── Partition-level rollback ──────────────────────────────────
rollback_partition() {
  local previous_root
  previous_root=$(cat "$ROLLBACK_MARKER")
  log "Rolling back to partition: ${previous_root}"

  local target_dev
  target_dev=$(blkid -L "$previous_root" 2>/dev/null || echo "")

  if [[ -z "$target_dev" ]]; then
    log "❌ Cannot find partition labeled ${previous_root}"
    return 1
  fi

  local target_uuid
  target_uuid=$(blkid -s UUID -o value "$target_dev")

  # Restore GRUB backup if available
  if [[ -f "${SITA_DIR}/.grub-backup" ]]; then
    log "Restoring GRUB configuration..."
    cp "${SITA_DIR}/.grub-backup" /etc/default/grub
    update-grub 2>&1 | tee -a "$LOG_FILE"
  else
    log "Updating GRUB root to UUID=${target_uuid}..."
    sed -i "s|root=UUID=[^ ]*|root=UUID=${target_uuid}|g" /boot/grub/grub.cfg 2>/dev/null || true
  fi

  rm -f "$ROLLBACK_MARKER"
  log "✅ Partition rollback configured — reboot to activate"
  log "  Run: sudo reboot"
}

# ── Main ──────────────────────────────────────────────────────
if [[ "$FORCE" != true ]]; then
  echo ""
  echo "⚠  SITA OS Recovery will:"
  echo "   1. Attempt to restart all services"
  if [[ -f "$ROLLBACK_MARKER" ]]; then
    echo "   2. If needed, rollback to previous root partition"
  fi
  echo ""
  read -rp "Continue? [y/N] " confirm
  if [[ "$confirm" != [yY] ]]; then
    echo "Aborted."
    exit 0
  fi
fi

recover_services || true

if [[ -f "$ROLLBACK_MARKER" ]]; then
  rollback_partition
fi

log ""
log "Recovery complete. Check service status:"
log "  docker compose -f /opt/sita/deploy/docker-compose.yml ps"
log "  systemctl status sita-os"
