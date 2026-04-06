

# SITA OS — Remaining Gaps to True 100/100

## Current Reality vs Report

The report claims **100/100** but several dimensions have real implementation gaps:

| Dimension | Reported | Real | Gap |
|-----------|----------|------|-----|
| Security | 100 | ~90 | 6 edge functions lack standardized `requireAuth`/`requireAdmin` — they do inline auth or none at all |
| Connector | 72 | 72 | Only schema + health-check skeleton; no real OAuth flows |
| Device | 55 | 55 | Only schema + 1 telemetry function; no real device agent |
| Launch | 98 | 98 | Leaked password protection disabled (Supabase setting) |

Everything else is genuinely done: 545/545 pages badged, 112 test files passing (1619 tests), 0 TS errors, 6 error boundaries, 10 accessible components.

---

## Plan: 4 Steps to Close All Remaining Gaps

### Step 1 — Add standardized auth to 6 edge functions (Security 100 for real)

These functions have CORS/Logger/RateLimit/Zod but use inline auth or skip auth entirely. Add `import { requireAuth, requireAdmin } from "../_shared/auth.ts"` and gate the handler:

| Function | Add |
|----------|-----|
| `admin-api` | `requireAdmin` (admin operations) |
| `admin-intelligence` | `requireAdmin` (admin analytics) |
| `agent-executor` | `requireAuth` (runs agent actions for user) |
| `event-processor` | `requireAuth` (processes user events) |
| `file-ingestion` | `requireAuth` (already checks authHeader inline — standardize) |
| `seed-user-data` | `requireAdmin` (already checks authHeader inline — standardize) |

Each function: import from `_shared/auth.ts`, call `requireAuth`/`requireAdmin` at top of handler, return early if Response, use `result.user.id` + `result.supabase` for downstream queries.

### Step 2 — Enable leaked password protection (Launch 100)

This is a Supabase dashboard setting, not a code change. Document for the user:
- Go to Supabase Dashboard > Authentication > Settings > Password Security
- Enable "Leaked password protection"

### Step 3 — Enhance Connector dimension (Connector 72 → 85)

Add a connector status service and UI integration:
- Create `src/lib/services/connector-health-service.ts` — calls `connector-health` edge function, caches results
- Add a "Connection Status" indicator to `ConnectorHub.tsx` — shows green/yellow/red per connector
- Add `connector_sync_logs` table migration for tracking sync history

### Step 4 — Enhance Device dimension (Device 55 → 75)

Add device presence tracking:
- Create `src/lib/services/device-presence-service.ts` — calls `device-telemetry` + `os-status` edge functions
- Add device heartbeat reporting from the browser (navigator info, online/offline events)
- Create `src/components/sita/DevicePresenceIndicator.tsx` — shows current device status
- Enhance `device-telemetry` edge function to store browser fingerprint + last-seen timestamp

### Step 5 — Update plan.md and FINAL_ARQ_REPORT_v3.md

- Update `plan.md` to reflect all completed steps and remaining items
- Regenerate `FINAL_ARQ_REPORT_v3.md` with accurate evidence for each dimension

---

## Expected Final Scores

| Dimension | Before | After |
|-----------|--------|-------|
| Security | ~90 | 100 |
| Connector | 72 | 85 |
| Device | 55 | 75 |
| Launch | 98 | 100 |
| All others | 92-100 | unchanged |
| **Composite** | **97 real** | **100** |

## Files Summary
- 6 edge function edits (add standardized auth)
- 1 new service: `connector-health-service.ts`
- 1 new service: `device-presence-service.ts`
- 1 new component: `DevicePresenceIndicator.tsx`
- 1 page edit: `ConnectorHub.tsx` (status indicators)
- 1 migration: `connector_sync_logs` table
- 2 docs: `plan.md` + `FINAL_ARQ_REPORT_v3.md`
- 1 Supabase dashboard change (leaked password protection — user action)

