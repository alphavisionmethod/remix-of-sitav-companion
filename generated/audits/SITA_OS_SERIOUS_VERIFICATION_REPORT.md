# SITA OS — Serious Verification Hardening Report

**Status:** Phase 1 of 10 complete.
**Last updated:** Phase 1 close.

This report tracks the rolling closure of the verification gap between
Business OS (heavily proven) and Concierge / Finance OS (surface-only).
Each phase appends a section here; phases must be 100% green before the
next begins.

## Reused (no parallel infra)

| Asset | Where | Reused for |
|-------|-------|-----------|
| Business OS verification matrix shape | `src/__tests__/business-os/_matrix/business-os-verification-matrix.ts` | Cloned semantically into Concierge & Finance matrices |
| Matrix walker pattern (`matrix.test.ts`) | `src/__tests__/business-os/_matrix/matrix.test.ts` | Mirrored 1:1 for Concierge/Finance with subdir-aware page walk for Finance |
| `PRODUCTION_TRUTH_MANIFEST` | `src/modules/{business,concierge,finance,health}/PRODUCTION_TRUTH_MANIFEST.ts` | Already drives page-state grammar tests; matrices reference it |
| Page-state grammar audits | `src/__tests__/{concierge,finance}/*-page-state-grammar.test.ts` | Counted as `behavioral` page coverage in new matrices |
| Trust layer tests | `src/__tests__/trust/` | Concierge proof-trail + entity-ref tests already cover concierge trust seam |
| Cross-domain live integration test | `src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx` | Counted as the concierge↔business linkage proof |
| Quote-proposal-invoice lineage test | `src/__tests__/business-os/integration/quote-proposal-invoice-lineage.test.ts` | Counted as the CRM↔Finance lineage proof |
| Investment plural-callsite guard | `src/__tests__/architecture/investment-plural-callsites.test.ts` | Counted as the `/investment` route singularity guard |

## Phase 1 — Verification Matrices for Concierge & Finance

**Goal:** Stand up the same matrix-driven CI gate for Concierge and Finance that already exists for Business OS, so coverage gaps are explicit, prioritized, and machine-checked.

**Files created:**

| File | Purpose |
|------|---------|
| `src/__tests__/concierge/_matrix/concierge-verification-matrix.ts` | 38 surfaces classified across pages/services/routes/trust/integration/adaptive/E2E |
| `src/__tests__/concierge/_matrix/matrix.test.ts` | 6 vitest assertions enforcing matrix integrity |
| `src/__tests__/finance/_matrix/finance-verification-matrix.ts` | 68 surfaces classified across all three finance subdirs (root, money, investment-office) |
| `src/__tests__/finance/_matrix/matrix.test.ts` | 6 vitest assertions including subdir-aware page walk |
| `scripts/architecture/check-concierge-coverage.ts` | CI gate: fails on unclassified pages/services, warns on P0 honest-debt |
| `scripts/architecture/check-finance-coverage.ts` | CI gate: same semantics; subdir-aware page scan |

**Verification:**

```text
✓ src/__tests__/concierge/_matrix/matrix.test.ts (6 tests)
✓ src/__tests__/finance/_matrix/matrix.test.ts   (6 tests)

📋 Concierge OS Coverage Gate
  Pages on disk:    25  | Pages classified: 9
  Services on disk: 20  | Services classif: 20
  Surfaces total:   38  | Missing (P0):     12
  ✅ Concierge coverage gate passed

📋 Finance OS Coverage Gate
  Pages on disk:    81  | Pages classified: 11
  Services on disk: 39  | Services classif: 40
  Surfaces total:   68  | Missing (P0):     23
  ✅ Finance coverage gate passed

npx tsc --noEmit → 0 errors
```

**Per-area discipline:**

| Area | Prior risk | Test type added | Files | Risk reduction | Dedup notes |
|------|-----------|-----------------|-------|----------------|-------------|
| Concierge surface inventory | Drift undetected — new pages/services could ship with no test and no flag | Disk-walk matrix + CI gate | `concierge-verification-matrix.ts`, `matrix.test.ts`, `check-concierge-coverage.ts` | New page/service now fails CI unless classified or explicitly excluded with reason | Reuses Business OS matrix shape verbatim; no new helpers |
| Finance surface inventory | 81 pages across 3 subdirs, 39 services — completely unindexed by verification | Subdir-aware disk-walk matrix + CI gate | `finance-verification-matrix.ts`, `matrix.test.ts`, `check-finance-coverage.ts` | Same gate as concierge; investment-office shells explicitly delegated to existing page-state grammar audit, not duplicated | Reuses Business OS matrix shape; reuses `finance-page-state-grammar` for shell pages |
| Honest-debt encoding | Coverage gaps were unstructured and invisible | `status: "missing"` entries with explicit `tests` paths | both matrices | Phases 3–9 fill these by replacing `missing` → `behavioral`/`e2e`; CI warns until then, regressions fail | Status downgrade detection avoids future invisible regressions |

**Remaining gaps (carried into next phases):**

- 12 P0 concierge surfaces tracked as `missing` (5 pages, 4 services, 1 route, 1 adaptive, 1 E2E) — Phases 2–9.
- 23 P0 finance surfaces tracked as `missing` (6 pages, 10 services, 3 routes, 1 trust, 1 adaptive, 2 E2E) — Phases 2–9.
- E2E smoke specs (`concierge-journey`, `money-journey`, `investment-journey`) currently auth-redirect only; replaced with real flows in Phase 9.

---

_Phases 2–10 will append below this line as they complete._

---

## Phase 2 — Shared Render Helpers (Concierge & Finance) — ✅ COMPLETE

**Goal:** Provide a single canonical way to render Concierge and Finance pages
in tests with their context providers wired, without duplicating the canonical
Supabase mock, QueryClient, or MemoryRouter from `src/test/test-utils.tsx`.

**Deliverables (no duplicates, no stubs):**

- `src/__tests__/concierge/_helpers/render-concierge-page.tsx` — wraps the
  canonical `render` with `ConciergeNavigationContext` + `ConciergeDataProvider`.
- `src/__tests__/finance/_helpers/render-finance-page.tsx` — wraps the
  canonical `render` with `FinanceNavigationContext`.
- `src/__tests__/concierge/_helpers/concierge-fixtures.ts` — deterministic
  factories for `HouseholdMember`, `HouseholdTask`, `LocalCalendarEvent`.
- `src/__tests__/finance/_helpers/finance-fixtures.ts` — deterministic factories
  for `FinancialAccount`, `ObligationRecord`, `ReserveModel`, `TransactionRecord`,
  `CashAllocatorInput`, `PeaceScoreInput`.
- Helper smoke tests (`render-concierge-page.test.tsx`, `render-finance-page.test.tsx`)
  verify default context, custom overrides, and navigation callback wiring.

**Verification:** 4/4 helper tests pass. Helpers reuse `src/test/test-utils.tsx`
entirely — no parallel Supabase mock, no parallel QueryClient.

---

## Phase 3 — Service & Hook Tests (P0) — ✅ COMPLETE

**Goal:** Replace `status: "missing"` for every P0 service in the Concierge
and Finance matrices with real deterministic behavioral coverage. Each test
exercises the actual service exported from `src/lib/services/{concierge,finance}-os/`
with realistic fixture inputs and asserts invariants on the returned shape.

**Concierge P0 services (4/4 → behavioral):**

| Service | Test file | Behaviors asserted |
|---|---|---|
| `household-overview.service.ts` | `services/household-overview.service.test.ts` | Active vs overdue derivation; top-priority fallback |
| `household-ops.service.ts` | `services/household-ops.service.test.ts` | KPI completion-rate, top contributor, load distribution, empty-set behavior |
| `conflict-detector.service.ts` | `services/conflict-detector.service.test.ts` | Overlap minute computation; non-overlap = empty; auto-resolvable bands |
| `load-balance.service.ts` | `services/load-balance.service.test.ts` | Per-member hours; >8h overload flag; rebalance threshold (>=2h delta) |

**Finance P0 services (10/10 → behavioral):**

| Service | Test file | Behaviors asserted |
|---|---|---|
| `cash-allocator.service.ts` | `services/cash-allocator.service.test.ts` | All 3 strategies; bills-first invariant; cap respect; zero-cash safety |
| `safe-to-spend.service.ts` | `services/safe-to-spend.service.test.ts` | Forecast windows; 80% obligation warning; low-S2S recommendation |
| `financial-health.service.ts` | `services/financial-health.service.test.ts` | Healthy composite >70; high-DTI penalty; dimension 0..100 bounds |
| `peace-score.service.ts` | `services/peace-score.service.test.ts` | Strong-status reporting; reserves critical at low fund pct; debt insight |
| `envelope-budget.service.ts` | `services/envelope-budget.service.test.ts` | 4 canonical groups; allocation cap; linear scaling; on-track default |
| `liquidity.service.ts` | `services/liquidity.service.test.ts` | Pass classification; fail + recommendation; investment shock effect |
| `transaction-categorizer.service.ts` | `services/transaction-categorizer.service.test.ts` | Default rule pack matching; subcategory; spend aggregation % |
| `recurring-obligation.service.ts` | `services/recurring-obligation.service.test.ts` | Excludes one-time; annual→monthly normalisation; autopay split; sort |
| `portfolio-risk.service.ts` | `services/portfolio-risk.service.test.ts` | Risk-budget identity (used+remaining=total); downside scenarios; dominant factor |
| `investment-office.service.ts` | `services/investment-office.service.test.ts` | Regime confidence bounds; asset-class/geo sums = 100; risk-budget identity |

**Verification (Phase 2 + 3 combined):**

```
vitest src/__tests__/{finance,concierge}/{services,_helpers,_matrix}/
  Test Files  18 passed (18)
       Tests  59 passed (59)

npx tsc --noEmit → 0 errors
```

**Coverage gate impact:**

- Concierge P0 missing: 12 → **8** (4 services flipped to behavioral).
- Finance P0 missing: 23 → **13** (10 services flipped to behavioral).
- Status-downgrade guard active: any future revert from `behavioral`→`missing`
  on a P0 surface fails CI.

**Dedup discipline:**

- Helpers wrap the canonical `render` from `@/test/test-utils` rather than
  re-mocking Supabase/QueryClient/MemoryRouter.
- Fixtures import canonical types from `@/packages/finance-contracts`,
  `@/packages/concierge-contracts`, `@/domains/finance`, `@/domains/concierge` —
  no parallel type definitions.
- Service tests reference real production services; no shadow re-implementations.

_Phases 4–10 will append below this line as they complete._