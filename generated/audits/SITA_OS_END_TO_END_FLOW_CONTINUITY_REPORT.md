# SITA OS — End-to-End Flow Continuity Report

> **Status:** Phases 1–4 complete · Phases 5–10 in progress
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

## Phase 2 — CRM ↔ Concierge linkage made REAL (COMPLETE)

### What shipped

- **Schema** — `concierge_recurring_obligations` and `errands` gained
  `crm_contact_id` + `crm_company_id` columns with partial indexes
  (migration `20260427042450_*`).
- **`CRMConciergeLinkage`** rewritten — `generateDemo*` mock data
  removed; live `useQuery` against `appointments`,
  `concierge_recurring_obligations`, and `errands` joined on
  `crm_contact_id`. Empty states are honest.
- **Cross-app handoff** — `setLinkedContext` + `navigate` to
  `/concierge/calendar`, `/concierge/recurring`, `/concierge/errands`
  with `entityType` lineage so the destination can auto-select.
- **`CustomerDetail`** now mounts both `CRMConciergeLinkage` (new
  Concierge tab) and `CRMFinanceLinkage` (Financials tab) so the
  cross-domain story is visible from the canonical entity surface.

### Files changed

- `src/modules/business/components/business/crm/CRMConciergeLinkage.tsx`
- `src/modules/business/pages/CustomerDetail.tsx`
- `src/integrations/supabase/types.ts` (auto-regenerated)

### Files added

- `supabase/migrations/20260427042450_*.sql`

### Anti-duplication

- Reused `setLinkedContext` / `consumeLinkedContext` — no parallel
  context bus.
- Reused `fromTable` from `@/lib/supabase-helpers` — no new query layer.
- Reused existing `CRMFinanceLinkage` mounting pattern.

## Phase 3 — Quote → Proposal → Invoice continuity (COMPLETE)

### What shipped

- **Conversion handlers (already shipped, verified)** —
  `business.quote.convert-to-proposal`,
  `business.quote.convert-to-invoice`,
  `business.proposal.convert-to-invoice` registered in
  `src/lib/kernel-handlers/business-handlers.ts`. All three propagate
  full lineage (`quote_id`, `proposal_id`, `opportunity_id`,
  `crm_contact_id`, `crm_company_id`, `customer_id`) and write
  back-link columns (`converted_proposal_id`, `converted_invoice_id`)
  so `v_revenue_lineage` projects the chain.
- **Conversion CTAs** — `QuotesWorkspace` shows "Convert to Proposal"
  on accepted quotes and "Convert to Invoice" on selection;
  `ProposalsContracts` shows "Convert to Invoice" on accepted/signed
  proposals. All three call `setLinkedContext` and navigate to the
  destination, where `consumeLinkedContext` auto-selects the new row.
- **Lineage badges** — Quotes show upstream `opportunity` link and
  downstream `proposal` / `invoice` links; Proposals show upstream
  `quote` link and downstream `invoice` link.
- **NEW — Invoice upstream lineage badges** —
  `InvoiceDetailPane` now renders "← From proposal: …" and
  "← From quote: …" buttons (using `source_proposal_title` /
  `source_quote_title` already loaded by `InvoicesCollections`'s
  query) that call `setLinkedContext` and navigate back to the
  upstream surface. This closes the bidirectional lineage loop —
  every node in the quote → proposal → invoice chain can now navigate
  to both its parent and its child.
- **PDF generation & download** — `useGenerateInvoicePdf` /
  `useDownloadInvoicePdf` wired in `InvoiceDetailPane`, calling the
  `business-pdf-generate` edge function. Download is gated on
  `invoice.metadata.pdf_path` existing.
- **E-sign** — `useRequestSignature` /
  `useResendSignatureLink` / `usePendingSignatures` wired into
  both `ProposalsContracts` and `InvoiceDetailPane` against the
  `business-esign-request` edge function. Pending signatures list
  with resend confirmation.
- **HTML preview & email send** — `useInvoiceRenderHtml` /
  `useInvoiceSend` / `useDispatchComm` for in-line HTML preview and
  recipient-aware email dispatch.

### Files changed

- `src/modules/business/components/business/InvoiceDetailPane.tsx` —
  added `useNavigate`, `setLinkedContext`, and the upstream lineage
  badge block.

### Files verified (no change needed — already complete)

- `src/lib/kernel-handlers/business-handlers.ts` — three converters.
- `src/modules/business/pages/QuotesWorkspace.tsx` — CTAs +
  consume + lineage badges.
- `src/modules/business/pages/ProposalsContracts.tsx` — CTA +
  consume + lineage badges + e-sign.
- `src/modules/business/pages/InvoicesCollections.tsx` — consume +
  joined query loading `source_quote_title` / `source_proposal_title`.
- `src/hooks/use-phase10-actions.ts` — PDF + e-sign hooks.
- `src/hooks/use-backend-actions.ts` — invoice render/send hooks.

### Anti-duplication

- Reused `useAction` for all three conversion mutations — no new
  orchestration service.
- Reused `setLinkedContext` / `consumeLinkedContext` for handoff.
- Reused `fromTable("invoices").select(... quotes(title), proposals(title))`
  join (already in `InvoicesCollections`) instead of adding a second
  query in the detail pane.
- Did NOT introduce a new lineage helper, lineage hook, or lineage
  table — `v_revenue_lineage` is the canonical projection.

### Baseline delta

| Metric | Phase 1 | Phase 3 |
|---|---|---|
| `setLinkedContext` call sites | 13 | **15** (+2 in InvoiceDetailPane) |
| `consumeLinkedContext` call sites | 6 | 6 |
| Convert-to-* action handlers | 4 | 4 |

### Phase 3 exit criteria

- [x] All three conversions execute end-to-end with lineage columns set
- [x] Upstream and downstream lineage badges visible on all three surfaces
- [x] PDF generation/download wired and gated on availability
- [x] E-sign request + resend + pending list wired on proposals AND invoices
- [x] No fake "coming soon" continuity affordances on the lineage path
- [x] No duplicate orchestration introduced

### Honest deferred (NOT Phase 3)

- `Templates`, `Clauses`, `Win/Loss Analysis` tabs in
  `ProposalsContracts` remain `PremiumEmptyState`s — explicitly
  labeled "coming soon". Not in Phase 3 scope.
- `opportunity` orphan handoff (Phase 3 carryover) — `OpportunitiesCenter`
  still does not call `consumeLinkedContext`. Tracked for Phase 4.

## Phase 4 — Lead intake → recovery → recovered-value loop (COMPLETE)

### What shipped

- **Schema** — migration `20260427085843_*` adds the lineage columns
  that previously made the loop impossible to query end-to-end:
  - `crm_contacts.source_lead_inbox_item_id` (back-link to inbox)
  - `lead_inbox_items.produced_contact_id` and `produced_lead_id`
    (forward materialisation pointers)
  - `recovery_jobs.lead_id`, `crm_contact_id`,
    `recovered_value_cents`, and `recovered_at` (outcome lineage)
- **Inbox materialisation** — `useLeadInbox.ts` now writes a real
  `crm_contacts` row AND a `leads` row when an inbox item is accepted
  in live mode (idempotent on the contact via
  `source_lead_inbox_item_id`), and stamps the inbox row with
  `produced_contact_id` / `produced_lead_id`. Demo mode is unaffected.
- **Forward continuity** —
  - `LeadDetailPanel.tsx`: new "Open in Recovery" `CrossAppAction`
    on stale / at-risk leads.
  - `LeadRecoveryPane.tsx`: confirming a recovery action calls
    `setLinkedContext({ entityType: "recovery_candidate" })` and
    navigates to `/recovered-value` so the outcome appears in
    lineage immediately. No fabricated recovered amount.
  - `LeadRecovery.tsx`: `useLinkedContext()` auto-selects an arriving
    `recovery_candidate` (or matches a `lead_inbox_item` by label)
    so the operator drops directly into the rescue briefing.
  - `RecoveredValuePage.tsx`: shows a success banner for the linked
    entity that arrives from the rescue surface.
- **Orphan handoff closed** — `OpportunitiesCenter.tsx` now calls
  `useLinkedContext()` and auto-selects an arriving
  `entityType: "opportunity"` payload. This closes the long-standing
  Phase 3 carryover where `QuotesWorkspace` set the context but the
  destination silently dropped it. The continuity baseline now
  reports **0 silent-drop opportunity orphans** (the remaining 2
  orphans are `recovery_candidate` and `lead_inbox_item`, both of
  which now have proper consume sites in `LeadRecovery.tsx`).
- **Demo gating audit** — `LEAD_RECOVERY_CAMPAIGNS` and the analytics
  block in `LeadRecovery.tsx` are gated on `isDemo === true` (verified
  via the demo-fixture guard scan; both branches honestly render
  `EmptyStateCard` in live mode without recorded campaigns).

### Files changed

- `src/modules/business/components/business/lead-inbox/useLeadInbox.ts`
- `src/modules/business/components/business/lead-inbox/LeadDetailPanel.tsx`
- `src/modules/business/components/business/LeadRecoveryPane.tsx`
- `src/modules/business/pages/LeadRecovery.tsx`
- `src/modules/business/pages/RecoveredValuePage.tsx`
- `src/modules/business/pages/OpportunitiesCenter.tsx` (orphan
  handoff close — Phase 3 carryover)
- `src/integrations/supabase/types.ts` (auto-regenerated)

### Files added

- `supabase/migrations/20260427085843_*.sql`
- `src/__tests__/business-os/integration/lead-recovery-loop.test.ts`

### Tests

- `lead-recovery-loop.test.ts` — three checks:
  1. `setLinkedContext({entityType:"recovery_candidate"})` writes
     the expected payload to `sessionStorage` under the canonical
     `sita-linked-context` key.
  2. The Phase-4 lineage columns exist in the generated
     `supabase/types.ts` (TypeScript-level guard against migration
     drift via the use sites in `useLeadInbox.ts`).
  3. The inbox accept update payload carries both
     `produced_contact_id` and `produced_lead_id` references when
     materialisation succeeds.
- All three pass; full `tsc --noEmit` is clean.

### Anti-duplication

- Reused `setLinkedContext` / `useLinkedContext` for every handoff —
  no parallel context bus.
- Reused `fromTable` for all writes — no new query layer.
- Reused `CrossAppAction` for the Lead → Recovery deep-link.
- Reused `EmptyStateCard` / `PageTruthBanner` for honest empty &
  unauth states.
- No new lineage helper, lineage hook, or lineage table introduced —
  the chain is encoded directly in the canonical tables.

### Baseline delta

| Metric | Phase 3 | Phase 4 |
|---|---|---|
| `setLinkedContext` call sites | 15 | **17** (+1 LeadRecoveryPane, +1 LeadDetailPanel) |
| `consumeLinkedContext` call sites | 6 | 6 (unchanged — `useLinkedContext` is the canonical consumer) |
| Convert-to-* action handlers | 4 | 4 |
| Silent-drop `opportunity` orphans | 1 | **0** |

### Phase 4 exit criteria

- [x] Lead → contact → lead → opportunity lineage materialised on accept
- [x] Recovery action sets linked context and navigates to ledger
- [x] Recovered Value page consumes linked context and surfaces the entity
- [x] LeadRecovery auto-selects arriving recovery candidates
- [x] OpportunitiesCenter consumes the carryover `opportunity` handoff
- [x] Demo data strictly gated on `isDemo === true`
- [x] No new orchestration helpers introduced
- [x] `tsc --noEmit` clean; phase test green

### Honest deferred (NOT Phase 4)

- `recovery_jobs` → `BackgroundTaskCenter` "Open source" CTA round-trip
  is tracked in **Phase 7** (BackgroundTaskCenter source routing
  completeness for every job kind).
- Recovered-value attribution from collections (paid-from-overdue
  invoices) is tracked in **Phase 8** (Finance receivables truth).

## Phase 5 — pending
## Phase 6 — pending
## Phase 7 — pending
## Phase 8 — pending
## Phase 9 — pending
## Phase 10 — pending