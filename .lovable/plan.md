

# SITA OS Part 2 — Full Advanced Completion Plan

## Current State Summary

| Domain | Migrated | Legacy | Total |
|--------|----------|--------|-------|
| Business | 10 (Overview, Boardroom, Operations, Support, Collections, Comms, Quotes, FollowThrough, LeadRecovery, Invoices) | 11 (LeadsInbox, Opportunities, Proposals, Customers, AutopilotHub, BusinessDocs, BusinessProof, CRMHub, PlaybookBuilder, RevenueAutopilot, RevenueForecast) | 21 |
| Money | 10 (Overview, Boardroom, Bills, Spending, PeaceScore, StressRadar, Approvals, Reserves, Subscriptions, Tax) | 14 (CashTiming, Receivables, Scenario, Budget, Reconciliation, Automations, Docs, Proof, Settings, CashAllocator, DebtCredit, FinancialBoundary, HouseholdMoney, InvestmentOffice+) | 24 |
| Concierge | 7 (Overview, Boardroom, Appointments, School, Upcoming, LifeAdmin, Travel) | 14 (Errands, Events, Grocery, Household, HouseholdCmd, Family, FamilyCalendar, MonthGrid, Recurring, ServiceProviders, Workflows, Proof, Files, Settings) | 21 |
| Files | 2 (Overview, Settings) | 6 (All, Search, Sensitive, Processing, Review, MemoryReview) | 8 |
| **Total** | **29** | **45** | **74** |

## Plan: 6 Phases

---

### Phase 1 — Business Legacy Migration (11 pages)
Migrate all remaining Business pages from `SitaCard`/`SitaPageHeader` to the new card family + `SplitWorkspace` + `ModuleAdvisorInsight` + micro-interactions + `PremiumEmptyState`.

| Page | Card Pattern | Detail |
|------|-------------|--------|
| `LeadsInbox.tsx` | QueueCard (lead pipeline) + SlidePanel (lead detail) | Lead stages, follow-up status, quality scoring |
| `OpportunitiesCenter.tsx` | SplitWorkspace + HeroCard (pipeline value) + QueueCard | Deal stages, probability, linked quotes |
| `ProposalsContracts.tsx` | ActionCard (approve/send) + TimelineCard (versions) | Builder/editor with status tracking |
| `CustomersPage.tsx` | Already has SplitWorkspace — add ModuleAdvisorInsight | CRM advisor wiring |
| `AutopilotHub.tsx` | StatusCard (automations) + ActionCard (controls) | Automation list with trust state |
| `BusinessDocuments.tsx` | QueueCard (documents) + SplitWorkspace | Domain-linked file grouping |
| `BusinessProof.tsx` | ProofCard + TimelineCard (proof chain) | Inspectable receipts |
| `RevenueAutopilot.tsx` | HeroCard (revenue metrics) + StatusCard | Revenue automation dashboard |
| `RevenueForecast.tsx` | HeroCard (forecast) + ComparisonCard (scenarios) | Projection with confidence |
| `RevenueImpactDashboard.tsx` | SummaryCard + StatusCard | Impact metrics |
| `PlaybookBuilder.tsx` | ActionCard + TimelineCard | Playbook steps and templates |

Each page gets: `PageTruthBanner`, `ModuleAdvisorInsight` with domain-specific advisor, `.micro-hover-lift` / `.micro-press` classes, `PremiumEmptyState` for empty/first-use.

---

### Phase 2 — Money Legacy Migration (14 pages)
Migrate all remaining Money pages.

| Page | Card Pattern |
|------|-------------|
| `CashTiming.tsx` | HeroCard (cash position) + TimelineCard (flow timeline) |
| `ReceivablesObligations.tsx` | SplitWorkspace + QueueCard (incoming/outgoing) |
| `ScenarioPlanner.tsx` | ComparisonCard (what-if) + HeroCard (active scenario) |
| `BudgetEnvelopeOffice.tsx` | StatusCard (envelopes) + ActionCard (allocate) |
| `ReconciliationReview.tsx` | QueueCard (mismatches) + ActionCard (resolve) |
| `FinanceAutomations.tsx` | StatusCard + ActionCard (rule controls) |
| `MoneyDocuments.tsx` | QueueCard (documents) + SplitWorkspace |
| `MoneyProof.tsx` | ProofCard + TimelineCard |
| `MoneySettings.tsx` | SummaryCard (config sections) |
| `CashAllocator.tsx` | HeroCard + ActionCard |
| `DebtCreditOffice.tsx` | QueueCard (debts) + StatusCard |
| `FinancialBoundaryMonitor.tsx` | StatusCard (boundaries) + AdvisorCard |
| `HouseholdMoneyOffice.tsx` | SummaryCard + QueueCard |
| Other remaining (NetWorth, OpportunityCost, TransactionIntelligence, TrustGraph, MoneyModes, MoneyRituals, LifeMoneyEngine, MoneyAdvisorBoard, MoneyBoardroom) | Pattern-appropriate cards |

---

### Phase 3 — Concierge Legacy Migration (14 pages)
Migrate all remaining Concierge pages with warm, supportive atmosphere.

| Page | Card Pattern |
|------|-------------|
| `ErrandsLogistics.tsx` | QueueCard (grouped errands) + TimelineCard (route) |
| `EventsGifts.tsx` | ActionCard (prep actions) + TimelineCard (upcoming) |
| `GroceryPlanning.tsx` | QueueCard (lists) + StatusCard (replenishment) |
| `HouseholdTasks.tsx` | QueueCard (tasks) + ActionCard (delegate) |
| `HouseholdCommandCenter.tsx` | HeroCard (household status) + SummaryCard |
| `ServiceProviders.tsx` | SplitWorkspace (vendor list/detail) |
| `RecurringObligations.tsx` | QueueCard (obligations) + StatusCard |
| `FamilyCalendar.tsx` | TimelineCard + StatusCard |
| `FamilyBoardroom.tsx` | AdvisorCard + SummaryCard |
| `MonthGridCalendar.tsx` | Keep calendar grid, add HeroCard header |
| `ConciergeWorkflows.tsx` | StatusCard (automations) + ActionCard |
| `ConciergeProof.tsx` | ProofCard + TimelineCard |
| `ConciergeFiles.tsx` | QueueCard (documents) + SplitWorkspace |
| `ConciergeSettings.tsx` | SummaryCard |

---

### Phase 4 — Files Full Migration (6 pages)
Transform Files from generic file table into premium file product.

| Page | Card Pattern |
|------|-------------|
| `FilesAll.tsx` | SplitWorkspace (file list + preview panel) |
| `FilesSearch.tsx` | HeroCard (search) + QueueCard (results) |
| `FilesSensitive.tsx` | StatusCard (sensitivity levels) + ProofCard |
| `FilesProcessing.tsx` | QueueCard (processing queue) + StatusCard |
| `FilesReview.tsx` | QueueCard (review items) + ActionCard (approve/reject) |
| `FilesMemoryReview.tsx` | TimelineCard (memory items) + AdvisorCard |

---

### Phase 5 — Cross-App Workflow Connectors
Create shared infrastructure for seamless cross-tool transitions mentioned in the prompt.

| Deliverable | Detail |
|-------------|--------|
| `CrossAppAction.tsx` component | Inline action chip that navigates cross-domain (e.g., "View in Finance" on an invoice in Business). Uses `useNavigate` + `useAppStatePersistence` to preserve origin state |
| `useLinkedContext` hook | Passes entity context (customer ID, invoice ID) when navigating cross-domain so the target page can auto-select the relevant record |
| Wire into 8 key pages | Business Invoices→Money Receivables, Business CRM→Concierge Appointments, Business Quotes→Business Invoices, Concierge Travel→Files, Finance Bills→Approvals, Collections→Boardroom, Support→CRM customer |

---

### Phase 6 — Universal State Coverage
Ensure every migrated page handles all 6 required states from Part 16.

| State | Implementation |
|-------|---------------|
| First use | `PremiumEmptyState` variant="first-use" with primary action |
| Empty (filtered) | `PremiumEmptyState` variant="no-results" |
| Loading | Skeleton pattern (already exists as `SectionSkeleton`) |
| Degraded | `PageTruthBanner` mode="degraded" (already built) |
| Demo/Preview | `PageTruthBanner` mode="demo" (already built) |
| Live | Normal render with `PageTruthBanner` mode="live" |

Audit all 74 pages and add missing state handlers. Most migrated pages already have `PageTruthBanner` + `PremiumEmptyState`; this phase catches stragglers.

---

## Technical Approach (All Phases)

Every migration follows the same pattern established in CollectionsCommandCenter:

1. Replace `SitaPageHeader` → remove (handled by `DomainAppShell`)
2. Replace `SitaCard` → appropriate card from `@/components/sita/cards` (Hero/Queue/Action/Status/Summary/Timeline/Advisor/Proof/Comparison)
3. Replace `SitaSectionHeader` → native `h2`/`h3` with `SITA_TYPE` classes
4. Add `ModuleAdvisorInsight` with module-specific advisor context
5. Add `.micro-hover-lift` / `.micro-press` to all interactive elements
6. Add `PremiumEmptyState` for empty/first-use states
7. Use `SplitWorkspace` or `SlidePanel` for list→detail patterns
8. Ensure `PageTruthBanner` is present

## Estimated Scope

| Phase | Files | Priority |
|-------|-------|----------|
| 1 | 11 Business pages | Highest — most visible |
| 2 | ~14 Money pages | High |
| 3 | 14 Concierge pages | High |
| 4 | 6 Files pages | Medium |
| 5 | 3 new files + 8 page edits | Medium |
| 6 | Audit pass on all 74 | Final polish |

