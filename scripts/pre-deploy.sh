#!/usr/bin/env bash
set -euo pipefail
ERRORS=0; REPORT=""
step() { echo -e "\n══════ $1 ══════"; }
fail() { ERRORS=$((ERRORS+1)); REPORT="$REPORT\n❌ $1"; echo "❌ FAIL: $1"; }
pass() { REPORT="$REPORT\n✅ $1"; echo "✅ PASS: $1"; }

step "TypeScript type-check"
if npx tsc --noEmit 2>&1; then pass "TypeScript — zero errors"; else fail "TypeScript errors"; fi

step "ESLint"
if npx eslint . --max-warnings 0 2>&1; then pass "Lint — zero warnings"; else fail "Lint errors"; fi

step "Unit tests"
if npx vitest run 2>&1; then pass "Unit tests — all passed"; else fail "Unit tests failed"; fi

step "Deployment readiness gate"
if npx vitest run src/__tests__/deployment/ src/__tests__/meta/ src/__tests__/ci/ src/__tests__/security/security-fabric-behavioral.test.ts 2>&1; then pass "Deployment readiness gate — passed"; else fail "Deployment readiness gate failed"; fi

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

step "as-any governance"
if bash scripts/validators/check-no-as-any-pages.sh 2>&1; then pass "Zero as-any in pages"; else fail "as-any violations in pages"; fi

step "Import integrity"
if node scripts/validators/check-import-integrity.mjs 2>&1; then pass "Import integrity — clean"; else fail "Malformed imports detected"; fi

step "Orphan page scan"
bash scripts/validators/check-orphan-pages.sh 2>&1 || true
pass "Orphan scan complete (advisory)"

step "Demo/Mock leak detection"
if bash scripts/validators/check-demo-leaks.sh 2>&1; then pass "No MOCK_/DEMO_ leaks in production"; else fail "Direct MOCK_/DEMO_ usage in production files"; fi

step "Service consumer scan"
bash scripts/validators/check-service-consumers.sh 2>&1 || true
pass "Service scan complete (advisory)"

echo -e "\n══════ PRE-DEPLOY REPORT ══════"
echo -e "$REPORT"
if [ "$ERRORS" -gt 0 ]; then echo "🚫 BLOCKED — $ERRORS failures"; exit 1; else echo "✅ ALL PASSED"; exit 0; fi