#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Deploy Service Manifest Completeness Validator
# Ensures all deploy/*/package.json have required scripts.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REQUIRED_SCRIPTS=("build" "start" "dev" "typecheck" "lint" "clean" "health-check" "ready-check" "test" "smoke")
DEPLOY_DIR="deploy"
EXIT_CODE=0

for dir in "$DEPLOY_DIR"/*/; do
  pkg="$dir/package.json"
  [ -f "$pkg" ] || continue

  svc=$(basename "$dir")
  missing=()

  for script in "${REQUIRED_SCRIPTS[@]}"; do
    if ! grep -q "\"$script\"" "$pkg" 2>/dev/null; then
      missing+=("$script")
    fi
  done

  if [ ${#missing[@]} -gt 0 ]; then
    echo "❌ $svc: missing scripts: ${missing[*]}"
    EXIT_CODE=1
  else
    echo "✅ $svc: all required scripts present"
  fi
done

exit $EXIT_CODE