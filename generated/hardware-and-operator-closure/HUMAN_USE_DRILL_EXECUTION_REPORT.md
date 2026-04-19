# Human-Use Drill Execution Report

> Auto-regenerated from `public.operator_drill_executions` rows.

## Today's status

**0 drill executions recorded.** All 8 scenarios in `pending-human-execution` state.

## How operators record a drill

Option 1 — Via the runbook-drill edge function (already wired):
```bash
curl -X POST "$SUPABASE_URL/functions/v1/runbook-drill" \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"runbookId":"RB-005","mode":"dry-run","triggeredBy":"manual"}'
```
The function now inserts into `operator_drill_executions` in addition to its existing `runbook_drill_results` write.

Option 2 — Via Admin AI Engineer hub:
Open `/admin/ai-runtime` → Hardware & Operator Truth panel → Drill Runner section.

## Reporting

After ≥6 unique scenarios recorded in last 90 days, `check-operator-drill-execution.ts` flips from WARN to BLOCK-eligible.
