# SITA OS — Serious Verification Hardening Plan

## What already exists (must reuse, not duplicate)

The repo already has a strong, matrix-driven verification system for **Business OS** that we will mirror — not parallel — into Concierge and Finance.

- **Test infrastructure**: vitest + jsdom (`src/test/setup.ts`), Playwright (`tests/e2e/`), `npm run verify` aggregator, `test:deployment-readiness` script, `test:seq` self-healing runner, `test-self-heal` pipeline.
- **Business OS matrix** (`src/__tests__/business-os/_matrix/business-os-verification-matrix.ts` + `matrix.test.ts`) — single source of truth, CI-enforced.
- **Reusable helpers**: `src/__tests__/business-os/_helpers/` (render, fixtures, fixtures-extra), `tests/e2e/helpers/` (auth, business-flow, navigation, evidence, proof-classifier, selectors), `tests/e2e/fixtures/test-users.ts`.
- **Production-truth manifests**: `PRODUCTION_TRUTH_MANIFEST.ts` per module (Business, Concierge, Finance, Health) — already drives page-state grammar tests.
- **Trust layer tests**: `src/__tests__/trust/` (receipts, approvals, proof-mapper, proof-trail hooks for crm + concierge).
- **E2E**: 7 Business OS specs (revenue, advisor-action-approval, crm-import-dedupe, autopilot, lead-recovery, appointments, business-proof-trail). Concierge/Money/Investment journeys are **auth-redirect smoke tests only**.

## The gap (where deployment risk actually lives)

| Domain    | Pages | Services | Components | Route-Integrity | Integration | Trust | E2E (real flows) |
|-----------|-------|----------|------------|-----------------|-------------|-------|------------------|
| Business  | 13✅  | 15✅     | 2✅        | 2✅              | 11✅        | 4✅   | 7✅              |
| Concierge | grammar only | **0** | **0**   | **0**            | **0**       | partial | redirect smoke only |
| Finance   | grammar only | **0** | **0**   | **0**            | **0**       | **0** | redirect smoke only |

Business OS is proven. Concierge and Finance are surface-validated only — the explicit current gap.

## Phased delivery (no phase advances until 100% green)

Each phase ends with: `npm run typecheck` clean, all new tests passing locally, matrix file updated, no duplication of existing helpers/fixtures, and a corresponding section appended to `generated/audits/SITA_OS_SERIOUS_VERIFICATION_REPORT.md`.

### Phase 1 — Verification Matrices for Concierge & Finance
- Create `src/__tests__/concierge/_matrix/concierge-verification-matrix.ts` + `matrix.test.ts` (mirror of Business OS matrix shape).
- Create `src/__tests__/finance/_matrix/finance-verification-matrix.ts` + `matrix.test.ts`.
- Each matrix enumerates: pages (vs `PRODUCTION_TRUTH_MANIFEST`), services/hooks, routes, integration seams, trust flows, E2E journeys — initially status `missing` for items this plan will fill, `behavioral` for what already exists.
- Add CI gate scripts: `scripts/architecture/check-concierge-coverage.ts` and `check-finance-coverage.ts` (fail if matrix misses any page or new service file).
- **Done when**: Both matrix tests run green, both check scripts run green and exit 0.

### Phase 2 — Shared Render Helpers (no parallel infra)
- Create `src/__tests__/concierge/_helpers/render-concierge-page.tsx` + `concierge-fixtures.ts` (reuse the patterns from `business-os/_helpers/`, do not invent new query-client wrappers).
- Create `src/__tests__/finance/_helpers/render-finance-page.tsx` + `finance-fixtures.ts`.
- Reuse `tests/e2e/helpers/auth.ts`, `navigation.ts`, `selectors.ts` for any new e2e specs — no new helper modules unless a clear gap exists.
- **Done when**: Helpers compile, are imported by a smoke test that renders one page from each domain successfully.

### Phase 3 — Concierge Service & Hook Tests
- Audit `src/modules/concierge/hooks/` (`use-concierge-data`, `use-household`, `use-concierge-proof-trail`) and `src/lib/services/concierge-os/` and `boardroom-service/packets/family-packet.service.ts` for deterministic logic worth testing (filtering, normalization, scheduling math, recurrence, household membership rollup, trip overview aggregation).
- Add behavioral tests under `src/__tests__/concierge/services/` for each non-trivial helper (skip thin Supabase CRUD and document exclusions in matrix, mirroring `SERVICE_TEST_EXCLUSIONS`).
- **Done when**: All P0/P1 concierge services have behavioral tests; matrix updated; check script passes.

### Phase 4 — Finance Service & Engine Tests
- Audit `src/modules/finance/hooks/`, `src/lib/services/sovereign-calculation/` (already has tests), capital allocation logic, investment-office data shapers, holdings/allocation calculators, money approval routing helpers.
- Add behavioral tests under `src/__tests__/finance/services/` covering: allocation math, approval threshold logic, currency/precision handling, edge cases (zero holdings, negative balances), investment instrument formatters.
- **Done when**: All P0/P1 finance engines have deterministic tests; matrix updated.

### Phase 5 — Component & Page-State Tests
- Concierge: pick the 5–7 highest-traffic pages (`HouseholdCommandCenter`, `LifeAdminCenter`, `AppointmentsPrep`, `RecurringObligations`, `ServiceProviders`, `FamilyCalendar`, `TravelPlanning`). Test render + loading + empty + error + degraded states using the new render helper. Tests live in `src/__tests__/concierge/pages/`.
- Finance: cover `MoneyOverview`, `MoneyCenter`, `MoneyApprovals`, `CapitalAllocationPage`, `WealthCommandCenter`, plus 3 critical investment-office pages (`PortfolioOffice`, `ExecutionDesk`, `InvestmentBoardroom`). Tests in `src/__tests__/finance/pages/`.
- Add 2–3 high-value component tests per domain (e.g. concierge reservation card, finance allocation chart wrapper, money approval row) — only where component has real branching logic.
- **Done when**: Each chosen page asserts at least 4 of {render, loading, empty, error, degraded, unauth}; matrix shows them as `behavioral`.

### Phase 6 — Route-Integrity & Trust Tests
- Concierge route-integrity test: parse the route registry, assert every concierge route maps to a real component, and every page in `PRODUCTION_TRUTH_MANIFEST` is reachable from at least one route. File: `src/__tests__/concierge/routes/concierge-routes-integrity.test.ts`.
- Finance route-integrity test: same pattern, plus assert canonical `/investment/*` (singular) routes resolve and `/investments/*` legacy still redirects.
- Trust tests: extend `src/__tests__/trust/` with `request-approval-finance.test.ts` (money approval routing) and verify concierge proof-trail hook surfaces lineage. Reuse existing `emit-client-receipt`, `derive-entity-ref` helpers.
- **Done when**: Route-integrity tests pass against the live route registry; trust tests verify approval is required before execution for at least one finance and one concierge mutation.

### Phase 7 — Cross-Module Integration Tests
- `src/__tests__/concierge/integration/concierge-business-linkage.test.ts` — verify `concierge_recurring_obligations` exposes `crm_company_id`/`crm_contact_id` lineage and the resolver returns linked entities (live data via supabase client following the pattern of `crm-concierge-linkage-live.test.tsx`).
- `src/__tests__/finance/integration/finance-business-linkage.test.ts` — verify invoice → finance ledger lineage and CRM advisor → finance approval linkage.
- `src/__tests__/finance/integration/concierge-finance-linkage.test.ts` — recurring concierge obligations → finance recurring expenses surface.
- **Done when**: Each integration test queries the real schema (or asserts lineage columns present) and passes.

### Phase 8 — Adaptive / Persistence Verification
- `src/__tests__/concierge/adaptive/concierge-preference-persistence.test.ts` — verify household profile/preferences write through and re-render visibly.
- `src/__tests__/finance/adaptive/finance-preference-persistence.test.ts` — verify investor profile (beginner/advanced) toggle persists and gates UI.
- Mirror the existing `business-profile-persistence.test.tsx` pattern.
- **Done when**: Persistence is asserted via mocked storage round-trip + visible re-render.

### Phase 9 — End-to-End Journeys (Playwright)
- Concierge: replace the redirect-only `concierge-journey.spec.ts` with `tests/e2e/concierge/household-reservation-flow.spec.ts` (auth → household → recurring obligation → linkage to business surface). Reuse `helpers/auth.ts`, `helpers/business-flow.ts` patterns.
- Finance: replace `money-journey.spec.ts` and `investment-journey.spec.ts` redirect-only smokes with:
  - `tests/e2e/finance/money-approval-flow.spec.ts` (approval-required mutation: pending → approved → executed → receipt visible).
  - `tests/e2e/finance/investment-route-continuity.spec.ts` (deep-link `/investment/portfolio` preserves linkedContext through 3 surfaces).
- Add a new playwright project `concierge-os` and `finance-os` to `playwright.config.ts` with focused `testDir`s, mirroring the existing `business-os` project.
- Keep the original auth-redirect smoke tests as a separate `journey-smoke.spec.ts` so we don't lose breadth.
- **Done when**: New specs run green locally against `npm run dev`; CI workflow updated.

### Phase 10 — CI Wiring & Final Report
- Add to `package.json`:
  - `test:concierge` → `vitest run src/__tests__/concierge/`
  - `test:finance` → `vitest run src/__tests__/finance/`
  - `test:business-os` → `vitest run src/__tests__/business-os/` (if missing)
  - `check:domain-coverage` → runs the three matrix check scripts in sequence
  - Extend `test:deployment-readiness` to include the three matrices.
- Add `.github/workflows/domain-verification-matrix.yml` (or extend an existing readiness workflow) running the matrix checks + per-domain vitest.
- Extend `scripts/root/check-deployment-readiness.ts` with a new gate: "Domain verification matrices present and passing".
- Finalize `generated/audits/SITA_OS_SERIOUS_VERIFICATION_REPORT.md` with the per-area discipline format the user requested (area / prior risk / tests added / files / risk reduction / dedup notes / remaining gaps).
- **Done when**: `npm run verify` is green end-to-end; the readiness gate fails when a matrix entry is missing or status downgraded.

## Technical details (for engineers)

- **No parallel test infra.** Every new helper imports from existing shared utilities or extends them in place. New fixtures only when no equivalent exists in `_helpers/business-fixtures*` or `tests/e2e/fixtures/`.
- **Matrix shape** is identical across the three domains so a single CI walker can validate all of them.
- **`status: "missing"` is allowed in the matrix** but tracked — it's how we encode the difference between "honest gap" and "regression". CI fails on regressions (status downgrade) but warns on `missing` until a phase fills them.
- **Page tests** must use the production component, not a stub, and exercise at least 4 visible states. Snapshot-only tests are forbidden.
- **Integration tests** that touch real Supabase schema use the existing read-only client pattern from `crm-concierge-linkage-live.test.tsx`.
- **E2E specs** must use `tests/e2e/helpers/auth.ts` for sign-in — no inline auth flows.
- **Trust tests** must reuse `emit-client-receipt` and `request-approval` helpers from `src/lib/ux-trust/`.

## Out of scope (explicitly deferred)

- Visual regression expansion (already covered by `visual-regression-panels.spec.ts`).
- Accessibility expansion (covered by `accessibility.spec.ts`).
- Edge function contract tests beyond what `edge-function-contracts.spec.ts` already runs.
- New Health domain coverage (the user request lists Business / Concierge / Finance + shared platform integration).

## Deliverables checklist

```text
src/__tests__/concierge/_matrix/                  (NEW — matrix + test)
src/__tests__/concierge/_helpers/                 (NEW — render + fixtures)
src/__tests__/concierge/services/                 (NEW — service tests)
src/__tests__/concierge/pages/                    (NEW — page-state tests)
src/__tests__/concierge/routes/                   (NEW — route integrity)
src/__tests__/concierge/integration/              (NEW — cross-module)
src/__tests__/concierge/adaptive/                 (NEW — persistence)
src/__tests__/finance/_matrix/                    (NEW)
src/__tests__/finance/_helpers/                   (NEW)
src/__tests__/finance/services/                   (NEW)
src/__tests__/finance/pages/                      (NEW)
src/__tests__/finance/routes/                     (NEW)
src/__tests__/finance/integration/                (NEW)
src/__tests__/finance/adaptive/                   (NEW)
src/__tests__/trust/request-approval-finance.test.ts          (NEW)
tests/e2e/concierge/household-reservation-flow.spec.ts        (NEW)
tests/e2e/finance/money-approval-flow.spec.ts                 (NEW)
tests/e2e/finance/investment-route-continuity.spec.ts         (NEW)
scripts/architecture/check-concierge-coverage.ts              (NEW)
scripts/architecture/check-finance-coverage.ts                (NEW)
playwright.config.ts                              (extend with two new projects)
package.json                                      (add test:concierge, test:finance, check:domain-coverage)
.github/workflows/domain-verification-matrix.yml  (NEW)
scripts/root/check-deployment-readiness.ts        (extend with matrix gate)
generated/audits/SITA_OS_SERIOUS_VERIFICATION_REPORT.md       (NEW)
```

Approve to proceed with **Phase 1**.
