#!/usr/bin/env bash
set -euo pipefail
echo "Pre-flight checks..."
CHECKS=("generated/validation-summary.json" "generated/architecture-compliance-report.json" "generated/service-manifest.json")
PASSED=0
for c in "${CHECKS[@]}"; do
  if [ -f "$c" ]; then ((PASSED++)); else echo "MISSING: $c"; fi
done
echo "Pre-flight: $PASSED/${#CHECKS[@]} passed"
[ "$PASSED" -eq "${#CHECKS[@]}" ] || exit 1
