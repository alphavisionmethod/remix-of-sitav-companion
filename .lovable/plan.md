# SITA OS — Cross-Module Integration Deepening

Eight sequential phases. Each phase is fully implemented, tested, validator-clean, and `tsc --noEmit` clean before the next begins. All work extends existing canonical primitives — no parallel architecture.

## Canonical primitives discovered (will be reused, not duplicated)

- **Bridge table**: `crm_customer_link` (DB) — already keyed on `user_id + crm_contact_id + customer_id`
- **Bridge service**: `src/lib/services/business-os/crm-finance-bridge.service.ts` — `findCustomerForContact`, `findContactForCustomer`, `ensureCustomerForContact`
- **Cross-app handoff**: `setLinkedContext()` in `src/platform/sita/components/sita/CrossAppAction.tsx`
- **Linkage UIs**: `CRMFinanceLinkage`, `CRMConciergeLinkage`, `CRMFilesLinkage`, `CRMProofTrail`, `CRMEscalateToBoardroom`
- **Background task lineage**: `src/lib/business/task-target-resolver.ts` (+ `business-background-tasks-service.ts`)
- **Continuity verifier**: `src/lib/services/business-os/continuity-verification.service.ts`
- **Recovered value**: `recovered-value-ledger.service.ts` + `RecoveredValuePage.tsx` + `recovered-value-runtime` contract
- **Adaptive**: `CrossDomainSignalBridge.tsx` (Business-side only today)
- **Readiness/focus**: `use-focus-mode.ts`, `health-signal-data-service.ts`, `notification-calm-data-service.ts`, `CognitiveLoadGuard.tsx`
- **Advisor lineage**: `advisor-business-action.test.ts` exists; advisor → outcome propagation is partial
- **Truth artifacts**: `generated/audits/SITA_OS_ROUTE_AND_NAVIGATION_TRUTH_MAP.md`, IA manifest, validators in `scripts/architecture/checks/`

## Phase 1 — Audit + Canonical Integration Map (foundation, blocks all other phases)

Deliverables (no UI yet — this becomes the contract every later phase implements against):

1. `scripts/architecture/audit-cross-module-integration.ts` — scans repo for: link tables, bridge services, linkage components, `setLinkedContext` call-sites, `crm_*_id` FK usage, advisor outcome handlers, background-task source tables, adaptive signal emitters/receivers, readiness consumers. Emits `generated/audits/cross-module-integration-audit.json` + `.md` classifying each touchpoint as `ui-only | partial | strong | missing-reverse | missing-proof | missing-identity`.
2. `src/platform/integration/cross-module-integration-map.ts` — single canonical TS registry of every cross-module relationship (pair, direction, identity model, proof carrier, navigation route, owning service). All later phases read from this.
3. `src/__tests__/integration/cross-module-map-coverage.test.ts` — fails if a known integration pair is missing from the map, or if a registered pair lacks navigation/identity/proof fields.
4. `generated/audits/SITA_OS_CROSS_MODULE_INTEGRATION_DEEPENING_REPORT.md` — initial scaffold (rolling document updated each phase).

Exit gate: audit JSON + map exist, coverage test green, tsc clean.

## Phase 2 — CRM ↔ Finance hardening

Existing weakness: `crm_customer_link` is contact-scoped only; companies cannot resolve to billing customers; finance surfaces (Invoices/Quotes/Collections) don't link back to the originating CRM contact in their detail UI.

1. **DB migration**: extend `crm_customer_link` with optional `crm_company_id` index and add a unique partial index `(user_id, crm_company_id, customer_id) WHERE crm_company_id IS NOT NULL`. Add `link_origin_event_id` FK for proof lineage. RLS preserved (already `is_org_member`).
2. **Service extension** (no new service): add `findCustomerForCompany`, `ensureCustomerForCompany`, `linkCustomerToCompany` to `crm-finance-bridge.service.ts`.
3. **Reverse navigation**: new `FinanceContactBackLink` component reused inside `InvoiceDetail`, `QuoteDetail`, `CollectionsCase` — uses `findContactForCustomer` and renders a "Open in CRM" pill that calls `setLinkedContext`.
4. **Auto-link** on invoice/quote create paths in existing `invoice-linking.service.ts` and `quotes.service.ts` — write the link with `link_source: 'auto-from-invoice' | 'auto-from-quote'`.
5. Tests: extend `crm-finance-bridge.test.ts` + new `finance-to-crm-backlink.test.tsx`.

## Phase 3 — CRM ↔ Concierge hardening + Household/Provider linkage

1. **Reverse direction**: `CRMConciergeLinkage` already reads concierge artifacts by `crm_contact_id`. Add the symmetric `ConciergeCRMBackLink` shown inside `AppointmentDetail`, `ErrandDetail`, `HouseholdProviderDetail`. Resolves CRM contact via the same column.
2. **Household ↔ business records**: new link table `household_business_link (user_id, household_id, crm_contact_id | crm_company_id, role, created_at)` + service `household-business-bridge.service.ts` (mirrors finance bridge shape — same patterns, no parallel abstraction).
3. **Provider ↔ contact**: surface provider records on `CRMContactDetail` via the same bridge.
4. Tests: extend `concierge-business-linkage.test.ts` + new `household-business-bridge.test.ts`.

## Phase 4 — Background tasks as cross-module continuity infrastructure

Existing weakness: `task-target-resolver` is Business-only.

1. Promote resolver to platform: move logic into `src/platform/integration/background-task-target-resolver.ts` (re-export from existing path to preserve imports). Extend `sourceTable` map with Concierge (`concierge_recurring_obligations`, `errand_runs`, `appointment_recovery_runs`) and Finance (`invoice_dunning_runs`, `payment_reconciliation_jobs`).
2. Background task list (`BackgroundTaskCenter`) gets a `module` filter chip (Business / Concierge / Finance / Platform).
3. Each task row gains a "Open source" + "Open result" pair (already present for source — add result destination from `result_artifact_ref`).
4. Tests: extend `background-task-source.test.ts`, `background-task-routing.test.ts`.

## Phase 5 — Advisor actions ↔ operational outcomes

Existing weakness: advisor recommendations are emitted but outcome lineage back to the advisor surface is partial.

1. **DB**: new table `advisor_action_outcomes (id, user_id, advisor_id, recommendation_id, target_module, target_entity_type, target_entity_id, outcome_status, outcome_value_cents, receipt_id, created_at)` with RLS via `is_org_member`.
2. **Service**: `src/lib/services/advisors/advisor-outcome-bridge.service.ts` — `recordOutcome`, `listOutcomesForRecommendation`, `listRecentOutcomesForAdvisor`. Used by existing receipt emission helper (`emitActionReceipt`) — receipts that include `advisor_recommendation_id` automatically write an outcome row via a single DB trigger (`fn_advisor_outcome_from_receipt`).
3. **UI**: `AdvisorOutcomeTrail` component embedded in `CRMAdvisorBoard`, advisor profile pages, and Boardroom advisor detail. Bidirectional: clicking an outcome row navigates to the target entity via `setLinkedContext`.
4. Tests: `advisor-outcome-bridge.test.ts` + extend `advisor-business-action.test.ts` to assert outcome row written.

## Phase 6 — Recovered value ↔ Finance + Revenue surfaces

Existing weakness: ledger lives in-memory; Finance/Revenue dashboards don't query it.

1. **DB-backed ledger**: new table `recovered_value_entries` (mirrors `RecoveredValueEntry` shape exactly; no model duplication) with FK `invoice_id`, `crm_contact_id`, `recovery_run_id`. RLS standard.
2. **Service**: extend existing `recovered-value-ledger.service.ts` with `persistEntry`, `listForInvoice`, `listForContact`, `summarizeForPeriod`. The in-memory `summarizeLedger` is kept as a pure helper used by both runtime and tests (no duplication).
3. **Surface integration**:
   - `RevenueAutopilotConsole` and `WealthCommandCenter` read `summarizeForPeriod` and render a "Recovered this period" tile.
   - `InvoiceDetail` shows a "Recovered via" trail when `recovered_value_entries.invoice_id` exists.
   - `CRMContactDetail` shows lifetime recovered value.
4. Tests: extend `recovered-value-ledger.service.test.ts` + new `recovered-value-finance-surface.test.tsx`.

## Phase 7 — Adaptive signals + readiness ↔ real consumers

Existing weakness: `CrossDomainSignalBridge` only emits in Business; readiness/focus state doesn't actually gate notifications or proactive nudges.

1. **Promote bridge** to `src/platform/integration/cross-domain-signal-bus.ts` — typed pub/sub over the existing `eventing` layer (no new event bus). Business `CrossDomainSignalBridge` becomes a thin emitter that calls into it; new symmetric receivers wired into Concierge (`ConciergeOverview`), Finance (`MoneyOverview`), Boardroom, and Notification calm engine.
2. **Readiness → interruption policy**: `notification-calm-data-service.ts` already exists. Add a `readinessGate(notification, readinessSnapshot, focusMode)` pure function in `src/platform/notifications/readiness-gate.ts`. Wire into `NotificationDispatcher` and `SitaProactiveBus` (Phase D nudge bus from memory). When `focus-mode = deep` or readiness < threshold, non-critical nudges are suppressed and queued; critical ones escalate per existing escalation policy.
3. **Adaptive context propagation**: new lightweight `useAdaptiveContext()` hook reads from the bus and exposes `{ workload, focus, readiness, recentSignals }` consumed by Business/Concierge/Finance overview pages to subtly reorder priority lists.
4. Tests: `cross-domain-signal-bus.test.ts`, `readiness-gate.test.ts`, `adaptive-context-propagation.test.tsx`.

## Phase 8 — Bidirectional navigation sweep + proof/notification continuity + final report

1. **Navigation sweep**: validator `scripts/architecture/checks/check-bidirectional-navigation.ts` walks the cross-module map and asserts each pair flagged `bidirectional: true` has both source→target and target→source `setLinkedContext` call-sites or back-link components. Auto-fail if missing.
2. **Proof continuity**: extend `continuity-verification.service.ts` with `verifyProofAcrossModules(receiptId)` — walks receipt → outcome → linked entity across modules, asserting the chain resolves.
3. **Notification continuity**: ensure cross-module outcomes (e.g., invoice paid → CRM contact lifetime value bump → advisor outcome row) all emit through the existing notification dispatcher with deep-link payloads.
4. **Tests**: `cross-module-bidirectional-nav.test.ts`, `proof-continuity-cross-module.test.ts`, `notification-continuity-cross-module.test.ts`.
5. **Final report**: `generated/audits/SITA_OS_CROSS_MODULE_INTEGRATION_DEEPENING_REPORT.md` finalized — every integration pair listed with: old weakness → new linkage → reused canonical systems → files changed → tests protecting it → remaining deferred gaps with rationale.
6. **Truth map regeneration**: `build-route-nav-truth-map.ts` re-run; IA tests stay green.

## Per-phase exit gate (every phase)

- All phase tests green
- All prior IA tests still green (57+ from earlier work)
- `tsc --noEmit` clean
- Validators clean (architecture, naming-grammar, shell-route-boundary, manifest-coverage, truth-map, plus phase 8's new bidirectional-nav and the phase-1 cross-module-map-coverage)
- Cross-module integration report updated
- Memory updated only if a new constitutional rule emerged

## Anti-duplication discipline (applies to every phase)

Before adding any file, search for canonical equivalents:
- Bridge logic → extend `crm-finance-bridge.service.ts` pattern
- Cross-app handoff → reuse `setLinkedContext`
- Background task routing → extend `task-target-resolver`
- Receipt emission → reuse `emitActionReceipt`
- Eventing → reuse `src/platform/eventing`
- Notification dispatch → reuse existing dispatcher / calm engine
- Empty states → reuse `PremiumEmptyState`

If a new file is created, the PR description (and the final report) records why no existing surface could be extended.

## Deferred (out of scope for this prompt, recorded in final report)

- Wearable hardware ingestion (no device SDK in repo today — readiness layer will accept a `provider: 'manual' | 'simulated'` for now, real wearable plumbing deferred until device runtime lands)
- Cross-org / multi-tenant link sharing (single-org assumption preserved; multi-tenancy already governed elsewhere)
- Mobile push notification continuity (memory notes mobile push deferred — web push + in-app remain in scope)
