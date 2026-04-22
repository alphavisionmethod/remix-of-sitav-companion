#!/usr/bin/env bash
set -euo pipefail
# ═══ Governance: Zero 'as any' in src/pages/ ═══
COUNT=$(grep -rn "as any" src/pages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v __tests__ | grep -v "\.test\." | wc -l | tr -d ' ' || echo "0")
if [ "$COUNT" -gt 0 ]; then
  echo "❌ FAIL: $COUNT 'as any' violations in src/pages/"
  grep -rn "as any" src/pages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v __tests__ | grep -v "\.test\."
  exit 1
fi
echo "✅ PASS: Zero 'as any' in src/pages/"