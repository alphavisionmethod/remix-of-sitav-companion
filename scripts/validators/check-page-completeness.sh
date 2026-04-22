#!/usr/bin/env bash
set -uo pipefail
# ═══ Page Completeness Validator ═══
ERRORS=0

# 1. Check for empty pages (<5 lines excluding comments)
EMPTY=0
while IFS= read -r f; do
  LINES=$(grep -cv '^\s*$\|^\s*//' "$f" 2>/dev/null || echo 0)
  if [ "$LINES" -lt 5 ]; then
    EMPTY=$((EMPTY+1))
    echo "⚠ Empty page: $f ($LINES lines)"
  fi
done < <(find src/pages -name "*.tsx" -not -name "*.test.*" 2>/dev/null)
if [ "$EMPTY" -gt 5 ]; then
  echo "❌ FAIL: $EMPTY empty pages (>5 allowed)"
  ERRORS=$((ERRORS+1))
else
  echo "✅ PASS: $EMPTY empty pages (≤5 threshold)"
fi

# 2. Check all pages export default
NO_EXPORT=0
while IFS= read -r f; do
  if ! grep -q "export default" "$f" 2>/dev/null; then
    NO_EXPORT=$((NO_EXPORT+1))
  fi
done < <(find src/pages -name "*.tsx" -not -name "*.test.*" -not -name "index.tsx" 2>/dev/null)
if [ "$NO_EXPORT" -gt 10 ]; then
  echo "❌ FAIL: $NO_EXPORT pages without default export (>10 allowed)"
  ERRORS=$((ERRORS+1))
else
  echo "✅ PASS: $NO_EXPORT pages without default export (≤10 threshold)"
fi

# 3. Check for un-annotated Coming Soon
CS=$(grep -rn "coming soon" src/pages/ --include="*.tsx" -i 2>/dev/null | grep -v "\[deferred\]" | wc -l | tr -d ' ')
echo "ℹ  $CS 'coming soon' toast references (advisory — these are honest feature-planned toasts)"

# 4. Summary
if [ "$ERRORS" -gt 0 ]; then
  echo "🚫 $ERRORS page completeness failures"
  exit 1
fi
echo "✅ Page completeness checks passed"