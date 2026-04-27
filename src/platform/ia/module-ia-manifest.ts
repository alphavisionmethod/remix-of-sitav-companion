// ═══════════════════════════════════════════════════════════════
// SITA OS — Module IA Manifest (Phase 1)
// ───────────────────────────────────────────────────────────────
// Single source of truth for every Business / Concierge / Finance
// page's IA metadata. Snapshot of the LIVE state of the three
// app shells (BusinessAppShell, ConciergeAppShell, FinanceAppShell)
// + their route shim families. Each entry is a PageDescriptor.
//
// This manifest is read by:
//   • src/__tests__/ia/page-role-manifest.test.ts
//   • scripts/architecture/checks/check-ia-manifest-coverage.ts
//   • scripts/architecture/checks/check-shell-route-boundary.ts (Phase 5)
//   • scripts/architecture/checks/check-page-naming-grammar.ts   (Phase 7)
//   • scripts/architecture/build-route-nav-truth-map.ts          (Phase 8)
//
// Phases 2 / 3 / 4 update this file as they rename / archive surfaces.
// DO NOT introduce a parallel manifest. Extend this one.
// ═══════════════════════════════════════════════════════════════
import type { PageDescriptor } from "./page-role";

// ─────────────────────────────────────────────────────────────
// BUSINESS — snapshot of BusinessAppShell.tsx PAGE map
//   (Phase 1 baseline; Phase 2 rewrites with cleanup actions)
// ─────────────────────────────────────────────────────────────
export const BUSINESS_IA: readonly PageDescriptor[] = [
  { id: "overview", pillar: "business", role: "overview", label: "Overview", component: "BusinessOverview", route: "/business/overview", sidebarVisible: true, status: "ga" },
  { id: "morning-briefing", pillar: "business", role: "workspace", label: "Morning Brief", component: "MorningBriefing", route: null, sidebarVisible: true, status: "ga", notes: "Sub-tab of overview today; shim added in Phase 2 if promoted." },
  { id: "end-of-day", pillar: "business", role: "workspace", label: "End of Day", component: "EndOfDayClosure", route: null, sidebarVisible: true, status: "ga", notes: "In-shell daily-close ritual; no public deep-link by design." },
  { id: "leads", pillar: "business", role: "workspace", label: "Leads", component: "LeadsInbox", route: "/business/leads", sidebarVisible: true, status: "ga" },
  { id: "customers", pillar: "business", role: "workspace", label: "Customers", component: "CustomersPage", route: "/business/customers", sidebarVisible: true, status: "ga" },
  { id: "follow-through", pillar: "business", role: "workspace", label: "Follow-Through", component: "FollowThroughWorkspace", route: "/business/follow-through", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (FollowThroughCenter → FollowThroughWorkspace). Old class re-exported for backwards compat." },
  { id: "support", pillar: "business", role: "workspace", label: "Support", component: "SupportWorkspace", route: "/business/support", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (CustomerSupportCenter → SupportWorkspace). Old class re-exported for backwards compat." },
  { id: "appointments", pillar: "business", role: "workspace", label: "Appointments", component: "AppointmentsScheduling", route: "/business/appointments", sidebarVisible: true, status: "ga" },
  { id: "operations", pillar: "business", role: "workspace", label: "Operations", component: "BusinessOperations", route: "/business/operations", sidebarVisible: true, status: "ga" },
  { id: "opportunities", pillar: "business", role: "workspace", label: "Opportunities", component: "OpportunitiesWorkspace", route: "/business/opportunities", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (OpportunitiesCenter → OpportunitiesWorkspace). Old class re-exported for backwards compat." },
  { id: "deal-room", pillar: "business", role: "room", label: "Deal Room", component: "DealRoom", route: null, sidebarVisible: true, status: "ga", notes: "Entity-scoped room — opened from a Deal context inside the shell, not deep-linked from the URL bar. Phase 2 evaluates promoting to /business/deal-room/:dealId." },
  { id: "strategic-accounts", pillar: "business", role: "room", label: "Strategic Accounts", component: "StrategicAccountRoom", route: null, sidebarVisible: true, status: "ga", notes: "Entity-scoped room — opened from a Customer/Account context inside the shell, not deep-linked from the URL bar. Phase 2 evaluates promoting to /business/strategic-accounts/:accountId." },
  { id: "relationship-dossier", pillar: "business", role: "internal", label: "Dossier", component: "RelationshipDossier", route: null, sidebarVisible: true, status: "ga" },
  { id: "customer-health", pillar: "business", role: "workspace", label: "Customer Health", component: "CustomerHealthPage", route: "/business/customer-health", sidebarVisible: true, status: "ga" },
  { id: "quotes", pillar: "business", role: "workspace", label: "Quotes", component: "QuotesWorkspace", route: "/business/quotes", sidebarVisible: true, status: "ga" },
  { id: "invoices", pillar: "business", role: "workspace", label: "Invoices", component: "InvoicesCollections", route: "/business/invoices", sidebarVisible: true, status: "ga" },
  { id: "collections", pillar: "business", role: "workspace", label: "Collections", component: "CollectionsWorkspace", route: "/business/collections", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (CollectionsCommandCenter → CollectionsWorkspace). Old class re-exported for backwards compat." },
  { id: "proposals", pillar: "business", role: "workspace", label: "Proposals", component: "ProposalsContracts", route: "/business/proposals", sidebarVisible: true, status: "ga" },
  { id: "revenue-home", pillar: "business", role: "overview", label: "Revenue Home", component: "RevenueOpsHome", route: "/business/revenue", sidebarVisible: true, status: "ga", notes: "Sub-overview for Revenue Ops." },
  { id: "revenue-autopilot", pillar: "business", role: "engine", label: "Revenue Autopilot", component: "RevenueAutopilot", route: "/business/revenue-autopilot", sidebarVisible: true, status: "ga", notes: "Engine surface — live runs/status. Configured by revenue-autopilot-console (control-plane)." },
  { id: "revenue-autopilot-console", pillar: "business", role: "control-plane", label: "Autopilot Console", component: "RevenueAutopilotConsole", route: "/business/revenue-autopilot-console", sidebarVisible: true, status: "ga", notes: "Phase 2 canonical control-plane for the Revenue Autopilot engine. Replaces autopilot-hub.", absorbedSlugs: ["/business/autopilot-hub"] },
  { id: "autopilot-hub", pillar: "business", role: "control-plane", label: "Autopilot Hub (legacy)", component: "RevenueAutopilotConsole", route: null, sidebarVisible: false, status: "legacy", notes: "Legacy slug — sidebar entry removed in Phase 2; page map kept for in-app deep-links; URL redirected by user-redirect-map. Will be removed in Phase 8 once telemetry shows zero hits.", legacyNameAllowed: true, replacedBy: "revenue-autopilot-console" },
  { id: "lead-recovery", pillar: "business", role: "engine", label: "Lead Recovery", component: "LeadRecovery", route: "/business/lead-recovery", sidebarVisible: true, status: "ga" },
  { id: "social", pillar: "business", role: "workspace", label: "Social", component: "SocialCommand", route: "/business/social", sidebarVisible: true, status: "ga" },
  { id: "ecommerce", pillar: "business", role: "workspace", label: "E-Commerce", component: "EcommerceManager", route: "/business/ecommerce", sidebarVisible: true, status: "ga" },
  { id: "website-builder", pillar: "business", role: "workspace", label: "Website", component: "WebsiteBuilder", route: "/business/website-builder", sidebarVisible: true, status: "ga" },
  { id: "advisor-board", pillar: "business", role: "boardroom", label: "Advisor Board", component: "BusinessAdvisorBoardPage", route: null, sidebarVisible: true, status: "ga", notes: "In-shell only today; Phase 2 evaluates promoting to /business/advisor-board." },
  { id: "revenue-impact", pillar: "business", role: "internal", label: "Revenue Impact", component: "RevenueImpactDashboard", route: null, sidebarVisible: false, status: "legacy", notes: "Phase 2 demoted: removed from sidebar and page map; the legacy /business/revenue-impact URL is redirected to /business/revenue (Revenue Home). Phase 3 will surface this as a tab inside RevenueOpsHome.", legacyNameAllowed: true, replacedBy: "revenue-home" },
  { id: "kpi-dashboard", pillar: "business", role: "internal", label: "KPI Dashboard", component: "AdaptiveKPIDashboard", route: null, sidebarVisible: true, status: "ga" },
  { id: "playbook-builder", pillar: "business", role: "workspace", label: "Builder", component: "PlaybookBuilder", route: "/business/playbook-builder", sidebarVisible: true, status: "ga" },
  { id: "revenue-forecast", pillar: "business", role: "workspace", label: "Forecast", component: "RevenueForecast", route: "/business/revenue-forecast", sidebarVisible: true, status: "ga" },
  { id: "communications", pillar: "business", role: "workspace", label: "Comms", component: "CommunicationsWorkspace", route: "/business/communications", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (CommunicationsCenter → CommunicationsWorkspace). Old class re-exported for backwards compat." },
  { id: "documents", pillar: "business", role: "workspace", label: "Documents", component: "BusinessDocuments", route: "/business/documents", sidebarVisible: true, status: "ga" },
  { id: "boardroom", pillar: "business", role: "boardroom", label: "Boardroom", component: "BusinessBoardroom", route: "/business/boardroom", sidebarVisible: true, status: "ga" },
  { id: "proof", pillar: "business", role: "proof", label: "Proof", component: "BusinessProof", route: "/business/proof", sidebarVisible: true, status: "ga" },
  { id: "profile-studio", pillar: "business", role: "internal", label: "Profile Studio", component: "ProfileStudio", route: null, sidebarVisible: true, status: "ga" },
  { id: "business-profile", pillar: "business", role: "internal", label: "Business Profile", component: "BusinessProfileEditor", route: null, sidebarVisible: true, status: "ga" },
  { id: "profile-evolution", pillar: "business", role: "internal", label: "Profile Evolution", component: "ProfileEvolutionPanel", route: null, sidebarVisible: true, status: "ga" },
  { id: "workflow-templates", pillar: "business", role: "internal", label: "Workflow Templates", component: "AdaptiveWorkflowTemplates", route: null, sidebarVisible: true, status: "ga" },
  { id: "boardroom-agenda", pillar: "business", role: "internal", label: "Boardroom Agenda", component: "AdaptiveBoardroomAgenda", route: null, sidebarVisible: true, status: "ga" },
  { id: "business-settings", pillar: "business", role: "settings", label: "Settings", component: "BusinessSettingsPage", route: "/business/settings", sidebarVisible: true, status: "ga" },
  { id: "background-tasks", pillar: "business", role: "internal", label: "Tasks & Syncs", component: "BackgroundTasks", route: null, sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (BackgroundTaskCenter → BackgroundTasks). Old class re-exported for backwards compat." },
  { id: "continuity-report", pillar: "business", role: "proof", label: "Continuity Report", component: "ContinuityReport", route: "/business/continuity-report", sidebarVisible: true, status: "ga" },
  { id: "integrations", pillar: "business", role: "workspace", label: "Integrations", component: "CRMIntegrations", route: "/business/integrations", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (CRMIntegrationHub → CRMIntegrations). Old class re-exported for backwards compat." },
  // ── CRM family ──
  { id: "crm-home", pillar: "business", role: "overview", label: "CRM Home", component: "CRMHome", route: "/business/crm-home", sidebarVisible: true, status: "ga" },
  { id: "crm-contacts", pillar: "business", role: "workspace", label: "Contacts", component: "CRMContacts", route: "/business/crm-contacts", sidebarVisible: true, status: "ga" },
  { id: "crm-companies", pillar: "business", role: "workspace", label: "Companies", component: "CRMCompanies", route: "/business/crm-companies", sidebarVisible: true, status: "ga" },
  { id: "crm-pipeline", pillar: "business", role: "workspace", label: "Pipeline", component: "CRMPipeline", route: "/business/crm-pipeline", sidebarVisible: true, status: "ga" },
  { id: "crm-health", pillar: "business", role: "workspace", label: "Health", component: "CRMHealth", route: "/business/crm-health", sidebarVisible: true, status: "ga" },
  { id: "crm-timeline", pillar: "business", role: "workspace", label: "Timeline", component: "CRMTimeline", route: "/business/crm-timeline", sidebarVisible: true, status: "ga" },
  { id: "crm-communications", pillar: "business", role: "workspace", label: "Comms Queue", component: "CRMCommunications", route: "/business/crm-communications", sidebarVisible: true, status: "ga" },
  { id: "crm-tasks", pillar: "business", role: "workspace", label: "Tasks", component: "CRMTasks", route: "/business/crm-tasks", sidebarVisible: true, status: "ga" },
  { id: "crm-notes", pillar: "business", role: "workspace", label: "Notes", component: "CRMNotes", route: "/business/crm-notes", sidebarVisible: true, status: "ga" },
  { id: "crm-segments", pillar: "business", role: "workspace", label: "Segments", component: "CRMSegments", route: "/business/crm-segments", sidebarVisible: true, status: "ga" },
  { id: "crm-automations", pillar: "business", role: "workspace", label: "Automations", component: "CRMAutomations", route: "/business/crm-automations", sidebarVisible: true, status: "ga" },
  { id: "crm-import", pillar: "business", role: "workspace", label: "Import", component: "CRMImport", route: "/business/crm-import", sidebarVisible: true, status: "ga", notes: "Phase 2 rename complete (CRMImportCenter → CRMImport). Old class re-exported for backwards compat." },
  { id: "crm-duplicates", pillar: "business", role: "workspace", label: "Duplicates", component: "CRMDuplicates", route: "/business/crm-duplicates", sidebarVisible: true, status: "ga" },
  { id: "crm-advisor", pillar: "business", role: "workspace", label: "Advisor", component: "CRMAdvisorPage", route: "/business/crm-advisor", sidebarVisible: true, status: "ga" },
  { id: "crm-fields", pillar: "business", role: "workspace", label: "Fields", component: "CRMCustomFieldsPage", route: "/business/crm-fields", sidebarVisible: true, status: "ga" },
  // ── Adaptive (in-shell) ──
  { id: "adaptive-home", pillar: "business", role: "internal", label: "Adaptive Home", component: "AdaptiveBusinessHome", route: null, sidebarVisible: false, status: "ga" },
];

// ─────────────────────────────────────────────────────────────
// CONCIERGE — snapshot of ConciergeAppShell.tsx PAGE map
//   (Phase 1 baseline; Phase 3 rewrites with archives & renames)
// ─────────────────────────────────────────────────────────────
export const CONCIERGE_IA: readonly PageDescriptor[] = [
  { id: "overview", pillar: "concierge", role: "overview", label: "Overview", component: "ConciergeOverview", route: "/concierge/overview", sidebarVisible: true, status: "ga" },
  { id: "upcoming", pillar: "concierge", role: "workspace", label: "Upcoming", component: "UpcomingNeeds", route: "/concierge/upcoming", sidebarVisible: true, status: "ga" },
  { id: "calendar", pillar: "concierge", role: "workspace", label: "Calendar", component: "MonthGridCalendar", route: "/concierge/calendar", sidebarVisible: true, status: "ga" },
  { id: "life-admin", pillar: "concierge", role: "workspace", label: "Life Admin", component: "LifeAdminCenter", route: "/concierge/life-admin", sidebarVisible: true, status: "legacy", notes: "Phase 3 rename → LifeAdminWorkspace.", legacyNameAllowed: true },
  { id: "errands", pillar: "concierge", role: "workspace", label: "Errands", component: "ErrandsLogistics", route: "/concierge/errands", sidebarVisible: true, status: "ga" },
  { id: "appointments", pillar: "concierge", role: "workspace", label: "Appointments", component: "AppointmentsPrep", route: "/concierge/appointments", sidebarVisible: true, status: "ga" },
  { id: "travel", pillar: "concierge", role: "workspace", label: "Travel", component: "TravelPlanning", route: "/concierge/travel", sidebarVisible: true, status: "ga" },
  { id: "household", pillar: "concierge", role: "workspace", label: "Household", component: "HouseholdCommandCenter", route: "/concierge/household", sidebarVisible: true, status: "legacy", notes: "Phase 3 rename → HouseholdWorkspace.", legacyNameAllowed: true },
  { id: "tasks", pillar: "concierge", role: "workspace", label: "Tasks", component: "HouseholdTasks", route: "/concierge/tasks", sidebarVisible: true, status: "ga" },
  { id: "grocery", pillar: "concierge", role: "workspace", label: "Grocery", component: "GroceryPlanning", route: "/concierge/grocery", sidebarVisible: true, status: "ga" },
  { id: "school", pillar: "concierge", role: "workspace", label: "School", component: "SchoolActivities", route: "/concierge/school", sidebarVisible: true, status: "ga" },
  { id: "providers", pillar: "concierge", role: "workspace", label: "Providers", component: "ServiceProviders", route: "/concierge/providers", sidebarVisible: true, status: "ga" },
  { id: "events", pillar: "concierge", role: "workspace", label: "Events & Gifts", component: "EventsGifts", route: "/concierge/events", sidebarVisible: true, status: "ga" },
  { id: "recurring", pillar: "concierge", role: "workspace", label: "Recurring", component: "RecurringObligations", route: "/concierge/recurring", sidebarVisible: true, status: "ga" },
  { id: "workflows", pillar: "concierge", role: "workspace", label: "Automations", component: "ConciergeWorkflows", route: "/concierge/workflows", sidebarVisible: true, status: "ga" },
  { id: "proof", pillar: "concierge", role: "proof", label: "Proof", component: "ConciergeProof", route: "/concierge/proof", sidebarVisible: true, status: "ga" },
  { id: "files", pillar: "concierge", role: "workspace", label: "Files", component: "ConciergeFiles", route: "/concierge/files", sidebarVisible: true, status: "ga" },
  { id: "boardroom", pillar: "concierge", role: "boardroom", label: "Boardroom", component: "FamilyBoardroom", route: "/concierge/boardroom", sidebarVisible: true, status: "ga", notes: "Canonical = FamilyBoardroom; ConciergeBoardroom is unused (Phase 3 archives)." },
  { id: "settings", pillar: "concierge", role: "settings", label: "Settings", component: "ConciergeSettings", route: "/concierge/settings", sidebarVisible: true, status: "ga" },
];

// ─────────────────────────────────────────────────────────────
// FINANCE — snapshot of FinanceAppShell.tsx PAGE map (Money sub-app)
//   (Phase 1 baseline; Phase 4 rewrites)
// Note: `/investment/*` is its own canonical app surface served by
// route families; not modeled here. Money is the sidebar shell.
// ─────────────────────────────────────────────────────────────
export const FINANCE_IA: readonly PageDescriptor[] = [
  { id: "overview", pillar: "finance", role: "overview", label: "Overview", component: "MoneyOverview", route: "/money/overview", sidebarVisible: true, status: "ga" },
  { id: "spending-pulse", pillar: "finance", role: "workspace", label: "Spending Pulse", component: "SpendingPulse", route: "/money/spending-pulse", sidebarVisible: true, status: "ga" },
  { id: "bills", pillar: "finance", role: "workspace", label: "Bills", component: "BillsWorkspace", route: "/money/bills", sidebarVisible: true, status: "ga" },
  { id: "subscriptions", pillar: "finance", role: "workspace", label: "Subscriptions", component: "SubscriptionsWaste", route: "/money/subscriptions", sidebarVisible: true, status: "ga" },
  { id: "budgets", pillar: "finance", role: "workspace", label: "Budgets", component: "BudgetEnvelopeOffice", route: "/money/budgets", sidebarVisible: true, status: "ga", legacyNameAllowed: true, notes: "Office suffix kept — wealth-management term." },
  { id: "transactions", pillar: "finance", role: "workspace", label: "Transactions", component: "TransactionIntelligence", route: "/money/transactions", sidebarVisible: true, status: "ga" },
  { id: "reconciliation", pillar: "finance", role: "workspace", label: "Reconciliation", component: "ReconciliationReview", route: "/money/reconciliation", sidebarVisible: true, status: "ga" },
  { id: "net-worth", pillar: "finance", role: "workspace", label: "Net Worth", component: "NetWorthOffice", route: "/money/net-worth", sidebarVisible: true, status: "ga", legacyNameAllowed: true, notes: "Office suffix kept — wealth-management term." },
  { id: "debt-credit", pillar: "finance", role: "workspace", label: "Debt & Credit", component: "DebtCreditOffice", route: "/money/debt-credit", sidebarVisible: true, status: "ga", legacyNameAllowed: true },
  { id: "reserves", pillar: "finance", role: "workspace", label: "Reserves", component: "ReservesSavings", route: "/money/reserves", sidebarVisible: true, status: "ga" },
  { id: "investment-office", pillar: "finance", role: "workspace", label: "Investments", component: "InvestmentOffice", route: "/money/investment-office", sidebarVisible: true, status: "ga", legacyNameAllowed: true, notes: "InvestmentOffice (industry term). Distinct from /investment/* canonical app." },
  { id: "tax", pillar: "finance", role: "workspace", label: "Tax", component: "TaxEstimator", route: "/money/tax", sidebarVisible: true, status: "ga" },
  { id: "cash-timing", pillar: "finance", role: "workspace", label: "Cash Timing", component: "CashTiming", route: "/money/cash-timing", sidebarVisible: true, status: "ga" },
  { id: "receivables", pillar: "finance", role: "workspace", label: "Receivables", component: "ReceivablesObligations", route: "/money/receivables", sidebarVisible: true, status: "ga" },
  { id: "allocator", pillar: "finance", role: "workspace", label: "Allocator", component: "CashAllocator", route: "/money/allocator", sidebarVisible: true, status: "ga" },
  { id: "health", pillar: "finance", role: "workspace", label: "Health Pulse", component: "FinancialHealthPulse", route: "/money/health", sidebarVisible: true, status: "ga" },
  { id: "peace-score", pillar: "finance", role: "workspace", label: "Peace Score", component: "PeaceScore", route: "/money/peace-score", sidebarVisible: true, status: "ga" },
  { id: "stress-radar", pillar: "finance", role: "workspace", label: "Stress Radar", component: "StressRadar", route: "/money/stress-radar", sidebarVisible: true, status: "ga" },
  { id: "life-impact", pillar: "finance", role: "engine", label: "Life Impact", component: "LifeMoneyEngine", route: "/money/life-impact", sidebarVisible: true, status: "ga" },
  { id: "trust-graph", pillar: "finance", role: "workspace", label: "Trust Graph", component: "TrustGraph", route: "/money/trust-graph", sidebarVisible: true, status: "ga" },
  { id: "opportunity-cost", pillar: "finance", role: "workspace", label: "Opportunity Cost", component: "OpportunityCost", route: "/money/opportunity-cost", sidebarVisible: true, status: "ga" },
  { id: "modes", pillar: "finance", role: "workspace", label: "Modes", component: "MoneyModes", route: "/money/modes", sidebarVisible: true, status: "ga" },
  { id: "rituals", pillar: "finance", role: "workspace", label: "Rituals", component: "MoneyRituals", route: "/money/rituals", sidebarVisible: true, status: "ga" },
  { id: "boundaries", pillar: "finance", role: "workspace", label: "Boundaries", component: "FinancialBoundaryMonitor", route: "/money/boundaries", sidebarVisible: true, status: "ga" },
  { id: "household", pillar: "finance", role: "workspace", label: "Household", component: "HouseholdMoneyOffice", route: "/money/household", sidebarVisible: true, status: "ga", legacyNameAllowed: true },
  { id: "scenarios", pillar: "finance", role: "workspace", label: "Scenarios", component: "ScenarioPlanner", route: "/money/scenarios", sidebarVisible: true, status: "ga" },
  { id: "advisors", pillar: "finance", role: "boardroom", label: "Advisors", component: "MoneyAdvisorBoard", route: "/money/advisors", sidebarVisible: true, status: "ga" },
  { id: "approvals", pillar: "finance", role: "workspace", label: "Approvals", component: "MoneyApprovals", route: "/money/approvals", sidebarVisible: true, status: "ga" },
  { id: "proof", pillar: "finance", role: "proof", label: "Proof", component: "MoneyProof", route: "/money/proof", sidebarVisible: true, status: "ga" },
  { id: "files", pillar: "finance", role: "workspace", label: "Documents", component: "MoneyDocuments", route: "/money/files", sidebarVisible: true, status: "ga" },
  { id: "boardroom", pillar: "finance", role: "boardroom", label: "Boardroom", component: "MoneyBoardroom", route: "/money/boardroom", sidebarVisible: true, status: "ga" },
  { id: "automations", pillar: "finance", role: "workspace", label: "Automations", component: "FinanceAutomations", route: "/money/automations", sidebarVisible: true, status: "ga" },
  { id: "settings", pillar: "finance", role: "settings", label: "Settings", component: "MoneySettings", route: "/money/settings", sidebarVisible: true, status: "ga" },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** All descriptors across all three pillars. */
export const ALL_IA_DESCRIPTORS: readonly PageDescriptor[] = [
  ...BUSINESS_IA,
  ...CONCIERGE_IA,
  ...FINANCE_IA,
];

/** Lookup by (pillar, id). Returns undefined if not found. */
export function findDescriptor(
  pillar: PageDescriptor["pillar"],
  id: string,
): PageDescriptor | undefined {
  const list =
    pillar === "business" ? BUSINESS_IA :
    pillar === "concierge" ? CONCIERGE_IA :
    FINANCE_IA;
  return list.find((d) => d.id === id);
}

/** All descriptors for one pillar. */
export function descriptorsFor(pillar: PageDescriptor["pillar"]): readonly PageDescriptor[] {
  return pillar === "business" ? BUSINESS_IA : pillar === "concierge" ? CONCIERGE_IA : FINANCE_IA;
}