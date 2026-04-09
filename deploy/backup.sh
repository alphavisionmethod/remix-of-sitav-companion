#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Automated Backup Script
# Backs up PostgreSQL database and Docker volumes.
# Usage: sudo ./backup.sh [--output-dir /backups] [--retain-days 30]
# Cron:  0 2 * * * /opt/sita/deploy/backup.sh >> /var/log/sita-backup.log 2>&1
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
DEPLOY_DIR="${SITA_DIR}/deploy"
BACKUP_DIR="${1:-/var/lib/sita/backups}"
RETAIN_DAYS="${2:-30}"
TIMESTAMP=$(date -u '+%Y%m%d-%H%M%S')
BACKUP_NAME="sita-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
LOG_FILE="/var/log/sita-backup.log"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output-dir)   BACKUP_DIR="$2"; BACKUP_PATH="${BACKUP_DIR}/sita-backup-${TIMESTAMP}"; shift 2 ;;
    --retain-days)  RETAIN_DAYS="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--output-dir /backups] [--retain-days 30]"
      exit 0 ;;
    *) shift ;;
  esac
done

mkdir -p "$BACKUP_PATH"

log "═══════════════════════════════════════════════════════"
log "  SITA OS — Backup starting"
log "  Output: ${BACKUP_PATH}"
log "═══════════════════════════════════════════════════════"

# ── 1. PostgreSQL dump ────────────────────────────────────────
log "[1/4] Backing up PostgreSQL database..."
DB_CONTAINER="sita-supabase-db"

if docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER"; then
  docker exec "$DB_CONTAINER" pg_dumpall -U postgres --clean | gzip > "${BACKUP_PATH}/database.sql.gz"
  DB_SIZE=$(du -h "${BACKUP_PATH}/database.sql.gz" | awk '{print $1}')
  log "  ✅ Database backup: ${DB_SIZE}"
else
  log "  ⚠ Database container not running — skipping"
fi

# ── 2. Docker volume snapshots ────────────────────────────────
log "[2/4] Backing up Docker volumes..."
VOLUMES=("supabase-db-data" "supabase-storage-data" "nats-data")

for vol in "${VOLUMES[@]}"; do
  FULL_VOL=$(docker volume ls --format '{{.Name}}' | grep "$vol" | head -1 || echo "")
  if [[ -n "$FULL_VOL" ]]; then
    docker run --rm \
      -v "${FULL_VOL}:/source:ro" \
      -v "${BACKUP_PATH}:/backup" \
      alpine tar czf "/backup/vol-${vol}.tar.gz" -C /source . 2>/dev/null
    VOL_SIZE=$(du -h "${BACKUP_PATH}/vol-${vol}.tar.gz" | awk '{print $1}')
    log "  ✅ Volume ${vol}: ${VOL_SIZE}"
  else
    log "  ⚠ Volume ${vol} not found — skipping"
  fi
done

# ── 3. Configuration backup ──────────────────────────────────
log "[3/4] Backing up configuration..."
CONFIG_DIR="${BACKUP_PATH}/config"
mkdir -p "$CONFIG_DIR"

for f in docker-compose.yml .env .env.example; do
  [[ -f "${DEPLOY_DIR}/${f}" ]] && cp "${DEPLOY_DIR}/${f}" "${CONFIG_DIR}/"
done

[[ -f "${SITA_DIR}/build-info.json" ]] && cp "${SITA_DIR}/build-info.json" "${CONFIG_DIR}/"
log "  ✅ Configuration backed up"

# ── 4. Create archive and manifest ───────────────────────────
log "[4/4] Creating backup archive..."
cat > "${BACKUP_PATH}/manifest.json" << EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "components": {
    "database": $([ -f "${BACKUP_PATH}/database.sql.gz" ] && echo true || echo false),
    "volumes": $(ls "${BACKUP_PATH}"/vol-*.tar.gz 2>/dev/null | wc -l),
    "config": true
  },
  "retain_days": ${RETAIN_DAYS}
}
EOF

cd "$BACKUP_DIR"
tar czf "${BACKUP_NAME}.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_PATH"

TOTAL_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | awk '{print $1}')
log "✅ Backup complete: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz (${TOTAL_SIZE})"

# ── Cleanup old backups ──────────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "sita-backup-*.tar.gz" -mtime +"$RETAIN_DAYS" -delete -print | wc -l)
if [[ "$DELETED" -gt 0 ]]; then
  log "🗑 Cleaned up ${DELETED} backup(s) older than ${RETAIN_DAYS} days"
fi

log "═══════════════════════════════════════════════════════"
