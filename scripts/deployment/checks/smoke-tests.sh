#!/usr/bin/env bash
set -euo pipefail
echo "🔥 Running smoke tests..."
BASE_URL="${1:-http://localhost:5173}"
check() { curl -sf -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || echo "000"; }
ROUTES=("/" "/login" "/signup" "/dashboard")
PASSED=0; FAILED=0
for route in "${ROUTES[@]}"; do
  STATUS=$(check "${BASE_URL}${route}")
  if [ "$STATUS" = "200" ]; then echo "  ✅ $route ($STATUS)"; ((PASSED++)); else echo "  ❌ $route ($STATUS)"; ((FAILED++)); fi
done
echo "📊 ${PASSED} passed, ${FAILED} failed"
[ "$FAILED" -eq 0 ] || exit 1
