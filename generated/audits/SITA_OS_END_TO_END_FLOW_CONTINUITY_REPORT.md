# SITA OS — End-to-End Flow Continuity Report

> **Status:** Phase 1 complete · Phases 2–10 in progress
> **Map:** `docs/architecture/END_TO_END_FLOW_CONTINUITY_MAP.md`
> **Baseline:** `generated/audits/end-to-end-flow-continuity-baseline.json`
> **Validator:** `scripts/architecture/check-continuity-handoffs.ts` (warn-only until Phase 10)

## Phase 1 — Continuity inventory + canonical map (COMPLETE)

### What shipped

- **Baseline emitter** `scripts/architecture/emit-continuity-baseline.ts`
  - Static scan of every `setLinkedContext`, `consumeLinkedContext`,
    `useAction("*.convert-*")`, `<CrossAppAction>`, and demo-fixture
    import in `src/`.
  - Emits `generated/audits/end-to-end-flow-continuity-baseline.json`.
- **Warn-only validator** `scripts/architecture/check-continuity-handoffs.ts`
  - Reports orphan handoffs, silent drops (target route family with
    no consume site), and unguarded demo-fixture imports.
  - Exit code 0 — Phase 10 will flip to enforcing.
- **Canonical continuity map** `docs/architecture/END_TO_END_FLOW_CONTINUITY_MAP.md`
  - Single source of truth for canonical primitives, entity lineage,
    module handoff matrix, adaptive personalization, trust/proof
    continuity, truth states, and anti-duplication rules.

### Baseline numbers (Phase 1 snapshot)

| Metric | Value |
|---|---|
| `setLinkedContext` call sites | 13 |
| `consumeLinkedContext` call sites | 6 |
| Convert-to-* action handlers | 4 |
| `<CrossAppAction>` JSX targets | 11 |
| Demo-fixture imports total | 42 |
| Demo-fixture imports unguarded | 21 |
| Orphan entity types | 1 (`opportunity`) |

### Real continuity gaps confirmed (to be closed in Phases 2–9)

1. **`opportunity` orphan handoff** — `QuotesWorkspace` sets
   `entityType:"opportunity"` and navigates to
   `/business/opportunities`, but `OpportunitiesCenter` does NOT
   call `consumeLinkedContext`. *(Phase 3)*
2. **`CRMConciergeLinkage` is fake** — uses
   `generateDemoAppointments/Obligations/Errands` instead of real
   `appointments` / `recurring_obligations` / `errands` queries
   joined by `crm_contact_id`. *(Phase 2)*
3. **`FollowThroughCenter` is 100% demo data** — backed by
   `FOLLOW_THROUGH_TAB_DATA` const fixture. *(Phase 5)*
4. **`ReceivablesObligations` ships a hardcoded `RECEIVABLES = [...]`
   const alongside `useInvoices()`** — duplicate truth. *(Phase 8)*
5. **`CustomerDetail` does not mount `CRMFinanceLinkage` or
   `CRMConciergeLinkage`** — cross-domain story invisible from the
   canonical entity surface. *(Phase 2)*
6. **`BackgroundTaskCenter` "Open source" CTA** — model carries
   `sourceTable`/`sourceId` but click-through routing not proven for
   every job kind. *(Phase 7)*
7. **Autopilot canonical roles** — `AutopilotHub`, `RevenueAutopilot`,
   `RevenueImpactDashboard`, `PlaybookBuilder` overlap. *(Phase 9)*
8. **`/investment` vs `/investments` route overlap** —
   `check-investment-route-namespace.ts` already exists; verify
   coverage and add redirect map entries. *(Phase 8)*
9. **Concierge `appointments` ↔ Business `appointments`** — no
   shared `appointment_kind` discriminator yet. *(Phase 6)*
10. **Support → health-signal loop not closed** — no insertion path
    from resolved tickets into `customer_health_signals`. *(Phase 5)*

### Files added

- `scripts/architecture/emit-continuity-baseline.ts`
- `scripts/architecture/check-continuity-handoffs.ts`
- `docs/architecture/END_TO_END_FLOW_CONTINUITY_MAP.md`
- `generated/audits/end-to-end-flow-continuity-baseline.json` (generated)
- `generated/audits/SITA_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md` (this file)

### Files changed

- *(none — Phase 1 is observational; behavioral fixes start in Phase 2)*

### Tests / validators

- Baseline emitter: runs clean against current `src/` (✅).
- Warn-only validator: 22 findings reported, 0 enforced — all 22
  map directly to Phases 2–9 above. No Phase 1 finding requires
  immediate fix.

### Canonical reuse — anti-duplication audit

| Concern | Existing canonical | Reused? |
|---|---|---|
| Cross-app handoff | `setLinkedContext` / `consumeLinkedContext` | ✅ Yes — no parallel context bus introduced |
| Static analysis output | `generated/audits/*` | ✅ Yes — same dir as wave reports |
| Validator pattern | `scripts/architecture/check-*.ts` | ✅ Yes — same shape as 30+ existing checks |
| Map doc location | `docs/architecture/*.md` | ✅ Yes — same dir as `BOUNDED_CONTEXT_MAP.md`, `GOLDEN_PATH_REGISTRY.md` |
| Report doc location | `generated/audits/*.md` | ✅ Yes — same dir as wave reports |

### Phase 1 exit criteria

- [x] Baseline JSON committed and runnable from CI
- [x] Validator runs clean (warn-only) against current code
- [x] Canonical map doc committed
- [x] No new orchestration/continuity helpers introduced
- [x] All findings classified into a downstream phase

## Phase 2 — pending
## Phase 3 — pending
## Phase 4 — pending
## Phase 5 — pending
## Phase 6 — pending
## Phase 7 — pending
## Phase 8 — pending
## Phase 9 — pending
## Phase 10 — pending