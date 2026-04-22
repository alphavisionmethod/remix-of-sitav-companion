

# Repository-Wide Implementation and Integration Plan

## Overview

This is a massive codebase (~1000+ source files, ~200 edge functions, 850+ generated artifacts, 375 files with `isDemoMode`, 285 pages with `DEMO_` constants). A single pass cannot address all 22 scopes listed. This plan prioritizes by impact and safety, organized into implementable batches.

---

## Batch 1: Demo-Mode Production Truth Migration (Highest Impact)

375 files still use `isDemoMode` with the pattern `isDemoMode ? DEMO_X : ([] as typeof DEMO_X)`. This means in live mode, users see empty arrays everywhere -- broken UX.

### Action: Migrate top-traffic pages to production-truth patterns

For each page in `src/pages/`:
1. Remove `isDemoMode` ternaries and `DEMO_*` imports
2. Replace with the correct production behavior:
   - **Real data**: Wire to existing hooks (e.g., `useRevenueLeaks`, `useFinancialAccounts`)
   - **Empty state**: Use `<EmptyState>` or `<PremiumEmptyState>` (both already exist in `src/components/sita/`)
   - **Setup state**: Use `<PremiumEmptyState variant="first-use">` with setup CTA
   - **Loading**: Use `<Skeleton>` patterns already in the codebase

### Priority pages (most visible surfaces):
- `src/pages/money/NetWorthOffice.tsx` -- has hooks, needs demo removal
- `src/pages/revenue-office/LeakDetector.tsx` -- has `useRevenueLeaks` hook
- `src/pages/digital-presence/CROOffice.tsx` -- full demo dependency
- `src/pages/digital-presence/SiteBuilder.tsx` -- full demo dependency
- `src/pages/admin/fip/FIPBuilderConsole.tsx` -- demo builder steps
- All remaining `src/pages/**` files with `isDemoMode` (est. ~280 files)

### Supporting cleanup:
- `src/data/seed/*.ts` -- keep files but stop importing from pages
- `src/lib/demo-scenarios/` -- preserve for sandbox/demo mode toggle only
- `src/contexts/DataModeContext.tsx` -- keep as bridge, but pages should not branch on it

---

## Batch 2: Test Suite Stabilization

### Action: Fix all Vitest failures
- Run full suite, fix broken imports/mocks in batches
- Fix `BusinessCenter.test.tsx` nested Router issue
- Update `src/test/demo-scenarios.test.ts` to match post-migration state
- Remove `demo-mode-resolution.integration.test.ts` or update for sandbox-only mode
- Update `tests/integration/demo-mode-runtime-enforcement.test.ts`

### Action: Fix Playwright E2E suite
- Update `tests/e2e/demo-mode.spec.ts` and `desktop-widgets-live-vs-demo.spec.ts`
- Verify all route-health and auth-journey specs pass

---

## Batch 3: Duplicate Component Consolidation

### EmptyState family (already partially consolidated):
- `EmptyState` (canonical) -- keep
- `EmptyStateCard` (re-export wrapper) -- keep for backward compat
- `ContextualEmptyState` (re-export wrapper) -- keep for backward compat
- `PremiumEmptyState` -- evaluate if this should merge with `EmptyState`
- `ModuleEmptyState` -- domain-specific, keep

### Action: Audit and deduplicate across:
- Trust/explanation components in `src/components/explainability/` vs `src/lib/ux-trust/`
- Shell/chrome components for overlapping layout patterns
- Admin tool components for repeated patterns

---

## Batch 4: Root Config and Build Hardening

### TypeScript strictness:
- `tsconfig.json` has `strictNullChecks: false` and `noImplicitAny: false` -- these are weak for a production OS
- Action: Enable `strictNullChecks` in `tsconfig.app.json` incrementally (add `// @ts-expect-error` where needed to avoid blocking)

### Build config:
- `vite.config.ts` is solid with chunk splitting, health.json, Sentry -- no changes needed
- `Dockerfile` is clean multi-stage -- no changes needed
- `vitest.config.ts` coverage thresholds (40/30/35/40) are low -- raise after test fixes

### Package hygiene:
- Both `bun.lock` and `package-lock.json` exist -- consolidate to one lockfile
- Add `.npmrc` or document canonical package manager

---

## Batch 5: Edge Function Governance

~200 edge functions exist. Many share patterns but are individually maintained.

### Action:
- Verify `supabase/functions/_shared/test-harness.ts` is consumed by all test files
- Ensure all edge functions have CORS headers (import from `@supabase/supabase-js/cors`)
- Verify `_owners.json` covers all functions
- Run edge function tests via `supabase--test_edge_functions` tool

---

## Batch 6: Generated Artifacts Cleanup

850+ files in `generated/` directory. Many are audit/report JSON files that appear to be historical.

### Action:
- Add `generated/` to `.gitignore` if not already (it's in `.dockerignore`)
- Or create `generated/.gitkeep` and exclude individual reports
- Ensure `scripts/generate-all.ts` produces only needed artifacts
- Remove stale/duplicate reports

---

## Batch 7: Service and Architecture Wiring

### Verify canonical facades are consumed:
- `src/services/index.ts` exports 4 layers -- verify pages import through this
- `src/contexts/RuntimeProvider.tsx` composes 5 providers -- verify boot order works

### Missing operational layers to add:
- `src/lib/env-validation.ts` -- validate required VITE_ vars at boot
- Strengthen `src/components/sita/GlobalErrorBoundary.tsx` with recovery options

---

## Batch 8: Supportability and Recovery

### Action:
- Verify `supabase/functions/generate-support-bundle/` produces real output
- Verify `supabase/functions/support-recovery-api/` has working endpoints
- Add admin UI surface for support bundle download if missing
- Verify runbook drill scripts in `scripts/support/drills/` are executable

---

## Implementation Order

1. **Batch 1** (Demo migration) -- largest UX impact, ~280 files
2. **Batch 2** (Test stabilization) -- validates Batch 1
3. **Batch 4** (Root config) -- quick wins, low risk
4. **Batch 6** (Generated cleanup) -- reduces repo noise
5. **Batch 3** (Component dedup) -- medium effort
6. **Batch 5** (Edge functions) -- verify existing work
7. **Batch 7** (Service wiring) -- architecture integrity
8. **Batch 8** (Supportability) -- operational readiness

---

## What Will NOT Be Done (Honest Blockers)

- **Full `strictNullChecks` enablement**: Would require touching 1000+ files; will be incremental
- **Mobile native closure**: Intentionally deferred per `mem://architecture/os-core-and-runtime`
- **Desktop code signing**: Requires external Apple/Microsoft credentials
- **OS ISO build verification**: Requires QEMU/hardware environment
- **Full 285-page demo removal in one pass**: Will be done in priority batches across multiple sessions

---

## Estimated Scope Per Session

Each implementation session can realistically handle:
- ~20-30 page demo migrations (with proper empty states)
- ~10 test fixes
- 1-2 config/infra hardening tasks
- 1 edge function verification batch

Total estimated sessions for full closure: 12-15

