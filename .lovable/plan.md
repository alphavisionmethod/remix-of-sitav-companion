

# Implement 3 Active Connector Edge Functions — discover, transform, batch

## Summary

Create 3 new edge functions following the established SITA OS connector edge function pattern (auth via `_shared/auth.ts`, CORS, rate limiting, Zod validation, audit logging). These fill the last connector scaffold gaps.

All required DB tables exist: `connector_registry`, `connector_accounts`, `connector_configs`, `connector_credentials`, `audit_logs`.

## Functions to Build

### 1. `connector-discover` (~180 lines)
**Actions**: `scan` | `match` | `recommend` | `catalog`
- `scan`: Queries `connector_registry` for all available connectors, returns grouped by `connector_class` with active/inactive status
- `match`: Takes a business domain (e.g. "accounting", "email", "calendar") and returns ranked connector matches from registry using metadata + tags
- `recommend`: Based on user's existing `connector_accounts`, recommends complementary connectors they don't have yet (e.g. "You have Stripe but not QuickBooks")
- `catalog`: Returns full enriched catalog — registry entries + user's connection status + health status from `connector_configs`
- Writes discovery events to `audit_logs`

### 2. `connector-transform` (~200 lines)
**Actions**: `normalize` | `map-fields` | `convert` | `validate-schema`
- `normalize`: Takes raw connector data (e.g. different CRM formats) and normalizes to SITA canonical schema (contacts → `customers`, deals → `opportunities`)
- `map-fields`: Returns field mapping between a source connector schema and SITA target table, auto-detecting matches by name/type similarity
- `convert`: Transforms data between connector formats (e.g. Stripe invoice → SITA invoice format, QuickBooks contact → SITA customer)
- `validate-schema`: Validates a data payload against a target SITA table schema, returning errors for missing/wrong-type fields
- All transforms are deterministic, no AI

### 3. `connector-batch` (~190 lines)
**Actions**: `submit` | `status` | `cancel` | `list` | `retry-failed`
- `submit`: Accepts an array of operations (up to 100), validates each, creates a batch record in `audit_logs` with correlation ID, processes sequentially with per-item error isolation
- `status`: Returns batch progress — total/completed/failed/pending counts by correlation ID
- `cancel`: Marks remaining unprocessed items as cancelled
- `list`: Returns user's recent batches with summary stats
- `retry-failed`: Re-queues failed items from a batch for reprocessing
- Each item gets its own audit log entry linked by correlation ID

## Shared Pattern (All 3)

```text
1. OPTIONS → CORS
2. Rate limit (60/min)
3. Auth via requireAuth()
4. Zod body validation per action
5. Business logic + DB
6. Audit log entry
7. Structured JSON response
```

## Files Created

| File | Lines (est.) |
|------|-------------|
| `supabase/functions/connector-discover/index.ts` | ~180 |
| `supabase/functions/connector-transform/index.ts` | ~200 |
| `supabase/functions/connector-batch/index.ts` | ~190 |

## Files Updated

| File | Change |
|------|--------|
| `scripts/check-edge-function-health.ts` | Add 3 functions to required list |

## No Database Migration Needed
All tables exist.

