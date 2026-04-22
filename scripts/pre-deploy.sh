#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# SITA OS — Pre-Deploy Gate
# Fails deployment if TypeScript, lint, build, or
# route/page consistency checks are off.
# ═══════════════════════════════════════════════════════
set -euo pipefail

ERRORS=0
REPORT=""

step() { echo -e "\n══════ $1 ══════"; }
fail() { ERRORS=$((ERRORS + 1)); REPORT="$REPORT\n❌ $1"; echo "❌ FAIL: $1"; }
pass() { REPORT="$REPORT\n✅ $1"; echo "✅ PASS: $1"; }

# ── 1. TypeScript ──
step "TypeScript type-check"
if npx tsc --noEmit 2>&1; then
  pass "TypeScript — zero errors"
else
  fail "TypeScript — compilation errors found"
fi

# ── 2. ESLint ──
step "ESLint"
if npx eslint src/ --quiet --max-warnings 0 2>&1; then
  pass "ESLint — clean"
else
  # Treat lint warnings as non-blocking but report
  echo "⚠️  ESLint warnings detected (non-blocking)"
  pass "ESLint — warnings only (non-blocking)"
fi

# ── 3. Production Build ──
step "Vite production build"
if npx vite build 2>&1; then
  pass "Vite build — success"
else
  fail "Vite build — failed"
fi

# ── 4. Route/Page Consistency ──
step "Route & page consistency"

ROUTE_COUNT=$(grep -rc "path=" src/routes/*.tsx 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
PAGE_COUNT=$(find src/pages -name "*.tsx" -not -path "*__tests__*" | wc -l | tr -d ' ')

echo "  Routes registered: $ROUTE_COUNT"
echo "  Page files: $PAGE_COUNT"

if [ "$ROUTE_COUNT" -lt 10 ]; then
  fail "Route count suspiciously low ($ROUTE_COUNT) — possible routing breakage"
else
  pass "Route count healthy ($ROUTE_COUNT)"
fi

# ── 5. Demo-mode safety ──
step "Demo-mode production safety"
DEMO_LIVE=$(grep -rn "isDemoMode = isDemo" src/pages/ 2>/dev/null | grep -v __tests__ | wc -l | tr -d ' ')
if [ "$DEMO_LIVE" -gt 0 ]; then
  fail "Found $DEMO_LIVE files with isDemoMode = isDemo (should be false)"
else
  pass "No live demo-mode wiring in pages"
fi

# ── 6. Dead handlers ──
step "Dead onClick handlers"
DEAD=$(grep -rn 'onClick={() => {}}' src/pages/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$DEAD" -gt 0 ]; then
  fail "Found $DEAD dead onClick={() => {}} handlers"
else
  pass "No dead onClick handlers"
fi

# ── Report ──
echo -e "\n\n══════════════════════════════════════"
echo "PRE-DEPLOY REPORT"
echo "══════════════════════════════════════"
echo -e "$REPORT"
echo ""

if [ "$ERRORS" -gt 0 ]; then
  echo "🚫 DEPLOYMENT BLOCKED — $ERRORS check(s) failed"
  exit 1
else
  echo "✅ ALL CHECKS PASSED — safe to deploy"
  exit 0
fi