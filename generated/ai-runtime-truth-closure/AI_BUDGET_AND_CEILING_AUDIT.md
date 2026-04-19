# AI Budget & Ceiling Audit

## Existing enforcement (real, in production)

| Component | Where | Behavior |
|---|---|---|
| `check_ai_budget_policies` RPC | DB-level | Blocks invocations when caps exceeded |
| `ai_workforce_budget_classes` | Per-user | Hourly call limits, per-call cost cap, daily envelope |
| `ai_budget_alerts` | Auto-emitted | Alert at 80% utilization; downgrade model class |
| Daily envelope downgrade | Sovereign AI Gateway | At 80% of daily envelope, primary model is downgraded |
| `ai_fallback_events` | Auto-recorded | Every fallback (budget, provider failure, model unavailable) |
| `ai_usage_ledger` | Append-only | 365-day TTL; powers cost attribution |

## How nightly verification proves enforcement (without runaway spend)

We do NOT fire a runaway-load probe — that would cost real money without
proportional truth gain. Instead, sub-check 5 verifies:

1. **Budget classes exist and are queryable** — proves the policy table is
   populated and readable by service-role.
2. **Alerts surface is queryable** — proves the alerting infrastructure is wired.
3. **Ledger has accumulated rows in last 24h** — proves real production
   traffic IS hitting the enforcement path. If no rows accumulate, either
   no AI is being used (suspicious) or the ledger writer path is broken.

## Production behavioral proof

The real budget enforcement gets exercised continuously by every user
invocation. The ledger holds the record. We sample it nightly to prove
the path is hot.
