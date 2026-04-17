

## Fix C-015: Budget Gate Not Enforced at Runtime — actual state

### Live findings (deeper than the brief)

I queried the live DB and read every gateway/edge function:

1. 🔴 **`check_ai_budget_policies` RPC does NOT exist in the DB.** The gateway, `check-ai-budget`, `_shared/ai-budget-check.ts`, `personal-brain`, and `admin-ai-workforce-run` all call it via `serviceClient.rpc(...)` — every call returns an error and silently fails open through the `catch` blocks. **Today, budget enforcement is a no-op for every AI invocation.**

2. 🔴 **Tables the gateway writes to don't exist either**: `ai_usage_ledger`, `ai_receipt_records`, `ai_fallback_events`, `ai_budget_alerts`. Every insert silently 404s. There is no usage truth being persisted.

3. ✅ **`ai_workforce_budget_classes` exists** with the right shape: `class_key`, `max_calls_per_hour`, `max_cost_cents_per_call`, `max_tokens_per_call`, `allowed_models`, `priority_order` — and is per-user.

4. ✅ **`ai_workforce_role_task_permissions`** has `budget_class_key`, `role_key`, `task_key`, `requires_approval`.

5. ✅ **`ai_workforce_invocations`** has `cost_cents`, `tokens_in/out`, `model_used`, `status`, `created_at` — the complete observation table for hourly windowing.

6. ✅ **`ai_inference_receipts`** exists and IS being written (legacy receipt path works). Good audit trail already.

### The fix — 3 surgical changes

**1. DB migration: create `check_ai_budget_policies` RPC + the missing usage tables**

Create the RPC with the exact return shape every caller already expects (`allowed`, `should_block`, `should_downgrade`, `reason`, `policy_key`, `pct`, `alert_state`, `premium_blocked`, `fallback_model_id`):

```sql
CREATE OR REPLACE FUNCTION public.check_ai_budget_policies(
  p_user_id uuid, p_capability_key text, p_estimated_cost_usd numeric
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$ ... $$;
```

Logic:
- Resolve `role_key` and `budget_class_key` from `ai_workforce_role_task_permissions` (best match by capability or default class).
- Pull `ai_workforce_budget_classes` row for that user + class.
- Count invocations in last 1h from `ai_workforce_invocations` for the same role.
- Sum `cost_cents` in last 24h for daily budget pct.
- Return:
  - `should_block=true` if hourly count ≥ `max_calls_per_hour` → reason `hourly_call_limit_exceeded`
  - `should_block=true` if `p_estimated_cost_usd*100 > max_cost_cents_per_call` → reason `per_call_cost_exceeded`
  - `should_downgrade=true` + `fallback_model_id` if pct ≥ 80% of daily envelope
  - `premium_blocked=true` if class is non-premium and capability requested premium synthesis
  - `alert_state` = `warning` (≥60%), `critical` (≥85%), `ok` otherwise; `pct` numeric
  - Sane defaults if no class found: `{ allowed: true, reason: "no_policy" }`

Also create the 4 missing tables that the gateway already writes to (so receipts stop silently dropping):
- `ai_usage_ledger` (id, user_id, capability_key, mode, request_class, status, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, latency_ms, error_code, error_summary, created_at, expires_at default 365d)
- `ai_receipt_records` (id, user_id, capability_key, mode, decision_class, degraded_reason, usage_ledger_id, created_at, expires_at default 365d)
- `ai_fallback_events` (id, user_id, capability_key, fallback_reason, result_state, created_at)
- `ai_budget_alerts` (id, user_id, scope_type, scope_ref, threshold_percent, observed_cost_usd, period_class, alert_state, created_at)

All with: RLS enabled, owner-scoped SELECT policy, service-role-only INSERT (deny client writes), indexes on `(user_id, created_at desc)`, and `expires_at` indexes for the cleanup function (auto-extends C-014 coverage).

**2. Edge function: harden `_shared/ai-budget-check.ts` so failures are loud**

Change the fail-open behavior to be observable:
- Keep allow-on-error semantics for legacy callers but emit a `console.warn` with structured `{capability_key, estimated_cost_usd, error}` so the issue is visible in edge function logs (and in the new error_events for C-014).
- Add a `strict: true` option (used by `ai-gateway` and `admin-ai-workforce-run`) that returns `{ allowed: false, reason: 'enforcement_unavailable' }` instead — fail-closed for the choke point.
- Wire `ai-gateway/index.ts` and `admin-ai-workforce-run/index.ts` to use `strict: true`.

**3. Add seed defaults so new users get a real envelope**

Migration adds a one-time backfill: for every user with at least one row in `ai_workforce_invocations` but no rows in `ai_workforce_budget_classes`, insert 3 default classes (`utility`, `balanced`, `premium`) with sane caps (e.g. 60/30/10 calls/h, 5/25/100 cents/call). Also create a trigger on `auth.users` insert to seed these for new signups (mirrors `handle_new_user`).

### Files

| File | Change |
|---|---|
| `supabase/migrations/<ts>_ai_budget_enforcement.sql` | NEW — `check_ai_budget_policies` RPC, 4 missing usage/receipt/fallback/alert tables with RLS + indexes, default-class seeder function + trigger, one-time backfill |
| `supabase/functions/_shared/ai-budget-check.ts` | Add `strict` option; structured warn-logging |
| `supabase/functions/ai-gateway/index.ts` | Switch to shared `checkAIBudget(serviceClient, ..., { strict: true })`; remove duplicate inline RPC call |
| `supabase/functions/admin-ai-workforce-run/index.ts` | Same switch — strict mode, no more silent skip |
| `supabase/functions/check-ai-budget/index.ts` | Use shared helper; cleaner error semantics |
| `supabase/functions/personal-brain/index.ts` | Same switch (currently calls RPC inline) |
| `tests/integration/ai-budget-gate.test.ts` | NEW — set `max_calls_per_hour=2`, fire 3 calls, expect 3rd→429 with `hourly_call_limit_exceeded` |

### Acceptance

- `check_ai_budget_policies` RPC exists and returns the documented shape; admin can SELECT it.
- Setting `max_calls_per_hour=2` for a user → 3rd ai-gateway call within an hour returns **429** with `reason: "hourly_call_limit_exceeded"` and `policy_key` set.
- A call exceeding `max_cost_cents_per_call` returns 429 with `reason: "per_call_cost_exceeded"`.
- At 80% daily spend, gateway downgrades to `fallback_model_id` and writes an `ai_budget_alerts` row with `alert_state="warning"`.
- `ai_usage_ledger`, `ai_receipt_records`, `ai_fallback_events` rows are now created (visible in DB) — receipts stop silently dropping.
- New users automatically get 3 default budget classes via trigger.
- Edge logs now show structured budget warnings instead of silent fail-open.
- 0 TS errors, 0 silent error→allow fallbacks at the gateway choke points.
- C-015 moves 🟡 PARTIAL → ✅ RESOLVED, deployment-ready.

