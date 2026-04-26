---
name: canonical-domain-completion
description: Canonical domain layer + investment routing rules. 4 canonical domain barrels (business, concierge, finance, investment) must stay populated. /investment singular is the sole Investment Office namespace. InvestmentShellPage parent-route wraps both investment route families.
type: feature
---

## Canonical Domains
The four canonical domain barrels are: `@/domains/business`, `@/domains/concierge`, `@/domains/finance`, `@/domains/investment`. Each MUST expose real exports (≥1 export-bearing statement, AST-counted). Regression to `export {};` is hard-failed by `scripts/architecture/audits/check-no-empty-domain-barrels.ts`.

To promote another domain (e.g. advisors, mission-control) to canonical: populate the barrel, then add its name to `CANONICAL_DOMAINS` in that script.

## Domain Layer Rules
- Domain depends on nothing (no UI, no Supabase, no engines).
- Engines may import types from any `@/domains/<m>` barrel only — NOT services / persistence / supabase. Allowlist documented in `src/domains/ARCHITECTURE.md` (`setup-orchestration-engine.ts` localStorage; `action-state-machine.ts` action-lineage-persistence).
- Services own all side effects under `src/lib/services/<module>-os/`.
- Pages compose: types from `@/domains/<m>`, side effects from services, pure helpers from engines.

## Investment Routing Invariants
- `/investment/*` (singular) is the SOLE canonical Investment Office namespace. 41 routes total: 18 from `getInvestmentRoutes()` + 23 from `getInvestmentOfficeRoutes()`.
- Plural `/investments/*` lives ONLY in `src/routes/redirects/user-redirect-map.ts` (41 redirect entries). Any reappearance in `src/routes/families/*.tsx`, `src/App.tsx`, or `src/routes/registry/route-family-registry.ts` is hard-failed by `scripts/architecture/audits/check-investment-route-namespace.ts`.
- Both investment route families MUST nest under a single `<Route element={<InvestmentShellPage />}>` parent in `src/App.tsx`. `InvestmentShellPage` (`src/modules/finance/pages/investment-office/InvestmentShellPage.tsx`) provides the workspace chrome and renders `<Outlet />`. Guarded by `src/__tests__/architecture/investment-shell-mount.test.ts`.

## Investment Pages Ownership
Canonical implementations live in `src/modules/finance/pages/investment-office/**` (Wave 4 decision). The 42 files in `src/pages/investment-office/**` are 3-line re-export shims kept as a deliberate compatibility layer for `lazy(() => import(...))` call sites — not orphan duplicates.

## Architecture Guards (CI-enforced)
All five run in `.github/workflows/check-boundaries.yml`:
1. `scripts/architecture/check-engine-purity.ts`
2. `scripts/architecture/audits/check-no-empty-domain-barrels.ts`
3. `scripts/architecture/audits/check-investment-route-namespace.ts`
4. `npx vitest run src/__tests__/architecture/` (14 tests across 3 specs)
5. `npx tsc --noEmit`

Completion report: `SITA_OS_CANONICAL_ARCHITECTURE_COMPLETION_REPORT.md` at repo root.
