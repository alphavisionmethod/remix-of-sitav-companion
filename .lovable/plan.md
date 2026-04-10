

# SITA OS — AI Gateway: Final Enhancement — Missing Performance Indexes

## Current State
All 10 canonical tables, 4 views, 9 admin pages (AIG01-AIG09), 9 service files, the central ai-gateway edge function, client SDK, hooks, shared budget/receipt utilities, and 3 DB functions are 100% live and correctly wired.

## Gap Found: 5 Missing Performance Indexes

The spec requires indexes that don't yet exist:

| Table | Missing Index | Purpose |
|-------|--------------|---------|
| `ai_model_registry` | `quality_tier` | Filter models by tier in routing |
| `ai_model_registry` | `cost_tier` | Filter models by cost class |
| `ai_model_registry` | `provider_registry_id` | Join to provider registry |
| `ai_usage_ledger` | `model_id` | Query spend by model |
| `ai_usage_ledger` | `workspace_id` | Query spend by workspace |

## Implementation

**1 migration** to add the 5 missing indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_quality ON ai_model_registry(quality_tier);
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_cost ON ai_model_registry(cost_tier);
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_provider ON ai_model_registry(provider_registry_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_model ON ai_usage_ledger(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_workspace ON ai_usage_ledger(workspace_id);
```

## What This Does NOT Change
- No new tables (all 10 exist)
- No new columns (all spec columns present)
- No frontend changes
- No edge function changes
- No service layer changes
- No view changes

## Summary
1 migration, 5 indexes. Closes the last gap. After this, the AI Gateway schema is 100% spec-complete.

