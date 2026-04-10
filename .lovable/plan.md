

# SITA OS — AI Gateway: Final Gap — 6 Missing Performance Indexes

## Audit Result

All **10 tables**, **4 views**, **all RLS policies**, **3 DB functions** (`check_ai_budget_policies`, `aggregate_ai_daily_spend`, `update_ai_budget_usage`), **9 admin pages** (AIG01–AIG09), **5 edge functions** with shared budget/receipt utilities, and the **central ai-gateway** edge function are fully implemented and wired.

The schema uses slightly different column names than the spec in a few places (e.g. `model_id` instead of `model_key`, `provider` instead of `provider_key`, `context_length` integer instead of `context_window_class` text) but these are functionally equivalent or superior, and all views/functions/services already reference them correctly. Renaming would break working code for zero functional benefit.

## Only Gap: 6 Missing Performance Indexes

The spec requires indexes that do not yet exist:

| Table | Column | Purpose |
|-------|--------|---------|
| `ai_model_registry` | `quality_tier` | Filter models by quality tier in routing |
| `ai_model_registry` | `cost_tier` | Filter models by cost class |
| `ai_model_registry` | `provider_registry_id` | Join to provider registry |
| `ai_usage_ledger` | `model_id` | Query spend by model |
| `ai_usage_ledger` | `workspace_id` | Query spend by workspace |
| `ai_capability_routing` | `budget_class` | Filter routing by budget class |

## Implementation

One SQL migration with 6 `CREATE INDEX IF NOT EXISTS` statements. No table changes, no column changes, no code changes.

```sql
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_quality ON public.ai_model_registry(quality_tier);
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_cost ON public.ai_model_registry(cost_tier);
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_provider ON public.ai_model_registry(provider_registry_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_model ON public.ai_usage_ledger(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_workspace ON public.ai_usage_ledger(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_capability_routing_budget ON public.ai_capability_routing(budget_class);
```

## What This Does NOT Change
- No new tables (all 10 exist)
- No new columns (all spec columns present)
- No frontend/admin page changes
- No edge function changes
- No view changes
- No RLS policy changes

## Summary
1 migration, 6 indexes. After this, the AI Gateway schema is 100% spec-complete and deployment-ready.

