# 02 — Runtime & Operational Proof Closure

> Generated: 2026-04-19 · Aggregated by `check-final-runtime-proof.ts`

## Live cron schedule (9 jobs)

| Job | Cadence | Purpose |
|---|---|---|
| `sita-internal-agent-loop` | every 5 min | AI workforce internal agent runtime loop |
| `sita-webhook-retry-processor` | every 2 min | Webhook DLQ exponential-backoff replay |
| `sita-boardroom-l7-sla-scan` | every 30 min | Boardroom follow-through stuck-state alerting |
| `sita-oauth-refresh-probe` | hourly | Google / MS Graph / Slack token refresh validation |
| `sita-canary-evaluator` | hourly | SLO breach detection on critical flows |
| `sita-chaos-evaluator` | hourly | Continuous-assurance fault-injection drills |
| `sita-security-council-tick` | hourly | **NEW** — 7 security agents observe & propose |
| `sita-compliance-evidence-collector` | daily 06:00 UTC | SOC2/ISO automated evidence packets |
| `sita-dr-drill` | weekly Sun 05:00 UTC | Cross-region disaster recovery drill |

## Runtime proof gates (re-asserted)

- `pg-cron-schedules-report.json` — all 9 jobs registered
- `internal-agent-phase8-tables-report.json` — Phase 8 tables present
- `internal-agent-phase9-tables-report.json` — Phase 9 tables present
- `kill-switch-enforcement-report.json` — 15+ switches enforced
- `attestation-packet-signed-report.json` — HMAC signature valid
- `audit-export-immutable-report.json` — append-only verified

## Boardroom Layer 7

Lifecycle persisted across `boardroom_followthrough_dispatches` +
`boardroom_outcome_records`. SLA breach alerts emit on `dispatch_pending` >6h
or `outcome_pending` >72h. Recovery via runbook **RB-020**.

## Restore drill

Production-shape scrubbed dataset restored weekly. Last drill duration logged
in `generated/restore-drill-report.json`. RTO target: 60 min. RPO target: 5 min.

## Verdict

**6/6 runtime artifacts proven**. The system is provably running, not just
provably structured.
