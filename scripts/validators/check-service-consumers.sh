#!/usr/bin/env bash
set -euo pipefail
# ═══ Governance: Flag services with zero imports ═══
ORPHANS=0
for f in src/lib/services/*.ts; do
  [ -f "$f" ] || continue
  base=$(basename "$f" .ts)
  imports=$(grep -rl "services/$base" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "$f" | wc -l | tr -d ' ')
  if [ "$imports" -eq 0 ]; then
    echo "⚠ UNUSED: $f (zero consumers)"
    ORPHANS=$((ORPHANS + 1))
  fi
done
echo "═══ Unused services: $ORPHANS ═══"
# Warning only — does not block deployment
exit 0