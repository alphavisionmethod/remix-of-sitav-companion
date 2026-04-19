# Per-User AI Ceiling Model

**Generated:** 2026-04-19

## Schema (`ai_user_hard_ceilings`)

| Column | Type | Default | Semantics |
|---|---|---|---|
| `user_id` | uuid (PK) | — | Owner |
| `daily_calls_cap` | int | 1000 | Hard daily call limit |
| `daily_cost_cents_cap` | int | 500 | Hard daily $ cap (cents) |
| `monthly_cost_cents_cap` | int | 10000 | Hard monthly $ cap (cents) |
| `degrade_to_model_id` | text | `google/gemini-2.5-flash-lite` | Auto-downgrade target at 80% |
| `effective_from` | timestamptz | now() | Activation timestamp |
| `notes` | text | null | Operator notes |

## Decision contract

`check_user_hard_ceiling()` returns one of:

| Decision | When | Receipt fields |
|---|---|---|
| `allow` | Below 80% daily AND monthly | policy_rule = `under_threshold` |
| `degrade` | 80–100% daily OR monthly | policy_rule = `degrade_at_80pct`, fallback_model_id set |
| `block` | At or above 100% on either axis | policy_rule = `hard_stop`, reason includes axis |

## Hard-stop semantics

- Block is **immutable** for the remainder of the day/month window
- No retry logic — caller must escalate or wait for window reset
- `ai_budget_decision_receipts` row is written for every decision (allow/degrade/block) — no silent denials
