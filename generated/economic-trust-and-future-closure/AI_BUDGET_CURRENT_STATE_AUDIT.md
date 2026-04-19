# AI Budget — Current State Audit

**Generated:** 2026-04-19
**Closure:** economic-trust-future
**Status:** SHIPPED (runtime-enforced, receipt-backed)

## Canonical tables (live in DB)

| Table | Purpose | RLS | TTL |
|---|---|---|---|
| `ai_user_hard_ceilings` | Per-user daily/monthly caps + degrade target model | Yes | None (config) |
| `ai_budget_decision_receipts` | Every allow/degrade/block decision with policy rule + cost state | Yes | 90 days |
| `ai_usage_ledger` | Token + cost ledger per invocation | Yes | 365 days |
| `ai_receipt_records` | Per-call decision receipts | Yes | 365 days |
| `ai_fallback_events` | Provider/model fallback events | Yes | 90 days |
| `ai_budget_alerts` | 80% / 100% threshold alerts | Yes | 30 days |

## Canonical RPCs

- `check_user_hard_ceiling(user_id, capability_key, est_cost_cents)` — pre-call enforcement, returns `{decision, fallback_model_id, reason}`
- `check_ai_budget_policies(...)` — central budget gate (hourly + daily + per-call + premium gating)
- `record_budget_decision(...)` — immutable receipt write

## Enforcement points

- `supabase/functions/ai-gateway/index.ts` — pre-call `check_user_hard_ceiling` + `check_ai_budget_policies`
- `supabase/functions/_shared/ai-budget-check.ts` — shared helper used by all callers
- Fail-closed: if RPC unavailable, request is denied (no silent passthrough)

## UI surface

- Admin → AI Engineer → "Economic, Trust & Future Truth" tab (live `ai_user_hard_ceilings` rows + recent `ai_budget_decision_receipts` aggregation)

## Honest limits

- `ai-budget-hard-stop` validator returns WARN (`pending-execution`) until first real load-test run via `scripts/load-test/budget-load-test.sh`
- 80%-of-cap degrade path requires production traffic to verify in steady state
