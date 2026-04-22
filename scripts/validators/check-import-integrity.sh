#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Import Integrity Validator
# Detects malformed multi-line imports (e.g. an import statement
# injected mid-way through another multi-line import block).
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

ERRORS=0

while IFS= read -r file; do
  in_multiline=0
  lineno=0
  while IFS= read -r line; do
    lineno=$((lineno + 1))
    trimmed="${line#"${line%%[![:space:]]*}"}"

    if [ "$in_multiline" -eq 1 ]; then
      # Check if this line closes the multi-line import
      if echo "$trimmed" | grep -q '}' && echo "$trimmed" | grep -q 'from'; then
        in_multiline=0
      elif echo "$trimmed" | grep -q '^import '; then
        echo "❌ $file:$lineno — import statement inside multi-line import block"
        echo "   $line"
        ERRORS=$((ERRORS + 1))
        in_multiline=0
      fi
    else
      # Detect start of multi-line import: has { but no }
      if echo "$trimmed" | grep -q '^import ' && echo "$trimmed" | grep -q '{' && ! echo "$trimmed" | grep -q '}'; then
        in_multiline=1
      fi
    fi
  done < "$file"
done < <(find src/ -name '*.tsx' -o -name '*.ts' | grep -v node_modules | grep -v __tests__ | sort)

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "🚫 $ERRORS malformed import(s) found. Fix before merging."
  exit 1
else
  echo "✅ Import integrity — all imports well-formed"
  exit 0
fi