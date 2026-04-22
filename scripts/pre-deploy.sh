#!/usr/bin/env bash
set -euo pipefail
ERRORS=0; REPORT=""
step() { echo -e "\n══════ $1 ══════"; }
fail() { ERRORS=$((ERRORS+1)); REPORT="$REPORT\n❌ $1"; echo "❌ FAIL: $1"; }
pass() { REPORT="$REPORT\n✅ $1"; echo "✅ PASS: $1"; }

step "TypeScript type-check"
if npx tsc --noEmit 2>&1; then pass "TypeScript — zero errors"; else fail "TypeScript errors"; fi

step "Vite production build"
if npx vite build 2>&1; then pass "Vite build — success"; else fail "Vite build failed"; fi

step "Route & page consistency"
ROUTE_COUNT=$(grep -rc "path=" src/routes/*.tsx 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "  Routes: $ROUTE_COUNT"
if [ "$ROUTE_COUNT" -lt 10 ]; then fail "Route count low ($ROUTE_COUNT)"; else pass "Routes healthy ($ROUTE_COUNT)"; fi

step "Demo-mode safety"
DEMO_LIVE=$(grep -rn "isDemoMode = isDemo" src/pages/ 2>/dev/null | grep -v __tests__ | wc -l | tr -d ' ')
if [ "$DEMO_LIVE" -gt 0 ]; then fail "$DEMO_LIVE files with isDemoMode=isDemo"; else pass "No live demo wiring"; fi

step "Dead handlers"
DEAD=$(grep -rn 'onClick={() => {}}' src/pages/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$DEAD" -gt 0 ]; then fail "$DEAD dead onClick handlers"; else pass "No dead handlers"; fi

echo -e "\n══════ PRE-DEPLOY REPORT ══════"
echo -e "$REPORT"
if [ "$ERRORS" -gt 0 ]; then echo "🚫 BLOCKED — $ERRORS failures"; exit 1; else echo "✅ ALL PASSED"; exit 0; fi