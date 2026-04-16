

# SITA OS — Final Edge Function Gap Fix

## Current State

The codebase has **0 TypeScript errors** and all previously identified P0/P1 gaps are resolved. Error monitoring and GlobalErrorBoundary are correctly wired.

However, **2 edge functions are invoked in frontend code but do not exist** as deployed functions:

| Missing Function | Invoked From | Purpose |
|-----------------|-------------|---------|
| `connector-sync` | `src/lib/capabilities/admin-capabilities.ts` | Trigger connector data synchronization |
| `health-check` | `src/lib/observability/health-probes.ts` | System health ping endpoint |

Both callers have graceful error handling (`.catch()` or error checks), so the app doesn't crash — but the calls silently fail.

## Fix Plan

### 1. Create `supabase/functions/connector-sync/index.ts`
- Handles actions: `sync`, `status`, `history`
- JWT-authenticated, admin role check
- Uses `_shared/cors.ts`, `_shared/auth.ts`
- Delegates to connector tables for sync state

### 2. Create `supabase/functions/health-check/index.ts`
- Lightweight ping endpoint (responds to `{ ping: true }`)
- Returns system status, timestamp, edge function version
- No auth required (used for uptime probing)
- Uses `_shared/cors.ts`

### 3. Update `REMEDIATION_PENDING_BLOCKERS.md`
- Add these 2 as resolved items

## Files Created: 2 edge functions + 1 doc update
## Build Impact: None (0 TS errors maintained)

