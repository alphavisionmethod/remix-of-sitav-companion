# SITA OS — End-to-End Flow Continuity Map

> **Layer:** L3 Platform Operating Model
> **Baseline:** `generated/audits/end-to-end-flow-continuity-baseline.json`
> **Validator:** `scripts/architecture/check-continuity-handoffs.ts`
> **Report:** `generated/audits/SITA_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md`

## Purpose

This document is the **single source of truth** for how an operator
moves through SITA OS without losing continuity of entity, action,
approval, execution, outcome, proof, personalization, module
identity, or task state.

It is NOT a navigation diagram. It is the canonical wiring contract
between Business, Concierge, and Finance.

## Canonical continuity primitives

Every cross-module entity handoff in SITA OS uses **only** the
following canonical helpers — no parallel architecture is permitted.

| Concern | Canonical helper | Owner |
|---|---|---|
| Cross-app navigation w/ context | `setLinkedContext` / `consumeLinkedContext` (`@/platform/sita/components/sita/CrossAppAction`) | platform-sita |
| React hook wrapper | `useLinkedContext` (`@/hooks/useLinkedContext`) | shared-hooks |
| Visible cross-app jump chip | `<CrossAppAction to="..." label="..." context={...} />` | platform-sita |
| Mutation w/ proof receipt | `useAction(domain, verb, opts)` (`@/hooks/use-action`) | shared-hooks |
| DB access | `fromTable(name)` (`@/lib/supabase-helpers`) | shared-lib |
| Truth state on a page | `<PageTruthBanner truthState="..." />` | platform-sita |
| Empty state | `<PremiumEmptyState ... />` / `<LegacyEmptyStateCard ... />` | platform-sita |
| Calendar sync | `appointment-calendar-sync.ts` + `<CalendarSyncBadge />` | business-os |
| PDF / e-sign | `useGenerateInvoicePdf` / `useDownloadInvoicePdf` / `useRequestSignature` (`@/hooks/use-phase10-actions`) | shared-hooks |
| Background-task lineage | `sourceTable` + `sourceId` on every `*ToVM` mapper | business-domain |
| Continuity probe | `runContinuityVerification` (`@/lib/services/business-os/continuity-verification.service`) | business-os |
| Path registry | `golden-path-registry.ts` (`@/lib/operations`) | platform-operations |

## Entity lineage

The following lineage columns are **already live** in the database
(`crm_opportunities`, `quotes`, `proposals`, `invoices`,
`crm_customer_link`, `appointments`):

```text
crm_contact ──┐
              ├─→ crm_opportunity ──→ quote ──→ proposal ──→ invoice ──→ paid
crm_company ──┘                          │           │           │
                                         │           │           └─→ collection_run ──→ recovered_value
                                         │           └─→ converted_invoice_id (back-ref)
                                         └─→ converted_proposal_id (back-ref) / converted_invoice_id (back-ref)

lead ──→ recovery_job ──→ contact ──→ opportunity (reuses chain above)

appointment ─── crm_contact_id / crm_company_id ─── customer (CRM)
              └─── kind: "business" | "concierge" (shared store)

support_ticket ──→ callback_queue ──→ customer_health_signal ──→ customer.health_score
```

Every quote / proposal / invoice carries: `crm_contact_id`,
`crm_company_id`, `customer_id`, `opportunity_id`, plus the
conversion back-refs `converted_invoice_id` / `converted_proposal_id`.

## Module handoff matrix

| From | To | Trigger | Canonical wiring |
|---|---|---|---|
| `OpportunitiesCenter` | `QuotesWorkspace` | `opportunity.convert-to-quote` | `setLinkedContext({entityType:"quote"})` + `navigate("/business/quotes")` |
| `QuotesWorkspace` | `ProposalsContracts` | `quote.convert-to-proposal` | `setLinkedContext({entityType:"proposal"})` |
| `QuotesWorkspace` | `InvoicesCollections` | `quote.convert-to-invoice` | `setLinkedContext({entityType:"invoice"})` |
| `ProposalsContracts` | `InvoicesCollections` | `proposal.convert-to-invoice` | `setLinkedContext({entityType:"invoice"})` |
| `InvoicesCollections` | `CollectionsCommandCenter` | overdue → collection | DB transition + `CrossAppAction` chip |
| `CollectionsCommandCenter` | `RecoveredValuePage` | recovered → outcome | `CrossAppAction` chip |
| `LeadsInbox` | `CRMContacts` | lead → contact conversion | DB FK `lead.contact_id` + `CrossAppAction` |
| `LeadRecovery` | `RecoveredValuePage` | recovery job completed | `setLinkedContext({entityType:"recovered-value"})` |
| `CustomerSupportCenter` | `FollowThroughCenter` | ticket → callback | live `callback_queue` insert + `setLinkedContext({entityType:"callback"})` |
| `FollowThroughCenter` | `CustomerHealthPage` | resolved follow-up | `customer_health_signals` insert |
| `CRM contact/company` | `Money / Concierge` | linked records | `<CRMFinanceLinkage />` + `<CRMConciergeLinkage />` mounted in `CustomerDetail` |
| `Money receivables` | `CRM contact` | invoice row | `<CrossAppAction to="/business/customer/:id" />` |
| `BackgroundTaskCenter` | source page | "Open source" CTA | `task-source-router.ts` → `setLinkedContext` + `navigate(...)` |
| `AppointmentsScheduling` | CRM contact | participant link | `<AppointmentLineagePanel />` with `setLinkedContext({entityType:"contact"})` |
| `AppointmentsScheduling` | `FollowThroughCenter` | no-show | `callback_queue` insert + `CrossAppAction` |
| `Concierge AppointmentsPrep` | `Business AppointmentsScheduling` | shared `appointment_kind` | `setLinkedContext({entityType:"appointment"})` |
| Advisor recommendation | source action surface | approved → action | `useAction` w/ proof receipt + `CrossAppAction` to outcome |

## Adaptive personalization continuity

- **Single source:** `useBusinessProfile()` in `@/modules/business/hooks/useBusinessProfile`
- **Persistence:** `business_profiles` table via `business-profile.service`
- **Contract:** `primaryMode` ∈ {`service`, `agency`, `professional-practice`, `ecommerce`, `appointment-based`, `membership`, `employee-based`} drives terminology, KPIs, sidebar groups, and home widgets.
- **Continuity-critical surfaces** must read `primaryMode` and adapt labels/KPIs/CTAs. Pages that ignore it are flagged in the
  `adaptive-profile-coverage.test.ts` (Phase 9).

## Trust / proof continuity

Every state transition that crosses module boundaries MUST emit a
receipt via `useAction(domain, verb, ...)`. The receipt stream lands
in `crm_advisor_actions` / `proof_entries` and is rendered by:

- `BusinessProof` / `ConciergeProof` (per-domain timeline)
- `<ProofCard />` on entity surfaces
- `<ExecutionBadge />` / `<TrustBadge />` chips

## Truth states (no fake continuity)

Continuity-critical surfaces MUST honestly render:

- `loading` — query in flight
- `error` — query failed
- `empty` — no records yet
- `setup-required` — integration not yet configured (e.g., calendar OAuth absent)
- `degraded` — backend reports partial outage
- `pending-approval` — action is awaiting human gate
- `pending-execution` — approved, queue not yet picked up
- `failed` — execution returned an error
- `complete` — outcome + proof emitted
- `deferred` — segment honestly not yet implemented

`<PageTruthBanner />` exposes the active truth state at the page
header level; `<ExecutionBadge />` exposes the per-record state.

## Anti-duplication rules

Before introducing any new continuity helper, the following
canonical equivalents MUST be checked first:

1. **Cross-module navigation** → `CrossAppAction` / `setLinkedContext`
2. **Conversion lifecycle** → `useAction("<domain>", "<entity>.convert-to-<target>")` — extend the existing handler in `_action-router.ts`, do NOT create a parallel mutation.
3. **Entity lineage** → re-use existing DB FK columns (`*_id`, `converted_*_id`); add via migration only if a real new linkage exists.
4. **Cross-domain entity surface** → mount `<CRMFinanceLinkage />` / `<CRMConciergeLinkage />` in `CustomerDetail` instead of building a new linkage component.
5. **Background-task source navigation** → `task-source-router.ts` (Phase 7).
6. **Continuity probes** → extend `continuity-verification.service.ts` with a new probe — do NOT spawn a parallel verification module.
7. **Golden path registration** → add a `GP-*` entry to `golden-path-registry.ts`.

## How this map is enforced

| Layer | Mechanism |
|---|---|
| Static | `scripts/architecture/emit-continuity-baseline.ts` (run on every PR) |
| Static (warn) | `scripts/architecture/check-continuity-handoffs.ts` — Phase 1–9 |
| Static (enforce) | Phase 10 flips the validator to fail on orphan handoffs, silent drops, and unguarded fixture leaks in continuity-critical paths |
| Runtime | `runContinuityVerification` probes; report consumed by `BusinessProof` / Admin Verification surfaces |
| Tests | Per-flow integration tests under `src/__tests__/business-os/integration/` and per-module tests under `src/__tests__/concierge-os/integration/` and `src/__tests__/finance-os/integration/` |
| Golden Path Registry | `golden-path-registry.ts` registers each flow as a `GP-*` ID with required Playwright + receipt evidence |

## Phase progression (matches `.lovable/plan.md`)

| Phase | Focus |
|---|---|
| 1 | Inventory + canonical map + warn-only validator (this doc) |
| 2 | CRM↔Concierge linkage made REAL (kill the demo generators) |
| 3 | Quote→Proposal→Invoice continuity hardening + PDF/e-sign visibility |
| 4 | Lead intake → scoring → triage → recovery → recovered value |
| 5 | Support → callback → retention → health (kill demo `FOLLOW_THROUGH_TAB_DATA`) |
| 6 | Appointments + no-show recovery + calendar continuity |
| 7 | Background tasks → source page click-through completeness |
| 8 | Finance receivables truth + investment-office continuity + route overlap |
| 9 | Autopilot canonical hierarchy + adaptive profile visibility |
| 10 | Validator → enforcing, golden paths registered, final report, deployment gate |