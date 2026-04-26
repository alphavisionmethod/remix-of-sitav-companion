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

### **Phase 3 — Investment Domain Barrel Fix + Type Migration**
- Existing `src/domains/investment/types.ts` is real but **not exported** by the barrel — fix immediately:
  - Move `types.ts` → `src/domains/investment/types/index.ts` (split into `instruments.ts`, `portfolio.ts`, `advisors.ts`, `theses.ts`, `execution.ts` for maintainability).
  - Wire barrel: `export * from "./types"; export * from "./contracts";`
- Demo/mock data stays at `src/domains/investment/mock-data.ts` BUT must be moved out of the domain layer (domain ≠ fixtures). Relocate to `src/data/fixtures/investment/` and update consumers.
- Add `src/domains/investment/contracts/` for AdvisorRecommendation envelope & TradeApprovalRequest cross-layer contracts.
- Update all 10+ consumers from `@/domains/investment/types` → `@/domains/investment`.
- **Gate**: `tsc --noEmit` clean; smoke-import test for barrel; mock-data leak removed from domain.

### **Phase 4 — Engine Purity Re-Audit + Service Boundary Cleanup**
- Run `scripts/architecture/check-engine-purity.ts` against current state; fix any new violations.
- Audit `src/domains/engines/business-*.ts`, `concierge` adjacent engines, and finance/investment engines for:
  - inline domain types → relocate to `@/domains/<m>` and re-import.
  - hidden mock-data → move to `src/data/fixtures/`.
  - service imports → invert: services import from engines, not vice versa.
- Audit service `index.ts` barrels: ensure no domain-type re-exports leak (services should re-export *behavior*, types come from `@/domains/<m>`).
- **Gate**: engine-purity script returns 0; service barrels reviewed; `tsc --noEmit` clean.

### **Phase 5 — Investment Routing Consolidation (`/investment` is canonical)**
- Decision: `/investment/*` (singular) is canonical. Rationale: matches `route-family-registry.ts` id `"investment"`, matches feature registry, matches `InvestmentShellPage` page name, shorter URL.
- Actions:
  1. Build a one-time redirect map: every `/investments/*` → `/investment/*` via `src/routes/redirects/user-redirect-map.ts` (already exists; extend it, don't duplicate).
  2. Remove the duplicate `/investments/*` block from `src/routes/families/experimental-routes.tsx` (lines 157-186).
  3. Convert `src/routes/families/investment-office-routes.tsx` from emitting `/investments/*` routes to emitting **only the routes that don't already exist on `/investment/*`** (e.g., the extended pages: BeginnerMode, AdvancedMode, CapitalTwin, DecisionTheater, etc.) on `/investment/*` paths. This merges the two route families into a single `/investment/*` namespace.
  4. Update `route-family-registry.ts`: collapse `investment` + `investment-office` entries into one canonical family `investment` pointing to the merged file. Mark legacy file as removed.
  5. Update `src/features/investment-office/index.ts`, `src/runtimes/reality/reality-audit-registry.ts`, `src/data/fixtures/mock-data/index.ts`, mobile-routes, and feature-registry to reference `/investment/*` only.
- **Gate**: no `path="/investments` in route families; redirects cover all old paths; route-integrity test extended.

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
