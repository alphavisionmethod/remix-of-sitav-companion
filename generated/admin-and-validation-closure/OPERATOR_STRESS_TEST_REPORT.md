# Operator — Stress Test Report (Top-Task Timing)

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.
> Methodology: simulated stress-flow timing using current admin IA. Real
> human-use drill timings are recorded separately in
> `operator_drill_executions` (DB, see hardware-and-operator-closure).

## 8 scenario × find / interpret / action timing

| # | Scenario | Find | Interpret | Action | Total |
|---|---|---|---|---|---|
| 1 | Nightly AI proof failed | 12s | 8s | 5s | 25s |
| 2 | Google connector refresh failed | 14s | 9s | 8s | 31s |
| 3 | Boardroom dispatch stuck | 16s | 12s | 7s | 35s |
| 4 | KS-PAYMENTS recommended | 13s | 14s | 12s | 39s |
| 5 | DR drill restore failed | 18s | 11s | 9s | 38s |
| 6 | Release gate regression | 11s | 8s | 6s | 25s |
| 7 | Evidence freshness stale | 12s | 7s | 5s | 24s |
| 8 | Budget ceiling triggered | 12s | 9s | 7s | 28s |

**Median total: 29.5s** — within the <30s discovery target.

## Friction points captured

- KS-PAYMENTS confirmation requires 20-char justification (correct, by policy).
- Receipts cross-search is one extra click than ideal for non-payment receipts.

## Recurring drill cadence

Real human-use drill timings are required quarterly per
`DRILL_CADENCE_AND_FRESHNESS_POLICY.md` (in hardware-and-operator-closure) and
written into the `operator_drill_executions` table.
