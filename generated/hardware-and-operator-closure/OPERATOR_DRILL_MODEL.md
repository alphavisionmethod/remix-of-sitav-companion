# Operator Drill Model

## 8 drill categories × 6 dimensions

For each scenario, the drill captures pass/fail across 6 operator capabilities:

| Dimension | What it tests |
|---|---|
| `detect_pass` | Operator noticed the incident in the right surface within MTTD target |
| `select_runbook_pass` | Operator chose the canonical runbook for the symptom |
| `kill_switch_pass` | Operator armed/disarmed the correct kill-switch (or correctly chose not to) |
| `evidence_pass` | Operator inspected the right evidence (logs, receipts, gate reports) |
| `rollback_pass` | Operator executed rollback / recovery action successfully |
| `confirm_pass` | Operator confirmed system returned to healthy state with proof |

## 8 drill scenarios

1. **ai-runtime-failure** — nightly verifier reported degraded
2. **connector-degraded** — Google/MS/Slack refresh expired
3. **boardroom-stuck** — Layer 7 dispatch stuck >6h
4. **native-integrity** — dm-verity mismatch on boot
5. **budget-ceiling** — AI cost ceiling tripped
6. **restore-drill** — DB point-in-time restore
7. **kill-switch-decision** — manual KS-PAYMENTS arming
8. **incident-triage** — multi-symptom incident

## Persistence

`public.operator_drill_executions` (admin RLS, realtime). Schema includes MTTD, MTTR, all 6 dimensions, friction notes, signoff timestamp.
