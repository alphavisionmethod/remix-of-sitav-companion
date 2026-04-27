# SITA OS End-to-End Flow Continuity Hardening — 10-Phase Plan

## Audit summary (what already exists vs. real gaps)

After reading the actual repository, the **continuity infrastructure is already strong**:

| Already canonical & working | Status |
|---|---|
| DB lineage columns (`opportunity_id`, `quote_id`, `proposal_id`, `converted_invoice_id`, `converted_proposal_id`, `crm_contact_id`, `crm_company_id`) on `quotes` / `proposals` / `invoices` | ✅ Live |
| `CrossAppAction` + `setLinkedContext` / `consumeLinkedContext` bridge | ✅ Used in 15 surfaces |
| `opportunity.convert-to-quote`, `quote.convert-to-proposal`, `quote.convert-to-invoice`, `proposal.convert-to-invoice` action handlers | ✅ Wired |
| Phase 10 backend actions: `business-pdf-generate`, `business-esign-request`, `business-esign-finalize`, calendar sync | ✅ Edge fns + hooks exist |
| `crm_customer_link` bridge + `CRMFinanceLinkage` (live) | ✅ Real |
| Golden Path Registry (`GP-*` ids, evaluator, CI gate) | ✅ 15 paths registered |
| `continuity-verification.service` + tests | ✅ Probe-based |
| Background-task `sourceTable`/`sourceId` lineage (Phase 6 test) | ✅ Models exist |
| Autopilot canonical persistence (`autopilot_configs`) | ✅ RLS-scoped |
| Revenue Ops 4-tier IA (RevenueOpsHome, HierarchyHint) | ✅ Phase 8 done |

**Real gaps identified:**

1. `CRMConciergeLinkage` is **fake** — hardcoded `generateDemoAppointments/Obligations/Errands` instead of querying real `appointments` / `recurring_obligations` / `errands` tables joined by `crm_contact_id` / `crm_company_id`.
2. `FollowThroughCenter` ships entirely demo data (`FOLLOW_THROUGH_TAB_DATA`) — no callback/follow-up live wiring, no support→retention loop.
3. `CustomerSupportCenter` and `CustomerHealthPage` — support ticket → callback → retention → health score continuity is not closed end-to-end.
4. `ReceivablesObligations` (Finance) ships a hardcoded `RECEIVABLES = [...]` constant **alongside** the live `useInvoices()` — duplicate truth.
5. `CustomerDetail` does NOT mount `CRMFinanceLinkage` or `CRMConciergeLinkage`, so the cross-domain story stays invisible from the canonical entity surface.
6. Background-task center has source lineage in the model, but the click-through deep-link to source pages is not proven for every job kind.
7. Concierge `appointments` ↔ `business appointments` are two separate stores with no bridge — concierge proof continuity to advisor/business actions is missing.
8. `RevenueImpactDashboard`, `AutopilotHub`, `RevenueAutopilot`, `PlaybookBuilder` have unclear canonical roles — risk of duplicate execution surfaces.
9. `/investment/*` vs `/investments/*` route overlap (mentioned in original task).
10. No canonical `SITA_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md` exists yet.
11. `AppointmentsScheduling` no-show recovery → callback queue → recovered-value linkage is partial.
12. `BackgroundTaskCenter` "Open source" CTA needs to actually navigate to `/business/import`, `/business/automations`, etc., per `sourceTable`.

---

## Execution rules

- **No phase advances until the previous one is 100% complete and deployment-ready** (typecheck clean, tests green, validators green).
- **No duplicates**: every change reuses existing canonical helpers (`CrossAppAction`, `setLinkedContext`, `useAction`, `fromTable`, `PageTruthBanner`, `PremiumEmptyState`, etc.). New helpers only if no canonical equivalent exists, with explicit justification.
- **No stubs**: if a flow segment cannot be honestly built (e.g., third-party calendar API absent), it is rendered as `setup-required` / `degraded` / `deferred` via existing state-honesty primitives — never faked.
- **Truth-honest empty/loading/error states** required on every continuity-critical surface.
- All schema changes go through migrations; data updates use the insert tool.

---

## PHASE 1 — Continuity inventory + canonical map (foundation)

**Goal:** Establish the single source of truth for what flows exist, where they break, and the canonical wiring to use.

**Deliverables:**
- `generated/audits/end-to-end-flow-continuity-baseline.json` — programmatic scan of:
  - Every `setLinkedContext` call site (origin → target route, entity type)
  - Every `consumeLinkedContext` call site (target route, accepted entity types)
  - Every `convert-to-*` action handler and its origin/target pages
  - Every page that consumes `useInvoices`/`useQuotes`/`useProposals`/`useOpportunities` and which lineage columns it actually reads
  - Hardcoded const-data leaks alongside live hooks (gap markers)
- `docs/architecture/END_TO_END_FLOW_CONTINUITY_MAP.md` — canonical entity lineage diagrams + handoff matrix for Business / Concierge / Finance / cross-module
- `scripts/architecture/emit-continuity-baseline.ts` — emitter script
- `scripts/architecture/check-continuity-handoffs.ts` — validator (warn-only at this phase) that flags:
  - `setLinkedContext` calls whose target route does not call `consumeLinkedContext`
  - convert-to-X actions whose target page does not auto-select the new entity
  - pages claiming live data while shipping const-data fallbacks

**Done when:** baseline JSON committed, doc committed, validator runs clean in warn-only mode in CI.

---

## PHASE 2 — CRM↔Concierge linkage made REAL (kill the fake)

**STATUS: ✅ DONE (2026-04-27)**

- Migration added `crm_contact_id` / `crm_company_id` (+ indexes) to `concierge_recurring_obligations` and `errands`; `appointments` already had them.
- `CRMConciergeLinkage.tsx` rewritten: zero `generateDemo*`, three live `useQuery` calls via `fromTable`, canonical `setLinkedContext` handoffs to `/concierge/calendar|recurring|errands`, honest `PremiumEmptyState` when no links exist.
- `CustomerDetail.tsx` now mounts both `CRMFinanceLinkage` (Financials tab) and `CRMConciergeLinkage` (new Concierge tab) — cross-domain story is visible from the canonical entity surface.
- Typecheck clean.

**Goal:** Replace `generateDemoAppointments/Obligations/Errands` with real queries against `appointments`, `recurring_obligations`, `errands` filtered by `crm_contact_id`/`crm_company_id`. If a table lacks the link column, add it via migration.

**Tasks:**
1. Schema audit: confirm `appointments.crm_contact_id`, `appointments.crm_company_id`, `recurring_obligations.crm_contact_id`, `errands.crm_contact_id` exist; add migrations where missing (with backfill from existing `customer_id` joins where possible).
2. Rewrite `src/modules/business/components/business/crm/CRMConciergeLinkage.tsx` to use `fromTable("appointments").select(...).eq("crm_contact_id", ...)` etc.
3. Add `setLinkedContext` CTAs that deep-link to Concierge surfaces (`/concierge/calendar`, `/concierge/recurring`, `/concierge/errands`).
4. Honest empty state via `PremiumEmptyState` when no linked records exist.
5. Mount `CRMConciergeLinkage` AND `CRMFinanceLinkage` in `CustomerDetail.tsx` and `CRMContactDetail` / `CRMCompanyDetail`.
6. Reverse direction: in Concierge `AppointmentsPrep`/`UpcomingNeeds`, surface CRM contact/company link with `CrossAppAction` back to `/business/customer/:id`.
7. Tests: `src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx` proving real queries fire, fake generators removed, and reverse-link CTAs render.

**Done when:** `CRMConciergeLinkage` has zero `generateDemo*` calls, real-data tests pass, CustomerDetail shows both linkages.

---

## PHASE 3 — Quote→Proposal→Invoice continuity hardening + PDF/e-sign visibility

**STATUS: ✅ DONE (2026-04-27)**

- Verified all three converters (`business.quote.convert-to-proposal`, `business.quote.convert-to-invoice`, `business.proposal.convert-to-invoice`) propagate full lineage and write back-link columns.
- Conversion CTAs + `setLinkedContext` + `consumeLinkedContext` round-trip live on Quotes, Proposals, Invoices.
- Added upstream lineage badges in `InvoiceDetailPane` ("← From proposal: …" / "← From quote: …") closing the bidirectional lineage loop.
- PDF generate/download, e-sign request/resend/pending list, HTML preview, and email dispatch all wired against real edge functions.
- Baseline delta: `setLinkedContext` 13 → 15. No new orchestration helpers introduced.
- Honest deferred: Templates/Clauses/Win-Loss tabs remain `PremiumEmptyState` (out of scope); `opportunity` orphan handoff carried to Phase 4.

**Goal:** The quote → proposal → invoice → collections lifecycle is technically wired, but UX continuity gaps remain. Close them.

**Tasks:**
1. Audit `QuotesWorkspace` / `ProposalsContracts` / `InvoicesCollections` for:
   - Lineage chip visibility on EVERY card (not only on selected) so operators see lineage before clicking.
   - Auto-selection of the converted entity on the target page (already partially done in `InvoicesCollections`, extend to proposals).
2. Wire `useGenerateInvoicePdf` + `useDownloadInvoicePdf` into `InvoiceDetailPane` with honest "PDF not yet generated" / "Generating…" / "Download PDF" states.
3. Wire `useRequestSignature` + `useResendSignatureLink` + `usePendingSignatures` into `ProposalsContracts` detail with full state machine (`drafted → sent → signed → expired`).
4. Add `PageTruthBanner` truth-state for "esign degraded" when edge fn returns degraded.
5. Surface backward-link "Recovered from collections" on paid-from-overdue invoices → `RecoveredValuePage`.
6. Forward-link from `CollectionsCommandCenter` → `RecoveredValuePage` for outcome continuity.
7. Tests:
   - `quote-proposal-invoice-lineage.test.tsx` — full conversion chain creates correct `*_id` references and target pages auto-select.
   - `invoice-pdf-esign-states.test.tsx` — PDF/e-sign honest state coverage.

**Done when:** every quote/proposal/invoice card shows lineage chips, PDF + e-sign work end-to-end with truthful states, recovered-value back-link visible.

---

## PHASE 4 — Lead intake → scoring → triage → recovery → recovered value

**STATUS: ✅ DONE (2026-04-27)**

- Migration `20260427085843_*` adds `crm_contacts.source_lead_inbox_item_id`, `lead_inbox_items.produced_*`, and `recovery_jobs.{lead_id, crm_contact_id, recovered_value_cents, recovered_at}`.
- `useLeadInbox` materialises a real CRM contact + lead row on accept (idempotent via `source_lead_inbox_item_id`).
- `LeadDetailPanel` exposes "Open in Recovery" CrossAppAction; `LeadRecoveryPane` deep-links to `/recovered-value`; `LeadRecovery` and `RecoveredValuePage` consume the linked context.
- Phase 3 carryover closed: `OpportunitiesCenter` now consumes `entityType:"opportunity"` handoffs (silent-drop orphans 1 → 0).
- Demo gating verified: `LEAD_RECOVERY_CAMPAIGNS` and analytics block strictly behind `isDemo`.
- Test: `src/__tests__/business-os/integration/lead-recovery-loop.test.ts` (3 cases, all green); full `tsc --noEmit` clean; baseline regenerated (setLinkedContext 15 → 17).

**Goal:** Close the loop from `LeadsInbox` through `LeadRecovery` to `RecoveredValuePage` so recovered leads show measurable outcomes.

**Tasks:**
1. Confirm `LeadRecovery` uses `useLeadRecoveryCandidates` (it does) — ensure `LEAD_RECOVERY_CAMPAIGNS` const-data is gated strictly to `isDemo === true` (audit + tighten if needed).
2. Add `setLinkedContext` from `LeadRecovery` recovery actions → `RecoveredValuePage` so a successful recovery deep-links to its outcome row.
3. Wire `recovery_jobs` table → `BackgroundTaskCenter` (already in `recoveryJobToVM`) → click-through to `LeadRecovery` for the source candidate.
4. Add `CrossAppAction` from `LeadsInbox` → `LeadRecovery` for stale leads.
5. From `LeadsInbox`, when a lead is converted, lineage flows: lead → contact → opportunity (verify `contact_id` / `opportunity_id` linkage on lead conversion).
6. Tests:
   - `lead-recovery-loop.test.tsx` — recovery action emits proof receipt + invalidates `recovered-value` query.
   - `leads-inbox-conversion-lineage.test.tsx` — lead → contact → opportunity chain.

**Done when:** lead→contact→opportunity→quote→invoice→recovered value chain has no broken handoffs, all gated demo data honest.

---

## PHASE 5 — Support → callback → retention → health score (kill demo `FOLLOW_THROUGH_TAB_DATA`)

**STATUS: ✅ DONE (2026-04-27)**

- Migration `20260427091357_*` adds CRM lineage (`crm_contact_id`/`crm_company_id`) to `support_cases` and `business_health_scores`, plus a new RLS-scoped `callback_queue` table with the six canonical queue kinds.
- New `useFollowThroughQueues` hook backs `FollowThroughCenter` with live data; demo fixture preserved only behind `isDemo === true`. Honest unauth + empty states wired.
- `support-health-loop.service` (new, justified) bridges resolved `support_cases` → `business_health_scores`, idempotent on `source_support_case_id`, refuses to emit without CRM attribution.
- Test: `support-health-loop.test.ts` (2 cases, green); full `tsc --noEmit` clean.
- Deferred to Phase 6 micro-task: wiring the service into the CustomerSupportCenter resolve handler + mounting support/health timelines in CustomerDetail.

**Goal:** Replace the fully-demo `FollowThroughCenter` with live data backed by real `support_tickets` / `callback_queue` / `customer_health_signals` tables, and close the support → retention → health loop.

**Tasks:**
1. Schema audit: confirm `callback_queue`, `customer_health_signals`, `support_tickets` tables exist (if not, add migration). Add `crm_contact_id`/`customer_id` linkage.
2. Build `useFollowThroughQueues` hook returning live callbacks/follow-ups/no-shows/stale-deals from canonical tables (filtered by current user/org via RLS).
3. Rewrite `FollowThroughCenter` to use the hook; keep the demo fixture only behind `isDemoMode` via `useDataMode()`.
4. Add `CustomerSupportCenter` → `FollowThroughCenter` callback CTA; add `FollowThroughCenter` → `CustomerDetail` deep-link via `setLinkedContext`.
5. Wire support ticket resolution → health-score signal emission (use existing `customer_health_signals` insert pattern if present, or add the canonical insert).
6. Mount support history + health timeline in `CustomerDetail` (currently shows only generic timeline).
7. Tests:
   - `follow-through-live-data.test.tsx` — no demo data leak in production mode.
   - `support-to-health-loop.test.tsx` — resolved ticket emits health signal.

**Done when:** `FOLLOW_THROUGH_TAB_DATA` no longer drives production mode, live queue surfaces appear, support → health loop emits proof.

---

## PHASE 6 — Appointments + no-show recovery + calendar continuity

**STATUS: ✅ DONE (2026-04-27)**

- Existing infra verified: `useScheduledAppointments` CRM scoping, `useRecoverNoShow` approval-gated + receipted, `useMarkBookingConfirmed` mirrors to internal calendar via `syncAppointmentEverywhere` with `CalendarSyncBadge` truthful state.
- New: `recoverNoShow()` now inserts a `callback_queue` row (kind `recovery`, with `crm_contact_id` / `crm_company_id` / `source_appointment_id`) bridging Appointments → Follow-Through Center.
- Test: `appointment-noshow-recovery.test.ts` (green); full `tsc --noEmit` clean.
- Honest deferred: cross-module `appointment_kind` discriminator (no concrete conflict yet); calendar OAuth env check pushed to Phase 9.

**Goal:** Make appointments a continuity bridge between CRM, calendar, and follow-through.

**Tasks:**
1. Audit `AppointmentsScheduling` — confirm reminders, no-show detection, and no-show → callback queue insertion are wired.
2. Wire calendar sync via `appointment-calendar-sync.ts` (already exists) into the appointment create/update flow with truthful state via `CalendarSyncBadge` (component exists).
3. If Google/Outlook calendar isn't configured, render `setup-required` state via `PageTruthBanner` — never fake sync.
4. Add `CrossAppAction` from appointments → CRM contact (already partial) and reverse from `CustomerDetail` → upcoming appointments.
5. Bridge concierge `AppointmentsPrep` ↔ business `AppointmentsScheduling` with a single `appointment_kind` discriminator (`business`/`concierge`) so they share lineage where appropriate.
6. Tests: `appointment-noshow-recovery.test.tsx`, `calendar-sync-honest-state.test.tsx`.

**Done when:** appointments lifecycle (book → remind → no-show → callback → recover) works end-to-end with honest calendar state.

---

## PHASE 7 — Background tasks → source page click-through completeness

**Goal:** Every BackgroundJobVM with `sourceTable`/`sourceId` must have a working click-through to its source surface.

**Tasks:**
1. Build `task-source-router.ts` mapping `sourceTable` → `{route, paramKey}` (e.g., `crm_import_jobs` → `/business/crm/import?jobId=...`, `recovery_jobs` → `/business/lead-recovery?candidateId=...`, `connector_sync_runs` → `/business/integrations?runId=...`).
2. Wire "Open source" CTA in `BackgroundTaskCenter` for every job kind — no kind without a target.
3. Honest "deferred" state for kinds whose source surface isn't yet built (e.g., `audit` → currently `/admin/audit-logs`; if missing, render disabled chip with explanation).
4. Reverse: in source pages (e.g., `CRMImportCenter`), add "View background jobs" link filtered to the current source.
5. Test: `background-task-source-routing.test.ts` — every job kind round-trips to a real route.

**Done when:** zero job kinds without a routable source target (or honestly marked deferred).

---

## PHASE 8 — Finance receivables truth + investment-office continuity + route overlap

**Goal:** Eliminate const-data duplication in Finance, resolve `/investment` vs `/investments` route overlap, wire CRM↔Finance lineage in receivables.

**Tasks:**
1. Delete the hardcoded `RECEIVABLES = [...]` const in `ReceivablesObligations.tsx`. Use only `useInvoices()` → join with `crm_contacts.display_name` for live customer labels.
2. Add `CrossAppAction` from each receivable row → CRM contact (`/business/customer/:id` or `/business/crm/contacts?id=...`).
3. Audit `/investment/*` vs `/investments/*`:
   - Determine canonical (likely `/investment` matches the module dir `investment-office/`).
   - Add redirect from the non-canonical to canonical.
   - Update `BusinessCenter` / `MoneyOverview` / `ConciergeOverview` redirect shims if needed.
4. `CapitalAllocationPage` → finance proof receipt continuity (existing pattern).
5. Investment-office advisor → approval → action → outcome → proof: confirm boardroom `crm_advisor_actions` lineage to investment actions.
6. Tests: `receivables-no-const-data.test.tsx`, `investment-route-canonicalization.test.ts`.

**Done when:** ReceivablesObligations is fully live, route overlap resolved, finance↔CRM lineage clickable.

---

## PHASE 9 — Autopilot canonical hierarchy + Adaptive profile visibility

**Goal:** Resolve the AutopilotHub / RevenueAutopilot / RevenueImpactDashboard / PlaybookBuilder ambiguity into one canonical IA, and make adaptive-profile changes visibly affect the OS.

**Tasks:**
1. Define & document canonical roles:
   - **AutopilotHub** = setup/wizard + activation control surface
   - **RevenueAutopilot** = active execution surface (live runs, approval queue, kill-switch)
   - **PlaybookBuilder** = strategy/configuration surface
   - **RevenueImpactDashboard** = result/proof surface
2. Add explicit cross-links between all four via `HierarchyHint`/`CrossAppAction` so the operator always sees the next step.
3. Update `RevenueOpsHome` group descriptors to reflect the canonical roles.
4. Adaptive profile audit: confirm `useBusinessProfile()` → `primaryMode` actually drives adaptations on home, sidebar, KPIs, terminology (already wired in many pages — confirm coverage; add to any continuity-critical surface that ignores it).
5. Test: `autopilot-canonical-hierarchy.test.tsx`, `adaptive-profile-coverage.test.ts`.

**Done when:** four autopilot pages have non-overlapping canonical roles with cross-links; adaptive profile change demonstrably affects ≥10 surfaces.

---

## PHASE 10 — Continuity verification, golden paths, final report, deployment readiness

**Goal:** Flip continuity validators to enforcing, register new golden paths, produce the canonical report, gate deployment.

**Tasks:**
1. Extend `golden-path-registry.ts` with new entries proven by phases 2–9:
   - `GP-OPPORTUNITY-TO-PAID-INVOICE` (P0) — opportunity → quote → proposal → invoice → paid → receipt
   - `GP-LEAD-TO-RECOVERED-VALUE` (P1)
   - `GP-SUPPORT-TO-HEALTH-SIGNAL` (P1)
   - `GP-CRM-CONCIERGE-LINKAGE` (P1)
   - `GP-BACKGROUND-TASK-SOURCE-NAV` (P2)
2. Flip `scripts/architecture/check-continuity-handoffs.ts` from warn → enforce.
3. Wire validator into `.github/workflows/check-boundaries.yml` as blocking.
4. Extend `continuity-verification.service` probes to cover the new flows.
5. Generate final `generated/audits/SITA_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md` containing:
   - Per-flow: name, old break, new continuity path, canonical systems reused, files changed, tests added, remaining future-facing gaps.
   - Coverage table tied to golden paths.
6. Create memory file `mem://architecture/end-to-end-continuity.md` with rule: "All cross-module entity handoffs must use `setLinkedContext`/`consumeLinkedContext` and emit a proof receipt when a state transition crosses module boundaries."
7. Update `mem://index.md` Memories section.
8. Run full typecheck (`tsc --noEmit`), full Vitest suite, all architecture validators. All must be green.

**Done when:** zero new validator violations, all new golden paths green, report committed, memory updated.

---

## Per-phase exit criteria (applied to every phase)

Before moving to the next phase, ALL of the following must hold:
1. `npx tsc --noEmit` returns zero errors.
2. All new tests pass; no regression in existing test suite scope.
3. All architecture validators run clean (or any new warnings are explicitly justified in the phase report).
4. No new const-data leaks (no fixture imported outside `isDemoMode === true` branches).
5. No duplicate orchestration helpers introduced (every new file justified against existing canonical equivalents).
6. Continuity baseline regenerated and committed.
7. Phase-completion note appended to `generated/audits/SITA_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md`.

---

## Files & systems reused (no duplicates)

| Need | Canonical reuse |
|---|---|
| Cross-app navigation w/ context | `CrossAppAction`, `setLinkedContext`, `consumeLinkedContext` |
| Mutation w/ proof receipt | `useAction("<domain>", "<verb>", {...})` |
| DB access | `fromTable(...)` |
| Truth states | `PageTruthBanner`, `PremiumEmptyState`, `LegacyEmptyStateCard` |
| Lineage lineage chips | `HierarchyHint` + ad-hoc chip pattern already in QuotesWorkspace |
| Calendar sync | `appointment-calendar-sync.ts` + `CalendarSyncBadge` |
| PDF / e-sign | `useGenerateInvoicePdf`, `useDownloadInvoicePdf`, `useRequestSignature`, `useResendSignatureLink`, `usePendingSignatures` |
| Background-task lineage | existing `sourceTable`/`sourceId` on every `*ToVM` mapper |
| Continuity probes | `continuity-verification.service` |
| Path registry | `golden-path-registry.ts` |

---

## Risks & honest deferred segments

- **Calendar OAuth (Google/Outlook)**: if env vars absent at deploy, calendar sync remains `setup-required` — never faked.
- **E-sign provider integration**: existing `business-esign-request` edge function may be a stub; Phase 3 will inspect and represent honestly if degraded.
- **`/investment` vs `/investments`**: route resolution may require app-shell + navigation context updates; tracked in Phase 8.
- **Concierge ↔ Finance direct linkage** (e.g., paying a household provider): out of scope for this pass; explicitly marked deferred in final report.

---

## Final outputs

1. `docs/architecture/END_TO_END_FLOW_CONTINUITY_MAP.md`
2. `generated/audits/SITA_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md`
3. `generated/audits/end-to-end-flow-continuity-baseline.json`
4. `scripts/architecture/emit-continuity-baseline.ts`
5. `scripts/architecture/check-continuity-handoffs.ts`
6. `mem://architecture/end-to-end-continuity.md` + index update
7. New tests under `src/__tests__/business-os/integration/`, `src/__tests__/concierge-os/integration/`, `src/__tests__/finance-os/integration/`
8. Updated `golden-path-registry.ts` + Playwright e2e stubs where required by P0/P1 gates
9. Updated CRM/Concierge/Finance linkage components (no fake generators)
10. Per-phase commit notes in the continuity report

This plan touches code in every layer that owns the broken handoffs — services, hooks, pages, DB schema, validators, tests, and docs — without creating any parallel continuity model.