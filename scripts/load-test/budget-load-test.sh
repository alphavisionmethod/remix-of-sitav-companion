#!/usr/bin/env bash
# SITA OS — Per-user AI budget hard-stop load test.
# Drops a receipt JSON in generated/economic-trust-and-future-closure/budget-load-runs/
# Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... USER_JWT=... ./budget-load-test.sh [calls]
set -euo pipefail

CALLS="${1:-200}"
RUN_ID="loadrun-$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="generated/economic-trust-and-future-closure/budget-load-runs"
mkdir -p "$OUT_DIR"
OUT_FILE="$OUT_DIR/${RUN_ID}.json"

if [[ -z "${SUPABASE_URL:-}" || -z "${SUPABASE_ANON_KEY:-}" || -z "${USER_JWT:-}" ]]; then
  echo "ERROR: SUPABASE_URL, SUPABASE_ANON_KEY, USER_JWT must be set." >&2
  exit 2
fi

ENDPOINT="${SUPABASE_URL}/functions/v1/ai-gateway"
START="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
denials=0; downgrades=0; allows=0; receipts=0

for i in $(seq 1 "$CALLS"); do
  RESP="$(curl -sS -X POST "$ENDPOINT" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $USER_JWT" \
    -H "Content-Type: application/json" \
    -d '{"capability":"summarize.short","prompt":"load-test ping","metadata":{"loadTest":true}}' || echo '{}')"
  case "$(echo "$RESP" | grep -o '"decision":"[^"]*"' | head -1)" in
    *deny*)     denials=$((denials+1));;
    *downgrade*) downgrades=$((downgrades+1));;
    *)          allows=$((allows+1));;
  esac
  if echo "$RESP" | grep -q '"receiptId"'; then receipts=$((receipts+1)); fi
done

CEIL_OK="true"
if [[ $denials -eq 0 && $downgrades -eq 0 ]]; then CEIL_OK="false"; fi

cat > "$OUT_FILE" <<JSON
{
  "runId": "$RUN_ID",
  "startedAt": "$START",
  "completedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "perUserCalls": $CALLS,
  "denialsObserved": $denials,
  "downgradesObserved": $downgrades,
  "allowsObserved": $allows,
  "ceilingHonored": $CEIL_OK,
  "receiptCount": $receipts
}
JSON

echo "Wrote $OUT_FILE — denials=$denials downgrades=$downgrades allows=$allows receipts=$receipts"
