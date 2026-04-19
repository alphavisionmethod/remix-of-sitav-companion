# Operator Signoff and MTTR Model

## Signoff requirement

Every drill row must have:
- `operator_id` (uuid, FK to auth.users) — captured from JWT
- `signoff_at` (timestamptz) — set when operator confirms recovery
- `friction_notes` (text) — what was confusing or slow

Without `signoff_at`, the drill is treated as `in-progress` and does not count toward freshness.

## MTTR metrics

| Metric | Definition | Target |
|---|---|---|
| MTTD | Time from incident emission to operator detection | ≤ 120 s |
| MTTI | Time from detection to runbook selection | ≤ 300 s |
| MTTR | Time from detection to confirmed recovery | ≤ 1800 s |

These are stored as `mttd_seconds`, `mttr_seconds` on each drill row. The emitter aggregates rolling 90-day averages into `operator-readiness-status.json`.

## Trend tracking

`HardwareAndOperatorTruthPanel.tsx` displays:
- Latest 20 drill rows
- 90-day MTTD/MTTR averages
- Per-scenario pass-rate
- Friction-notes word cloud (planned)
