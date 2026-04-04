#!/usr/bin/env bash
set -euo pipefail
echo "Disaster recovery drill..."
BACKUP_DIR="backups"
[ -d "$BACKUP_DIR" ] || mkdir -p "$BACKUP_DIR"
echo "DR drill complete"
