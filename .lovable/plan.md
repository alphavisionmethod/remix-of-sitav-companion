

# SITA OS — Priority Fixes & Wiring for Deployment Readiness

## Problem

The audit documents claim several files were created, but they are **missing from the actual codebase**. These are the real gaps between documentation claims and repository reality.

## Missing Files (Must Create)

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 1 | `src/lib/services/error-monitoring-service.ts` | Centralized error capture + reporting via support-gateway | P0 |
| 2 | `supabase/functions/payment-kill-switch/index.ts` | Admin-controlled emergency payment disable | P0 |
| 3 | `supabase/functions/investment-portfolio-api/index.ts` | Portfolio CRUD, holdings, performance tracking | P1 |
| 4 | `supabase/functions/digital-twin-engine/index.ts` | Digital twin simulation + state management | P1 |
| 5 | `supabase/functions/simulation-engine-api/index.ts` | Scenario creation, parameter mutation, projections | P1 |
| 6 | `supabase/functions/communications-api/index.ts` | Message threads, send/receive, contacts | P1 |
| 7 | `supabase/functions/tasks-workflow-api/index.ts` | Task CRUD, workflow templates, status transitions | P1 |
| 8 | `supabase/functions/app-store-api/index.ts` | Catalog listing, install tracking, ratings | P1 |

## Wiring Fixes (Must Wire)

| # | Fix | Details |
|---|-----|---------|
| 9 | Wire error monitoring into App.tsx | Import and call `initErrorMonitoring()` at app startup |
| 10 | Wire GlobalErrorBoundary to report errors | Call `reportFatalError()` in `componentDidCatch` |
| 11 | Update `REMEDIATION_PENDING_BLOCKERS.md` | Mark P0 items 1-2 and P1 items 4-7 as RESOLVED |

## Implementation Details

### 1. Error Monitoring Service
- Captures `window.onerror` and `unhandledrejection` events
- Batches error reports and sends via `supabase.functions.invoke("support-gateway")`
- Exports `initErrorMonitoring()` and `reportFatalError()`

### 2. Payment Kill-Switch Edge Function
- POST with `{action: "activate" | "deactivate" | "status"}`
- JWT auth + admin role check via `has_role`
- Logs all actions to `admin_action_audit` table (or console if table absent)
- When active, `payment-process` should check kill-switch status

### 3-8. Six Domain API Edge Functions
Each follows the existing pattern from `payment-process/index.ts`:
- Uses `_shared/cors.ts`, `_shared/auth.ts`, `_shared/zod-validate.ts`
- JWT-authenticated, discriminated union action schema
- Proper CORS handling

### 9-10. App.tsx + GlobalErrorBoundary Wiring
- Import `initErrorMonitoring` in App.tsx and call it before render
- In `GlobalErrorBoundary.componentDidCatch`, call `reportFatalError`

### 11. Update Blockers Document
- Reflect actual resolved state

## Build Verification
- Run `npx tsc --noEmit` to confirm 0 errors after all changes

## Files Changed/Created: 10 files

