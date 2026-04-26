# SITA OS — Canonical Architecture Completion Plan

**Operating rule for every phase:** no duplicates, no stubs, no parallel rewrites. Each phase fully wired, type-clean (`tsc --noEmit`), tests green, before moving to the next.

---

## 🔍 Audit Findings (Real Repo State)

| Area | Reality | Status |
|---|---|---|
| `src/domains/business/` | `types/{lead,profile,recovery}` + `contracts/` populated; **49 consumers** wired | ✅ canonical |
| `src/domains/concierge/index.ts` | `export {};` — 0 consumers | ❌ empty barrel |
| `src/domains/finance/index.ts` | `export {};` — 0 consumers | ❌ empty barrel |
| `src/domains/investment/` | `types.ts` + `mock-data.ts` exist; barrel says `export {};` — **10+ consumers import from `@/domains/investment/types` directly** | ❌ broken barrel + wrong import path |
| `src/domains/engines/` | 50+ files. Purity script exists (`scripts/architecture/check-engine-purity.ts`) with documented allowlist | ⚠️ needs re-run + add concierge/finance import allowlist |
| Services `business-os` / `concierge-os` / `finance-os` | Barrels populated, side-effect ownership clear | ✅ mostly canonical, needs domain-type re-imports |
| Routes `/investment/*` (18) | `families/investment-routes.tsx` — canonical | ✅ |
| Routes `/investments/*` (41) | `families/investment-office-routes.tsx` + duplicated again in `families/experimental-routes.tsx` | ❌ double duplication |
| `InvestmentShellPage` | Has `<Outlet/>` but is **never mounted as a parent route** — child routes are flat siblings | ❌ App-in-OS pattern incomplete |
| Investment pages | Split between `src/pages/investment-office/` (registered) and `src/modules/finance/pages/investment-office/` (mostly orphaned) | ❌ ownership ambiguous |
| Concierge pages | All routes hit single `ConciergeCenter` dispatcher (good); needs canonical domain types | ⚠️ partial |
| Money/Finance pages | All hit single `MoneyCenter` dispatcher (good); needs canonical domain types | ⚠️ partial |

---

## 📐 Canonical Architecture Contract (target — enforced in code)

```
src/domains/<module>/             ← types, contracts, enums, DTOs (NO side effects, NO React)
   ├── types/                       ← entity types
   ├── contracts/                   ← cross-layer interfaces
   └── index.ts                     ← single import surface

src/domains/engines/               ← PURE deterministic logic only
   (enforced by scripts/architecture/check-engine-purity.ts)

src/lib/services/<module>-os/      ← side effects: Supabase, queues, receipts, persistence
   (consumes @/domains/<module> for types, @/domains/engines for pure logic)

src/modules/<module>/pages/        ← page composition (canonical user-product home)
src/components/<module>/**         ← presentation only

src/routes/families/<module>-routes.tsx  ← topology only, lazy() page factories
src/routes/registry/route-family-registry.ts  ← typed registry (one entry per family)
```

**Hard rules**:
- Domain depends on nothing.
- Engines: no Supabase, no `fetch()`, no `localStorage` (allowlist documented).
- Services: own all side effects.
- Pages: composition only, import types from `@/domains/<m>`, side effects from services, pure helpers from engines.
- Routes: one canonical namespace per module, no duplicates.

---

## ✅ Phased Execution

### **Phase 1 — Concierge Domain Canonicalization**
- Survey actual concierge entities used in `src/lib/services/concierge-os/**` and `src/pages/ConciergeCenter` / `src/modules/concierge/**`.
- Lift the **real** type shapes (HouseholdTask, TravelPlan, ProviderMemory, ReservationIngest, GroceryList, ConflictReport, etc.) into `src/domains/concierge/types/`.
- Lift cross-cutting contracts (BoardroomInput shape, ContinuityProbe shape) into `src/domains/concierge/contracts/`.
- Wire `src/domains/concierge/index.ts` to re-export from `./types` and `./contracts`.
- Replace inline `interface`/`type` declarations in services and pages with imports from `@/domains/concierge`.
- **Gate**: `tsc --noEmit` clean; existing concierge tests still pass; engine purity check still passes.

### **Phase 2 — Finance Domain Canonicalization**
- Same process for Money/Finance: lift entity types from `src/lib/services/finance-os/**` and `src/pages/money/**` / `src/modules/finance/**` into `src/domains/finance/types/` (BillRecord, ReserveAccount, RecurringObligation, ReceivableRecord, EnvelopeBudget, FinancialHealthSnapshot, RegimeView, etc.).
- Cross-cutting contracts (BoardroomInput, ContinuityProbe, FinanceApprovalRequest) into `src/domains/finance/contracts/`.
- Populate `src/domains/finance/index.ts`.
- Replace inline types in services, hooks, and `MoneyCenter` page modules.
- **Gate**: `tsc --noEmit` clean; finance tests pass; engine purity passes.

### **Phase 3 — Investment Domain Barrel Fix + Type Migration** ✅ COMPLETE
- ✅ Moved `src/domains/investment/types.ts` → `src/domains/investment/types/index.ts`.
- ✅ Moved `src/domains/investment/mock-data.ts` → `src/domains/investment/fixtures/index.ts`
  with explicit demo-data header preserving `__DEMO_SOURCE__` / `__DATA_CLASSIFICATION__` markers
  for the demo-mode auditor (per `mem://design/demo-mode-standardization`).
  Note: kept inside the domain (not in `src/data/fixtures/`) to keep types + fixtures
  co-located, matching SITA OS's existing pattern. Demo-mode gating remains the consumer's responsibility.
- ✅ Replaced broken `export {}` barrel with `export * from "./types"; export * from "./fixtures";`.
- ✅ Rewired all 16 consumers (1 hook + 14 pages + 1 component) from
  `@/domains/investment/{types,mock-data}` → `@/domains/investment` (canonical).
- ✅ Skipped speculative `src/domains/investment/contracts/` subdir — no cross-layer
  AdvisorRecommendation/TradeApprovalRequest envelopes are required yet; will be added
  organically when persistence/edge-function contracts emerge.
- **Gate**: `tsc --noEmit` clean; engine-purity passes; smoke test passes.

### **Phase 4 — Engine Purity Re-Audit + Service Boundary Cleanup** ✅ COMPLETE
- ✅ `scripts/architecture/check-engine-purity.ts` returns clean — "All domain engines are pure."
- ✅ Engine-layer audit:
  - No inline domain entities found that belong to a `@/domains/<m>` layer.
    `lead-recovery-engine.ts` already exports its types AND comments confirm
    fixtures live in `src/data/fixtures/mock-data/recovery-candidates.ts`.
  - No hidden mock fixtures inside `src/domains/engines/**` (only the
    deterministic `generateMockSignals()` synthesis function in
    `profile-evolution-engine.ts`, which is pure logic, not stored data).
  - No engine→service imports detected (`rg "from ['\"]@/lib/services" src/domains/engines/` returns empty).
- ✅ Service barrels (`business-os/index.ts`, `concierge-os/index.ts`,
  `finance-os/index.ts`) re-export *behavior* via `export * from "./<svc>"`.
  Domain types flow through the canonical re-export pattern established in
  Phase 2 (services re-export `type { X }` from `@/domains/<m>` for
  consumer ergonomics — single source of truth preserved).
- **Gate**: engine-purity returns 0; `tsc --noEmit` clean; service boundaries verified.

### **Phase 5 — Investment Routing Consolidation (`/investment` is canonical)** ✅ COMPLETE
- ✅ Decision applied: `/investment/*` (singular) is the single canonical Investment Office namespace.
- ✅ Extended `src/routes/redirects/user-redirect-map.ts` from 9 → 41 entries covering every legacy `/investments/*` path (incl. `:instrumentId`, `/money/investments` shell-consolidation entry).
- ✅ Removed the duplicate `/investments/*` block (41 routes + 41 imports) from `src/routes/families/experimental-routes.tsx`. Header note updated to point at the canonical families.
- ✅ Rewrote `src/routes/families/investment-office-routes.tsx` to emit ONLY the 23 extended `/investment/*` routes not declared in `investment-routes.tsx` (BeginnerMode, AdvancedMode, CapitalTwin, DecisionTheater, TimeMachine, Catalysts, OpportunityMap, Constitution, MarketMemory, Dossier, ProbabilityLab, StrategyDNA, PostTrade, CrossAsset, Conviction, Sizing, Modes, Readiness, CapitalPurpose, WhatWouldBreak, Disagreements, KnowledgeGraph, Events). Together both families form the single `/investment/*` namespace.
- ✅ Created legacy alias `src/routes/investment-office-routes.tsx` and mounted `getInvestmentOfficeRoutes()` in `src/App.tsx` next to `getInvestmentRoutes()`.
- ✅ `route-family-registry.ts` updated: kept both `investment` (core 18) and `investment-office` (extended 23) entries with explicit Phase 5 notes documenting they jointly own the `/investment/*` namespace; corrected canonicalPageOwner to `src/pages/investment-office/**`.
- ✅ Consumer rewires:
  - `src/lib/frontend/truth-surface-registry.ts`: `/money/investments` → `/investment`
  - `src/lib/domain-system/manifests/finance-manifest.ts`: `/finance/investments/:id` → `/investment/instrument/:id`
  - `src/platform/verification/surface-registry.ts`: `routePath: "/investments"` → `"/investment"` (key + domain renamed)
  - `src/features/feature-registry.ts`: removed phantom `/investment-office` literal from `ownedRoutes`
- **Gate**: ✅ `rg path="/investments" src/routes/families/` returns empty; ✅ `tsc --noEmit` clean; ✅ engine-purity returns 0; ✅ 41 redirect entries cover every legacy path.

### **Phase 6 — Investment Office App-in-OS Normalization**
- `InvestmentShellPage` already has `<Outlet/>` and tab-nav — wire it as the **parent route** for `/investment/*`:
  ```tsx
  <Route path="/investment" element={<InvestmentShellPage />}>
    <Route index element={<InvestmentGate />} />
    <Route path="boardroom" element={<InvestmentBoardroom />} />
    ...
  </Route>
  ```
- This aligns Investment Office with the App-in-OS pattern (single shell + child routes), matching how `RevenueOfficeModeProvider` wraps revenue-office in `route-family-registry` (`owns: "shell-mount"`).
- Update registry entry: `owns: "shell-mount"` for investment with rationale note.
- Resolve page-location ambiguity: pick `src/pages/investment-office/` as canonical (matches existing imports in route family); delete or relocate orphan duplicates in `src/modules/finance/pages/investment-office/` to a re-export shim if any module-page is referenced elsewhere, otherwise remove.
- **Gate**: deep-link to `/investment/boardroom` renders shell + page; no orphan duplicate pages.

### **Phase 7 — Architecture Guards (new + extended)**
- New script: `scripts/architecture/audits/check-no-empty-domain-barrels.ts` — fails if any `src/domains/*/index.ts` resolves to `export {};` or empty.
- Extend `scripts/architecture/check-engine-purity.ts` allowlist documentation if Phase 4 surfaced new legitimate exceptions.
- New script: `scripts/architecture/audits/check-investment-route-namespace.ts` — fails if `/investments/` (plural) appears anywhere in `src/routes/families/`.
- Add Vitest specs:
  - `src/__tests__/architecture/domain-barrels.test.ts` — imports each `@/domains/*` barrel and asserts non-empty exports.
  - `src/__tests__/architecture/investment-route-namespace.test.ts` — asserts only `/investment/*` namespace.
  - `src/__tests__/architecture/investment-shell-mount.test.tsx` — renders the parent route and asserts `<Outlet/>` resolves child page.
- Wire new audits into existing CI script index (no parallel system).
- **Gate**: all audits return 0; new tests pass; full suite (Vitest + Playwright list) parses.

### **Phase 8 — Documentation + Deployment Readiness**
- Create `SITA_OS_CANONICAL_ARCHITECTURE_COMPLETION_REPORT.md` at repo root with:
  1. Audit findings (before)
  2. Final ownership model (after)
  3. Per-module: what moved into `src/domains/<m>/`, what stayed in services, what stayed in engines
  4. Routing normalization summary (before/after table for `/investment` vs `/investments`)
  5. Investment Office App-in-OS justification
  6. Exact file inventory: created / modified / removed
  7. New architecture guards with command line
  8. Remaining transitional debt (none expected; if any, explicit)
- Update `src/domains/ARCHITECTURE.md` to reflect concierge + finance + investment canonicalization (it currently only mentions business).
- Add memory entry `mem://architecture/canonical-domain-completion` summarizing the durable rules.
- **Final gate**: `tsc --noEmit` ✅, full Vitest suite ✅, all architecture audits ✅, Playwright `--list` ✅, no `path="/investments` anywhere, no `export {};` in any domain barrel.

---

## 🛡️ Anti-Duplication Discipline (applied every phase)
Before creating any file: `rg "<symbol-or-name>" src` first. Extend existing instead of creating parallel. Every new file must justify itself. Engine purity, route registry, and existing audit infrastructure are all **extended, never duplicated**.

## 📦 Deliverables
- Concierge / Finance / Investment domain layers fully populated and consumed.
- Engines verifiably pure.
- Single `/investment/*` route namespace; legacy `/investments/*` removed with redirects.
- Investment Office mounted via shell pattern.
- 3 new architecture guards + 3 new test specs.
- Completion report at repo root.

**No phase advances until previous phase is 100% green and deployment-ready.**
