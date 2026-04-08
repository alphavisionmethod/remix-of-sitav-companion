

# SITA OS — Full Gap Audit: What's Missing for Production-Ready

## Current State (What's Done)
- 0 TypeScript errors (`tsc --noEmit` clean)
- 0 `as any` in `src/pages/` (was 69)
- 0 `as unknown as` in `src/pages/` (was 11)
- Architecture boundary checks pass (0 violations)
- 169 test files with substantial coverage
- Auth flow working (login, signup, reset, demo mode)
- 52 edge functions deployed
- ~200+ admin pages, ~100+ user-facing pages
- Type guards and relation parsers established

---

## Remaining Gaps (Ordered by Severity)

### P0 — Type Safety Debt Still Hidden

**1. 3,700+ `: any)` callback parameters across 237 page files**
This is the single largest remaining type gap. Pattern:
```ts
data.map((row: any) => ...)
.filter((r: any) => r.status === "pass")
.then(({ data }: any) => ...)
```
These hide the same class of bugs we just fixed (`as any`), just in a different syntax. ~237 files affected.

**Fix:** For each query result, type the callback parameter using DB row types or view-model interfaces. Bulk-fixable per-domain.

**2. 66 `useState<any>` across 11 page files**
Files: `DWE01–07`, `ReplayRecoveryConsole`, `AIT02RoleRegistry`, `AdvisorCouncilDashboard`, `OwnerCenter`.
These produce `any`-typed state that infects all downstream usage.

**Fix:** Replace with typed state: `useState<DeviceTrustRecord[]>([])`, etc.

**3. 7 admin DWE pages use raw `useEffect` + `fromTable().then()` instead of `useQuery`**
Files: `DWE01` through `DWE07`. They use `useState<any[]>` + bare `useEffect` fetches with no error handling, no loading states, no cache invalidation.

**Fix:** Migrate to `useQuery` pattern matching the rest of the codebase.

---

### P1 — Security

**4. RLS policies on 30 tables use `{public}` role instead of `{authenticated}`**
Security scan flagged: `vault_items`, `health_logs`, `tax_estimates`, `appointments`, `money_approvals`, `receivables`, `trade_orders`, etc. While `auth.uid() = user_id` prevents actual data leaks today, this violates least-privilege.

**Fix:** Migration to change all 30 policies from `public` to `authenticated`.

**5. Leaked password protection disabled**
Flagged by security scanner (currently ignored with note "configured via dashboard"). Should be enabled in Supabase Dashboard → Auth → Settings.

---

### P2 — Architecture Compliance

**6. 131 orphan service warnings in `service-manifest.json`**
All entries resolve to `"undefined"` name/ID. The manifest generator (`sync-registry-manifests.ts`) is producing broken entries.

**Fix:** Fix the manifest generator to correctly read service metadata, then regenerate.

**7. Mock data still used as production fallback in ~89 pages**
Pattern: `isDemoMode ? MOCK_DATA : liveData`. This is correct for demo mode, but some pages fall back to mock data when live queries return empty — masking real data issues.

**Fix:** Audit each page to ensure mock data is ONLY used when `isDemoMode === true`, never as a silent fallback for empty live data.

---

### P3 — Sprint Plan Incomplete Items

**8. Concierge depth (Sprint 2 remaining)**
- Calendar reconciliation not implemented
- Task delegation flow incomplete

**9. Right contextual rail**
Not built yet. Mentioned in sprint plan as NEXT.

**10. Context switcher (household/org/entity)**
`EntityContextProvider` exists but no UI switcher component.

**11. Advisor workspace completion**
Single advisor view exists but simulation studio integration is partial.

---

### P4 — Code Quality / Maintenance

**12. 24 mock data files in `src/lib/mock-data/`**
These should be consolidated into `src/lib/demo-data/` (some already migrated). Having both `mock-data/` and `demo-data/` directories creates confusion about which is canonical.

**13. 3 remaining `as any` in platform bridges**
In `push-registration-service.ts` — `(window as any)?.Capacitor` and `(window as any).electron`. These are acceptable for native platform detection but should use the typed declarations in `vite-env.d.ts`.

**14. Test `as any` in test files**
5 instances in test files (`self-healing.test.ts`, `capability-registry.integration.test.ts`). Low priority but technically violates the "no `as any`" standard.

---

## Recommended Implementation Order

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| **P0-1** | Type all `: any)` callbacks in pages | ~237 files | Large (split by domain) |
| **P0-2** | Fix 66 `useState<any>` | 11 files | Medium |
| **P0-3** | Migrate DWE01–07 from useEffect to useQuery | 7 files | Medium |
| **P1-1** | Fix 30 RLS policies: public → authenticated | 1 migration | Small |
| **P2-1** | Fix service-manifest generator | 1-2 files | Small |
| **P2-2** | Audit mock fallback paths | ~89 files | Medium |
| **P3** | Sprint 2 remaining features | Multiple | Large |
| **P4** | Consolidate mock-data → demo-data | ~24 files | Medium |

### What's Actually Ready
- Auth, routing, shell, sidebar, theming — production-ready
- Type safety at page level (the layer we just fixed) — clean
- Edge functions — deployed and functional
- Architecture contracts and boundary enforcement — working
- Test infrastructure — comprehensive

### What Blocks "Fully Advanced"
The **3,700+ `: any)` callbacks** are the elephant in the room. Every query result, every `.map()`, every `.filter()` in those 237 files is operating on untyped data. This is the same class of problem we solved for `as any` — just 50x more instances. Fixing it systematically (domain by domain, using DB row types) would make the codebase genuinely type-safe end-to-end.

