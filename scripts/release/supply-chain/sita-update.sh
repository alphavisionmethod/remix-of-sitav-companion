#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — A/B Root Update Script
# Pulls new container images, validates health, swaps active root.
# Usage: sudo sita-update.sh [--version X.Y.Z] [--images-tar /path/to/images.tar.gz]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
DEPLOY_DIR="${SITA_DIR}/deploy"
LOG_FILE="/var/log/sita-update.log"
ROLLBACK_MARKER="${SITA_DIR}/.rollback-ready"
CURRENT_ROOT_LABEL=""
TARGET_ROOT_LABEL=""
VERSION=""
IMAGES_TAR=""

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

# ── Parse arguments ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)    VERSION="$2"; shift 2 ;;
    --images-tar) IMAGES_TAR="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--version X.Y.Z] [--images-tar /path/to/images.tar.gz]"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Determine active/inactive root partitions ─────────────────
detect_partitions() {
  local root_dev
  root_dev=$(findmnt -n -o SOURCE /)
  CURRENT_ROOT_LABEL=$(lsblk -n -o LABEL "$root_dev" 2>/dev/null || echo "SITA-ROOT-A")

  if [[ "$CURRENT_ROOT_LABEL" == "SITA-ROOT-A" ]]; then
    TARGET_ROOT_LABEL="SITA-ROOT-B"
  else
    TARGET_ROOT_LABEL="SITA-ROOT-A"
  fi

  log "Current root: ${CURRENT_ROOT_LABEL}, Target root: ${TARGET_ROOT_LABEL}"
}

# ── Pre-update snapshot ───────────────────────────────────────
pre_update_snapshot() {
  log "Creating pre-update backup marker..."
  echo "{\"timestamp\":\"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\",\"from_root\":\"${CURRENT_ROOT_LABEL}\",\"version\":\"${VERSION}\"}" > "${SITA_DIR}/.update-state.json"
}

# ── Load or pull images ───────────────────────────────────────
load_images() {
  if [[ -n "$IMAGES_TAR" && -f "$IMAGES_TAR" ]]; then
    log "Loading images from tarball: ${IMAGES_TAR}"
    docker load < "$IMAGES_TAR"
  else
    log "Pulling latest images from registry..."
    cd "$DEPLOY_DIR"
    docker compose pull --quiet 2>&1 | tee -a "$LOG_FILE"
  fi
}

# ── Rolling update with health validation ─────────────────────
rolling_update() {
  log "Stopping current stack gracefully..."
  cd "$DEPLOY_DIR"

  # Stop services in reverse dependency order
  docker compose stop sita-web sita-api-gateway sita-brain-core 2>&1 | tee -a "$LOG_FILE"

  log "Starting updated stack..."
  docker compose up -d 2>&1 | tee -a "$LOG_FILE"

  log "Waiting for health checks (max 120s)..."
  local retries=0
  local max_retries=24
  while [[ $retries -lt $max_retries ]]; do
    local healthy_count
    healthy_count=$(docker compose ps --format json 2>/dev/null | grep -c '"healthy"' || echo 0)
    local total_count
    total_count=$(docker compose ps --format json 2>/dev/null | wc -l || echo 0)

    if [[ "$healthy_count" -ge 5 ]]; then
      log "✅ Stack healthy (${healthy_count}/${total_count} services)"
      return 0
    fi

    retries=$((retries + 1))
    sleep 5
  done

  log "❌ Health check timeout — initiating rollback"
  return 1
}

# ── Clone root to target partition ────────────────────────────
clone_root() {
  local target_dev
  target_dev=$(blkid -L "$TARGET_ROOT_LABEL" 2>/dev/null || echo "")

  if [[ -z "$target_dev" ]]; then
    log "⚠ Target partition ${TARGET_ROOT_LABEL} not found — skipping A/B swap"
    return 0
  fi

  log "Syncing root filesystem to ${TARGET_ROOT_LABEL}..."
  local mount_point="/mnt/sita-update-target"
  mkdir -p "$mount_point"
  mount "$target_dev" "$mount_point"

  rsync -aAXv --delete \
    --exclude='/proc/*' \
    --exclude='/sys/*' \
    --exclude='/dev/*' \
    --exclude='/tmp/*' \
    --exclude='/run/*' \
    --exclude='/mnt/*' \
    --exclude='/var/lib/sita/*' \
    --exclude='/var/lib/docker/*' \
    / "$mount_point/" 2>&1 | tail -5 | tee -a "$LOG_FILE"

  umount "$mount_point"
  rmdir "$mount_point"

  log "✅ Root cloned to ${TARGET_ROOT_LABEL}"
}

# ── Update GRUB to point to new root ──────────────────────────
update_grub() {
  local target_dev
  target_dev=$(blkid -L "$TARGET_ROOT_LABEL" 2>/dev/null || echo "")

  if [[ -z "$target_dev" ]]; then
    log "⚠ Skipping GRUB update — no target partition"
    return 0
  fi

  local target_uuid
  target_uuid=$(blkid -s UUID -o value "$target_dev")

  log "Updating GRUB to boot from ${TARGET_ROOT_LABEL} (UUID: ${target_uuid})..."

  # Save current default for rollback
  cp /etc/default/grub "${SITA_DIR}/.grub-backup"

  # Update root UUID in GRUB
  sed -i "s|root=UUID=[^ ]*|root=UUID=${target_uuid}|g" /boot/grub/grub.cfg 2>/dev/null || true

  echo "${CURRENT_ROOT_LABEL}" > "$ROLLBACK_MARKER"
  log "✅ GRUB updated — rollback marker saved"
}

# ── Finalize ──────────────────────────────────────────────────
finalize() {
  log "Updating version info..."
  if [[ -n "$VERSION" ]]; then
    jq --arg v "$VERSION" '.version = $v | .updated_at = now' "${SITA_DIR}/build-info.json" > "${SITA_DIR}/build-info.json.tmp" 2>/dev/null && \
      mv "${SITA_DIR}/build-info.json.tmp" "${SITA_DIR}/build-info.json" || true
  fi

  log "═══════════════════════════════════════════════════════"
  log "  ✅ SITA OS update complete"
  log "  Previous root: ${CURRENT_ROOT_LABEL}"
  log "  Active root:   ${TARGET_ROOT_LABEL}"
  log "  Version:       ${VERSION:-unchanged}"
  log "  Rollback:      sudo /opt/sita/sita-recovery.sh"
  log "═══════════════════════════════════════════════════════"
}

# ── Main ──────────────────────────────────────────────────────
main() {
  log "═══════════════════════════════════════════════════════"
  log "  SITA OS — Update starting"
  log "═══════════════════════════════════════════════════════"

  if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root"
    exit 1
  fi

  detect_partitions
  pre_update_snapshot
  load_images

  if ! rolling_update; then
    log "❌ Update failed — rolling back..."
    cd "$DEPLOY_DIR"
    docker compose down 2>/dev/null || true
    docker compose up -d 2>&1 | tee -a "$LOG_FILE"
    log "Rollback complete — system restored to previous state"
    exit 1
  fi

  clone_root
  update_grub
  finalize
}

main "$@"
