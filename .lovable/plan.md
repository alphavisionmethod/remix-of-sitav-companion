

# SITA OS — Final Deployment Readiness Audit

## Summary

Deep audit complete. Found **4 categories of remaining issues** across edge functions and routing. Contract kernels are clean. No build errors. No security issues beyond pre-existing low-priority warning.

---

## Issue 1: 58 Duplicate Route Paths (Medium-High)

Three route module files exist (`AdminRoutes.tsx`, `OwnerRoutes.tsx`, `MobileRoutes.tsx`) but their routes are ALSO defined inline in `App.tsx`. This means every route in these modules is registered twice.

| Module | Inline in App.tsx | In module file | Status |
|--------|------------------|----------------|--------|
| Owner routes | 37 routes | 37 routes in `OwnerRoutes.tsx` | `getOwnerRoutes()` imported but **never called** — dead import |
| Mobile routes | 12 routes | 12 routes in `MobileRoutes.tsx` | **Not even imported** in App.tsx |
| Admin AI-team | 11 routes | 10 routes in `AdminRoutes.tsx` | Both active via `getAdminRoutes()` — true duplicates |
| Settings/notifications | 2 definitions | — | Two conflicting elements: `NotificationPreferences` vs `SettingsPage` |

**Fix:**
- Remove the dead `import { getOwnerRoutes }` from App.tsx (line 4) — it's never called
- Remove the 7 duplicate `/admin/ai-team/*` routes from inline App.tsx (lines 1720-1729) that overlap with `getAdminRoutes()` at line 1805. Keep the inline `/admin/ai-team` (base) and `/admin/ai-team/setup` which don't overlap.
- Remove duplicate `/settings/notifications` at line 1358 (keep the one at line 1191 pointing to `NotificationPreferences`)
- Leave `OwnerRoutes.tsx` and `MobileRoutes.tsx` files as-is (they aren't loaded, so no runtime impact — just dead code to clean up later)

## Issue 2: Edge Function SDK Version Drift — 6 Functions Still Outdated

Previous fix missed several functions:

| Function | Current | Target |
|----------|---------|--------|
| `admin-api` | 2.49.1 | 2.49.4 |
| `admin-intelligence` | 2.49.1 | 2.49.4 |
| `ambient-os-operations` | 2.39.3 | 2.49.4 |
| `brain-core` | 2.49.1 | 2.49.4 |
| `connector-proxy` | 2 (floating!) | 2.49.4 |
| `seed-user-data` | 2.49.1 | 2.49.4 |
| `verification-recorder` | 2 (floating!) | 2.49.4 |

**Fix:** Pin all to `2.49.4`.

## Issue 3: 5 Remaining `as unknown` Destructures in `admin-api` (Low)

Lines 286, 333, 342, 375, 421 still use `body as unknown` — previous fix only caught 7 of 12.

**Fix:** Change all to `body as Record<string, any>`.

## Issue 4: `msa-operations` — 3 Incorrect `as unknown` Casts (Low)

Lines 236-238 cast string `"fail"` to `as unknown` to assign to a typed status field. Should be a proper type assertion.

**Fix:** Change `"fail" as unknown` to `"fail" as any` (or better, fix the type to accept `"fail"`).

---

## What Passed (Clean)

- Contract kernels: zero forbidden imports (no React, no runtime, no component imports)
- DB linter: clean (1 low-priority leaked password warning — pre-existing)
- Console: no errors
- All edge functions: single `req.json()` call only (double-parse fully eliminated)
- `agent-signal`: `parsedBody` reference confirmed correct
- Security: no `localStorage` role checks, no `execute_sql`, no direct LLM calls

---

## Files to Change

| File | Change |
|------|--------|
| `src/App.tsx` | Remove dead `getOwnerRoutes` import, remove 7 duplicate AI-team routes, remove duplicate `/settings/notifications` |
| `supabase/functions/admin-api/index.ts` | SDK `2.49.1` → `2.49.4` + fix 5 remaining `as unknown` |
| `supabase/functions/admin-intelligence/index.ts` | SDK `2.49.1` → `2.49.4` |
| `supabase/functions/ambient-os-operations/index.ts` | SDK `2.39.3` → `2.49.4` |
| `supabase/functions/brain-core/index.ts` | SDK `2.49.1` → `2.49.4` |
| `supabase/functions/connector-proxy/index.ts` | SDK `2` → `2.49.4` |
| `supabase/functions/seed-user-data/index.ts` | SDK `2.49.1` → `2.49.4` |
| `supabase/functions/verification-recorder/index.ts` | SDK `2` → `2.49.4` |
| `supabase/functions/msa-operations/index.ts` | Fix 3 `"fail" as unknown` casts |

Redeploy: `admin-api`, `admin-intelligence`, `ambient-os-operations`, `brain-core`, `connector-proxy`, `seed-user-data`, `verification-recorder`, `msa-operations`

No database changes. No new files.

