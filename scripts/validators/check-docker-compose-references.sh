#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Docker Compose Reference Integrity Validator
# Ensures all referenced config files and Dockerfiles exist.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

COMPOSE_FILE="${1:-docker-compose.yml}"
EXIT_CODE=0

echo "Checking references in $COMPOSE_FILE..."

# Check Dockerfile references
for df in $(grep -oP 'dockerfile:\s*\K\S+' "$COMPOSE_FILE" 2>/dev/null || true); do
  if [ ! -f "$df" ]; then
    echo "❌ Missing Dockerfile: $df"
    EXIT_CODE=1
  else
    echo "✅ Dockerfile exists: $df"
  fi
done

# Check volume-mounted config files (host:container patterns)
for mount in $(grep -oP '\./[^:]+(?=:)' "$COMPOSE_FILE" 2>/dev/null || true); do
  # Skip directories and data volumes
  case "$mount" in
    */data*|*/migrations*|*/functions*) continue ;;
  esac
  if [ ! -e "$mount" ]; then
    echo "❌ Missing mount source: $mount"
    EXIT_CODE=1
  else
    echo "✅ Mount source exists: $mount"
  fi
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "All Docker Compose references verified ✅"
fi
exit $EXIT_CODE