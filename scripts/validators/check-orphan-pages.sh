#!/usr/bin/env bash
set -euo pipefail
# ═══ Governance: Flag pages not referenced by any route file ═══
ORPHANS=0
for page in $(find src/pages -maxdepth 1 -name "*.tsx" -type f 2>/dev/null | sort); do
  base=$(basename "$page" .tsx)
  refs=$(grep -rl "$base" src/routes/ --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$refs" -eq 0 ]; then
    echo "⚠ ORPHAN: $page (not referenced by any route file)"
    ORPHANS=$((ORPHANS + 1))
  fi
done
echo "═══ Orphan pages: $ORPHANS ═══"
# Warning only — does not block deployment
exit 0