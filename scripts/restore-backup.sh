#!/usr/bin/env bash
set -euo pipefail
BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ]; then echo "Usage: restore-backup.sh <backup-file>"; exit 1; fi
if [ ! -f "$BACKUP_FILE" ]; then echo "❌ Backup file not found: $BACKUP_FILE"; exit 1; fi
echo "🔄 Restoring from $BACKUP_FILE..."
if command -v psql &>/dev/null; then
  psql < "$BACKUP_FILE" 2>/dev/null && echo "✅ Restore complete" || echo "❌ Restore failed"
else
  echo "⚠️ psql not found"
fi
