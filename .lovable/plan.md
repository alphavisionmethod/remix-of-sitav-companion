

# SITA OS — Full Deployment Readiness Audit

## Summary

Deep audit across edge functions, routing, contracts, kernels, and deployment artifacts. Found 5 categories of issues, none are showstoppers but several should be fixed for production hygiene.

---

## Issue 1: Duplicate Route Definitions (Medium)

**App.tsx** defines admin routes inline (lines 1522-1555) AND loads them again via `getAdminRoutes()` at line 1819. The following paths are registered twice:

- `/admin/dashboard`, `/admin/team`, `/admin/system`, `/admin/users`, `/admin/ai-tokens`, `/admin/generated-truth`, `/admin/fleet-health`

React Router uses first-match, so the inline definitions win and the duplicates in `getAdminRoutes()` are dead code. This wastes bundle via duplicate lazy imports in both `App.tsx` and `AdminRoutes.tsx`.

**Fix:** Remove the 7 overlapping route definitions from the inline block in App.tsx (lines 1524-1530), since `getAdminRoutes()` already handles them inside an `AdminShellLayout`. OR remove them from `AdminRoutes.tsx` — whichever layout wrapping is correct. Also remove the corresponding duplicate lazy import declarations from App.tsx (lines 168-179 for `GeneratedTruthDashboard`, `FleetHealthPage`, `AdminDashboard`, `TeamManagement`, `SystemManagement`, `UserManagement`, `AITokenDashboard`).

---

## Issue 2: Edge Function SDK Version Drift (Low-Medium)

41 edge functions use `@supabase/supabase-js` but with 3 different versions:
- `2.49.4` — majority (correct, latest)
- `2.49.1` — `admin-ai-workforce-run`, `check-ai-budget`, `system-updates`, `event-processor`
- **`2.39.3`** — `connector-operations` (10 minor versions behind)

**Fix:** Standardize all to `2.49.4`. Search-and-replace across all edge function `index.ts` files.

---

## Issue 3: `admin-intelligence` Double Body Consumption (Low)

Lines 46 validates body via `req.json()` but discards the result. The function is primarily GET-based (routes by URL path), so POST calls would crash. Low risk since clients use GET, but still a latent bug.

**Fix:** Apply the same parse-once pattern used in other functions.

---

## Issue 4: `as unknown` Property Access in Edge Functions (Low)

`payment-process/index.ts` (line 89-91) casts `approval.payload as unknown` then accesses `.amount_cents` — TypeScript should flag this. Same pattern in `admin-api/index.ts` at lines 112, 133, 162, 191, 206, 227, 257. Works at runtime (JS ignores types) but is incorrect TypeScript.

**Fix:** Change `as unknown` to `as Record<string, any>` in these destructuring patterns.

---

## Issue 5: `as any` in 13 Page Files (Low, Tracked)

142 uses of `as any` across 13 page files. Production truth dashboard says 0, which means the dashboard check may be stale or scoped differently. Most are select/filter casts — low runtime risk but violates type safety goals.

**Fix:** Not blocking deployment. Track for future type hardening sprint.

---

## What Passed (No Issues Found)

- **Contract boundaries**: Zero violations — no React imports, no runtime imports, no forbidden domain references
- **Security**: No `localStorage` role checks, no `execute_sql`, no direct LLM calls outside gateway
- **Kernel contracts**: Clean barrel exports, zero runtime dependencies
- **PWA**: manifest.webmanifest + icon-192 + icon-512 present
- **Deployment artifacts**: Dockerfile, docker-compose.yml, nginx config all present
- **DB linter**: Clean (1 low-priority leaked password protection warning — pre-existing)
- **Architecture rules**: No forbidden domains (crm-os, office-os, etc.), no cross-domain imports
- **CalmAssistantChat**: Import dedup previously fixed, clean now

---

## Files to Change

| File | Change |
|------|--------|
| `src/App.tsx` | Remove 7 duplicate route definitions + 7 duplicate lazy imports |
| `supabase/functions/connector-operations/index.ts` | `2.39.3` → `2.49.4` |
| `supabase/functions/admin-ai-workforce-run/index.ts` | `2.49.1` → `2.49.4` |
| `supabase/functions/check-ai-budget/index.ts` | `2.49.1` → `2.49.4` |
| `supabase/functions/system-updates/index.ts` | `2.49.1` → `2.49.4` |
| `supabase/functions/event-processor/index.ts` | `2.49.1` → `2.49.4` |
| `supabase/functions/admin-intelligence/index.ts` | Fix double body parse |
| `supabase/functions/payment-process/index.ts` | `as unknown` → `as Record<string, any>` |
| `supabase/functions/admin-api/index.ts` | `as unknown` → `as Record<string, any>` (6 occurrences) |

Redeploy: `connector-operations`, `admin-ai-workforce-run`, `check-ai-budget`, `system-updates`, `event-processor`, `admin-intelligence`, `payment-process`, `admin-api`

No database changes. No new files.

