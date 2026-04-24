#!/usr/bin/env bash
set -uo pipefail
# ═══ Governance: Zero un-approved 'as any' in src/pages/ ═══
#
# An 'as any' assertion is a violation EXCEPT when it is the documented
# "Empty-State Honesty" placeholder for an array literal:
#
#     ([] as any[])     // empty list, no demo data, mapped over later
#     [] as any[]       // bare form (e.g. `return [] as any[];`)
#
# This pattern is intentional, mechanical, and trackable: it lets a
# component honestly render its empty state without inventing a fake
# element type. Fabricating a type via `never[]` breaks property access
# at the iteration callsite; fabricating one via `Record<string, any>[]`
# still launders `any`. The honest answer is to permit the literal
# pattern and forbid every other shape.
#
# All other `as any` shapes (value coercions, function-result casts,
# destructure-target casts, etc.) remain hard violations.

VIOLATIONS=$(grep -rn "as any" src/pages/ --include="*.ts" --include="*.tsx" 2>/dev/null \
  | grep -v __tests__ \
  | grep -v "\.test\." \
  | grep -Ev "\(\[\] as any\[\]\)" \
  | grep -Ev "\[\] as any\[\]" \
  || true)

COUNT=$(echo -n "$VIOLATIONS" | grep -c . || true)
COUNT=${COUNT:-0}

if [ "$COUNT" -gt 0 ]; then
  echo "❌ FAIL: $COUNT un-approved 'as any' violations in src/pages/"
  echo "$VIOLATIONS"
  echo ""
  echo "Allowed pattern: ([] as any[]) or [] as any[]  — Empty-State Honesty only."
  exit 1
fi
echo "✅ PASS: Zero un-approved 'as any' in src/pages/"