# SITA OS — Cross-Module Integration Deepening Report

**Status:** Phase 1 complete. Phases 2–8 pending.

This report is the rolling, human-readable companion to:

- `src/platform/integration/cross-module-integration-map.ts` — canonical map
- `generated/audits/cross-module-integration-audit.json` / `.md` — repo audit
- `src/__tests__/integration/cross-module-map-coverage.test.ts` — coverage ratchet

It records, per integration pair: old weakness → new structural linkage → reused
canonical systems → exact files changed → tests protecting it → remaining
deferred gaps with rationale. Each phase appends to this document.

---

## Phase 1 — Audit + Canonical Integration Map (DONE)

### Deliverables

- **Audit script** — `scripts/architecture/audit-cross-module-integration.ts`
  Walks `src/` and `supabase/migrations/` for: link tables, bridge services,
  linkage components, `setLinkedContext` call-sites, `crm_*_id` FK usage,
  background-task resolvers, advisor outcome handlers, adaptive signal
  emitters/receivers, readiness consumers. Emits classified JSON + Markdown.
- **Canonical map** — `src/platform/integration/cross-module-integration-map.ts`
  11 cross-module relationships registered, each with: identity model, owning
  service, forward + reverse routes, proof carrier, notification topic, notes.
- **Coverage ratchet** — `src/__tests__/integration/cross-module-map-coverage.test.ts`
  Fails if any required pair is missing or any entry lacks identity/route/proof.
- **Audit artifacts** — `generated/audits/cross-module-integration-audit.{json,md}`

### Audit baseline (47 touchpoints found)

| Kind | Count |
| --- | --- |
| `link-table` (DB) | from migrations |
| `bridge-service` | crm-finance-bridge present |
| `linkage-component` | CRMFinanceLinkage, CRMConciergeLinkage, CRMFilesLinkage, CRMProofTrail |
| `set-linked-context` | 11 call-sites pre-Phase-2 |
| `fk-column-usage` | broad — `crm_contact_id` / `crm_company_id` widely referenced |
| `background-task-resolver` | Business-only today (Phase 4 will promote) |
| `advisor-outcome-handler` | **MISSING** — Phase 5 will introduce |
| `adaptive-signal-emitter` | `CrossDomainSignalBridge` (Business only) |
| `readiness-consumer` | `use-focus-mode`, `notification-calm-data-service` (partial) |

### Classification of pre-existing integrations

- **Strong**: CRM ↔ Finance contact-level (link table + bridge service + UI)
- **Partial**: CRM ↔ Concierge (forward only — reverse `ConciergeCRMBackLink`
  not yet rendered on appointment/errand detail surfaces)
- **Missing-reverse**: Finance detail → CRM contact, Concierge detail → CRM
- **Missing-identity**: company-level CRM ↔ Finance link
- **Missing-proof**: advisor recommendation → operational outcome lineage
- **UI-only**: adaptive signals (no symmetric receivers in
  Concierge/Finance/Boardroom)

### Files added

- `src/platform/integration/cross-module-integration-map.ts`
- `scripts/architecture/audit-cross-module-integration.ts`
- `src/__tests__/integration/cross-module-map-coverage.test.ts`
- `generated/audits/cross-module-integration-audit.json`
- `generated/audits/cross-module-integration-audit.md`
- `generated/audits/SITA_OS_CROSS_MODULE_INTEGRATION_DEEPENING_REPORT.md` (this file)

### Files modified

_(none — Phase 1 is purely additive.)_

### Tests added

- `src/__tests__/integration/cross-module-map-coverage.test.ts` (6 assertions)

### Remaining gaps (deferred to later phases by design)

- Phase 2: company-level CRM ↔ Finance link table column + reverse navigation
- Phase 3: household/provider ↔ business records bridge table + service
- Phase 4: background-task resolver promoted to platform with Concierge/Finance source tables
- Phase 5: `advisor_action_outcomes` table + bridge service + receipt trigger
- Phase 6: DB-backed recovered-value ledger + Finance/Revenue surface integration
- Phase 7: cross-domain signal bus + readiness gate
- Phase 8: bidirectional navigation validator + proof/notification continuity tests

### Confirmed deferrals (out of scope for this prompt)

- Wearable hardware ingestion (no device SDK in repo; readiness gate accepts
  `provider: 'manual' | 'simulated'` only)
- Cross-org / multi-tenant link sharing (single-org assumption preserved)
- Mobile push notification continuity (per `mem://constraints/notification-scope`)

---

## Phase 2 — CRM ↔ Finance hardening (DONE)

### Old weakness

- `crm_customer_link` was contact-only at the service layer — no helper to
  resolve customers reachable from a `crm_company`.
- Finance detail surfaces (Invoice, Quote) had **no reverse navigation** to
  the originating CRM contact, even though the FK column was already
  populated by the kernel handlers.
- The bridge service had no helper to walk `customer → CRM contact/company`
  for back-link UIs.

### New structural linkage

- **Service** (extended, no new file): `crm-finance-bridge.service.ts` gains
  `findCustomersForCompany`, `findPrimaryCustomerForCompany`, and
  `resolveCrmEntityForCustomer`. All reuse the existing
  `crm_customer_link` table, `getUserId` helper, and `fromTable` chain — no
  parallel lookup logic.
- **UI** (new): `FinanceContactBackLink` component (`pill` + `card`
  variants), embedded in `InvoiceDetailPane` and `QuotesWorkspace` detail
  pane. Uses `setLinkedContext` for handoff. Renders nothing when no link
  exists — preserves Empty-State Honesty.
- **Auto-link** on quote/invoice create paths was **already implemented**
  via `resolveCustomerId` in `business-handlers.ts` (verified). No
  duplication added.
- **Schema migration**: not required. `crm_customer_link.crm_company_id`
  index already exists; `crm_contact_id NOT NULL` semantics are preserved
  (company linkage is naturally expressed as the union of contact links).

### Canonical systems reused

- `crm_customer_link` table + RLS
- `crm-finance-bridge.service.ts`
- `setLinkedContext()` (CrossAppAction)
- `fromTable` Supabase helper
- `useAuth` context, `@tanstack/react-query`

### Files added

- `src/modules/business/components/business/finance/FinanceContactBackLink.tsx`
- `src/__tests__/integration/phase-2-crm-finance-hardening.test.ts` (5 tests)

### Files modified

- `src/lib/services/business-os/crm-finance-bridge.service.ts` (+3 helpers)
- `src/modules/business/components/business/InvoiceDetailPane.tsx`
- `src/modules/business/pages/QuotesWorkspace.tsx`

### Tests protecting it

- `phase-2-crm-finance-hardening.test.ts` — 5 assertions across
  `findCustomersForCompany` (dedup + isolation), `findPrimaryCustomerForCompany`
  (recency heuristic + null path), `resolveCrmEntityForCustomer` (truthful empty)
- Pre-existing `crm-finance-bridge.test.ts` continues to cover contact-side
  helpers and ledger summarization.

### Gate

- 68/68 tests passing (57 IA + 6 Phase 1 + 5 Phase 2)
- `tsc --noEmit` clean
- Truth map unchanged

### Remaining gaps (deferred to later phases)

- `CollectionsWorkspace` uses fixture-shape selection (`customerName`, not
  `customer_id`), so the back-link is not wired there yet. Phase 6
  (recovered value ↔ Finance) will replace that fixture surface with the
  DB-backed ledger and the back-link will fall in naturally.