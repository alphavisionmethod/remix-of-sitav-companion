#!/usr/bin/env bash
set -euo pipefail
# ═══ SITA OS — Generated Artifact Retention ═══
# Prunes generated JSON/MD files older than 30 days.
# Usage: npm run clean:generated

RETENTION_DAYS="${RETENTION_DAYS:-30}"
GEN_DIR="generated"

if [ ! -d "$GEN_DIR" ]; then
  echo "No generated/ directory found — nothing to prune."
  exit 0
fi

BEFORE=$(find "$GEN_DIR" -type f | wc -l | tr -d ' ')

find "$GEN_DIR" -type f \( -name "*.json" -o -name "*.md" \) -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true

# Remove empty directories left behind
find "$GEN_DIR" -type d -empty -delete 2>/dev/null || true

AFTER=$(find "$GEN_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
PRUNED=$((BEFORE - AFTER))

echo "═══ Generated Artifact Retention ═══"
echo "  Retention: ${RETENTION_DAYS} days"
echo "  Before: ${BEFORE} files"
echo "  After:  ${AFTER} files"
echo "  Pruned: ${PRUNED} files"