# Operator Readiness Current State Audit

> Generated: 2026-04-19.

## Existing scaffolding

- 19 runbooks in `src/lib/runbook-registry.ts`
- 15+ kill-switches in `src/lib/kill-switch-registry.ts`
- `runbook-drill` edge function (dry-run + live mode)
- `dr-drill-runner` for disaster recovery
- 6 supportability scenarios in `check-human-use-operational-readiness.ts`

## What is structurally GREEN today

✅ Runbook registry fully populated and validated
✅ Kill-switch registry fully populated and validated
✅ Drill harness deployed and callable
✅ Cadence scheduling in pg_cron

## What is missing for experiential GREEN

❌ Zero real-human drill execution rows in `operator_drill_executions` (created today; awaiting first runs)
❌ No MTTD/MTTR baseline measured
❌ No operator signoff records
❌ No friction-point data captured
❌ Runbook execution proof = registry presence only (not drill rows)

## Gap to close

Run 6 scenarios at minimum (one per category):
1. AI runtime nightly failure
2. Connector refresh degraded
3. Boardroom stuck approval
4. Native deployment integrity event
5. Budget ceiling / kill-switch decision
6. Restore/recovery path

After each, the `runbook-drill` edge function inserts into `operator_drill_executions`.
`check-operator-drill-execution.ts` then promotes from WARN → BLOCK.
