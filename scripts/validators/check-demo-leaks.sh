#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Build-Time Demo/Mock Leak Detector
#
# Fails the build if production source files contain direct
# MOCK_/DEMO_ usage or hardcoded demo arrays that are NOT
# gated behind isDemoMode.
#
# Safe patterns (allowed):
#   isDemoMode ? DEMO_X : realData
#   ([] as typeof DEMO_X)
#   import type { ... } from "...mock..."
#   // DEMO_  (comments)
#   files in __tests__, test/, demo/, fixtures/, seed/, website-demo/
#
# Unsafe patterns (blocked):
#   const data = DEMO_ITEMS;          (direct assignment without gate)
#   return MOCK_USERS;                (returning mock data)
#   {DEMO_ARRAY.map(...)              (rendering mock data directly)
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

VIOLATIONS=0
VIOLATION_FILES=""

# Directories and patterns to exclude
EXCLUDE_DIRS="__tests__|test/|\.test\.|\.spec\.|fixtures/|seed/|mock-data/|website-demo/|demo/|storybook|stories"
EXCLUDE_FILES="test-utils|demo-policy|demo-mode|isDemoMode|DemoMode|use-demo"

# Search for MOCK_ and DEMO_ references in production source files
while IFS= read -r file; do
  # Skip excluded directories and file patterns
  if echo "$file" | grep -qE "$EXCLUDE_DIRS"; then continue; fi
  if echo "$file" | grep -qE "$EXCLUDE_FILES"; then continue; fi

  # Read file content
  content=$(cat "$file" 2>/dev/null || continue)

  # Skip if file uses the safe pattern: isDemoMode gating with empty array fallback
  # The canonical pattern is: isDemoMode ? DEMO_X : ([] as typeof DEMO_X)
  # These files are intentionally dual-mode — they show demo data OR empty state

  # Find lines with direct MOCK_/DEMO_ usage that are NOT:
  #  1. Comments (// or /*)
  #  2. Import type statements
  #  3. Type annotations (as typeof DEMO_)
  #  4. isDemoMode ternary gating
  #  5. Empty array cast: ([] as typeof DEMO_)
  #  6. String literals in quotes
  while IFS= read -r line; do
    lineno="${line%%:*}"
    linetext="${line#*:}"

    # Skip comments
    if echo "$linetext" | grep -qE '^\s*(//|/\*|\*)'; then continue; fi
    # Skip import type
    if echo "$linetext" | grep -qE 'import\s+type'; then continue; fi
    # Skip type annotations and typeof casts
    if echo "$linetext" | grep -qE 'as typeof (MOCK_|DEMO_)'; then continue; fi
    # Skip the safe empty-array cast pattern
    if echo "$linetext" | grep -qE '\(\[\]\s*as\s*typeof\s*(MOCK_|DEMO_)'; then continue; fi
    # Skip isDemoMode gating lines
    if echo "$linetext" | grep -qE 'isDemoMode'; then continue; fi
    # Skip import statements (we allow importing, the usage matters)
    if echo "$linetext" | grep -qE '^\s*import\s'; then continue; fi
    # Skip interface/type definitions
    if echo "$linetext" | grep -qE '^\s*(interface|type)\s'; then continue; fi
    # Skip const declarations of demo data (definition files are OK if in data/)
    if echo "$file" | grep -qE 'data/|constants/|config/'; then continue; fi

    # This line has a direct MOCK_/DEMO_ reference that isn't gated — violation
    VIOLATIONS=$((VIOLATIONS + 1))
    VIOLATION_FILES="$VIOLATION_FILES\n  $file:$lineno: $(echo "$linetext" | head -c 120)"
  done < <(grep -nE '\b(MOCK_|DEMO_)[A-Z_]+' "$file" 2>/dev/null || true)

done < <(find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null)

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "🚫 DEMO/MOCK LEAK DETECTOR: $VIOLATIONS violation(s) found"
  echo -e "$VIOLATION_FILES"
  echo ""
  echo "Fix: Gate demo data behind isDemoMode or use ([] as typeof DEMO_X) pattern."
  echo "See: mem://design/demo-mode-standardization"
  exit 1
else
  echo "✅ No direct MOCK_/DEMO_ leaks in production source files"
  exit 0
fi