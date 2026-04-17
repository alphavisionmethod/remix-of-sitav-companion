#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Automated Backup Agent
# Runs via systemd timer. Backs up database + Docker volumes.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SITA_DIR="/opt/sita"
BACKUP_DIR="/var/backups/sita"
RETENTION_DAYS=30
LOG="/var/log/sita-backup.log"
TIMESTAMP=$(date -u '+%Y%m%dT%H%M%SZ')

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG"; }

mkdir -p "$BACKUP_DIR"

# ── Database Backup ────────────────────────────────────────────
DB_BACKUP="${BACKUP_DIR}/db-${TIMESTAMP}.sql.gz"
log "Starting database backup..."

if command -v pg_dump &>/dev/null; then
  if pg_dump --no-owner --no-acl 2>/dev/null | gzip > "$DB_BACKUP"; then
    log "✅ Database backup: ${DB_BACKUP} ($(du -h "$DB_BACKUP" | cut -f1))"
  else
    log "❌ Database backup failed."
  fi
elif docker compose -f "${SITA_DIR}/docker-compose.yml" ps db --format '{{.State}}' 2>/dev/null | grep -q running; then
  if docker compose -f "${SITA_DIR}/docker-compose.yml" exec -T db pg_dump -U postgres --no-owner --no-acl 2>/dev/null | gzip > "$DB_BACKUP"; then
    log "✅ Database backup (via Docker): ${DB_BACKUP} ($(du -h "$DB_BACKUP" | cut -f1))"
  else
    log "❌ Database backup via Docker failed."
  fi
else
  log "⚠ No database found to back up."
fi

# ── Volume Snapshots ───────────────────────────────────────────
VOLUME_BACKUP="${BACKUP_DIR}/volumes-${TIMESTAMP}.tar.gz"
log "Backing up Docker volumes..."

VOLUMES=$(docker volume ls --filter "name=sita" --format '{{.Name}}' 2>/dev/null || true)
if [[ -n "$VOLUMES" ]]; then
  MOUNT_ARGS=""
  for vol in $VOLUMES; do
    MOUNT_ARGS="$MOUNT_ARGS -v ${vol}:/backup-src/${vol}:ro"
  done
  if docker run --rm $MOUNT_ARGS -v "${BACKUP_DIR}:/backup-dst" alpine \
    tar czf "/backup-dst/volumes-${TIMESTAMP}.tar.gz" -C /backup-src . 2>/dev/null; then
    log "✅ Volume backup: ${VOLUME_BACKUP} ($(du -h "$VOLUME_BACKUP" | cut -f1))"
  else
    log "❌ Volume backup failed."
  fi
else
  log "⚠ No SITA volumes found."
fi

# ── Config Backup ──────────────────────────────────────────────
CONFIG_BACKUP="${BACKUP_DIR}/config-${TIMESTAMP}.tar.gz"
if tar czf "$CONFIG_BACKUP" -C "$SITA_DIR" \
  ota-config.json build-info.json docker-compose.yml .env 2>/dev/null; then
  log "✅ Config backup: ${CONFIG_BACKUP}"
fi

# ── Verification ───────────────────────────────────────────────
log "Verifying backups..."
VALID=true
for f in "$DB_BACKUP" "$VOLUME_BACKUP" "$CONFIG_BACKUP"; do
  if [[ -f "$f" ]]; then
    SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo "0")
    if [[ "$SIZE" -lt 100 ]]; then
      log "⚠ Suspiciously small backup: ${f} (${SIZE} bytes)"
      VALID=false
    fi
  fi
done

if [[ "$VALID" == "true" ]]; then
  log "✅ All backups verified."
else
  log "⚠ Some backups may be incomplete."
fi

# ── Retention Cleanup ──────────────────────────────────────────
log "Cleaning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "*.gz" -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true

REMAINING=$(find "$BACKUP_DIR" -name "*.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "Backup complete. ${REMAINING} archives, total: ${TOTAL_SIZE}"
