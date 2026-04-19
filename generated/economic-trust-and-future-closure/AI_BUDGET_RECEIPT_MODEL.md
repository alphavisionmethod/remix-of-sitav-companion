# AI Budget Receipt Model

**Generated:** 2026-04-19

## Table: `ai_budget_decision_receipts`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid | Subject |
| `capability_key` | text | e.g. `advisor.deep-intel` |
| `decision` | text | `allow` / `degrade` / `block` |
| `policy_rule` | text | Human-readable rule fired |
| `reason` | text | Operator-readable explanation |
| `cost_estimate_cents` | int | Pre-call estimate |
| `actual_cost_cents` | int (nullable) | Post-call reconciliation |
| `daily_pct` | numeric | Daily cap % at decision time |
| `monthly_pct` | numeric | Monthly cap % at decision time |
| `fallback_model_id` | text (nullable) | Set when decision = degrade |
| `pre_check_state` | jsonb | Snapshot of inputs |
| `correlation_id` | text (nullable) | Trace linkage |
| `created_at` | timestamptz | Immutable |
| `expires_at` | timestamptz | 90-day TTL |

## Immutability rules

- Inserted via `record_budget_decision()` SECURITY DEFINER RPC only
- No UPDATE policy — receipts are append-only
- `actual_cost_cents` reconciliation done via separate row (linked by `correlation_id`), not mutation
- Read-only RLS for the owning user; admins read via `has_admin_permission`

## Verification surfaces

- Truth panel: `EconomicTrustFutureTruthPanel` aggregates last 500 receipts by `decision`
- Validator: `check-negative-receipts-emitted.ts` scans for receipt-emission patterns in callers
