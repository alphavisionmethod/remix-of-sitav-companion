// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Production-Truth Manifest
//
// Single source of truth for the production state of every Finance
// page. Mirrors src/modules/business/PRODUCTION_TRUTH_MANIFEST.ts
// and src/modules/concierge/PRODUCTION_TRUTH_MANIFEST.ts in shape
// and semantics so the audit checker can reuse the same rules.
//
// Used by:
//   - scripts/architecture/check-finance-truth.ts (CI guardrail)
//   - src/__tests__/finance/finance-page-state-grammar.test.ts
//   - PageTruthBanner default state per page
//
// Every page in `src/modules/finance/pages/**/*.tsx` MUST appear
// here in exactly one of three states:
//
//   "fully-wired"   — uses canonical hooks/services, real data
//                     sources, loading/error/empty states, no
//                     hardcoded fixtures leaking into production.
//
//   "degraded"      — visible but explicitly partial: shows a
//                     setup, "connect-an-integration", or honest
//                     empty-state UI when the underlying capability
//                     isn't yet provisioned. Truth banner reflects
//                     "partial".
//
//   "hidden"        — not exposed in the main IA. Either route-
//                     guarded behind labs/admin or removed from
//                     navigation. The file may still exist.
//
// Adding a new page? Add it here in the same commit.
// ═══════════════════════════════════════════════════════════════

export type TruthState = "fully-wired" | "degraded" | "hidden";

export interface PageTruthEntry {
  /** File stem under src/modules/finance/pages/{root|money|investment-office}/ (no .tsx). */
  page: string;
  /** Subdir under pages/ — "" for top-level, "money", or "investment-office". */
  subdir: "" | "money" | "investment-office";
  /** Final truth classification. */
  state: TruthState;
  /** Canonical data sources (hooks/services/tables). Required when state === "fully-wired". */
  sources?: ReadonlyArray<string>;
  /** Honest reason for "degraded" state — surfaced in the truth banner. */
  degradedReason?: string;
  /** Reason for "hidden" — explains why removed from main IA. */
  hiddenReason?: string;
  /** Default truth-banner state for the page. */
  bannerState?: "live" | "demo" | "partial" | "degraded" | "connecting";
}

export const FINANCE_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  // ── Top-level shells ──────────────────────────────────────────
  { page: "MoneyCenter",                subdir: "",                  state: "fully-wired", sources: ["routing shim → desktop window"], bannerState: "live" },
  { page: "MoneyOverview",              subdir: "",                  state: "fully-wired", sources: ["useMoneyOverview", "PremiumEmptyState"], bannerState: "live" },
  { page: "MoneyOnboarding",            subdir: "",                  state: "degraded",    degradedReason: "Onboarding shell — delegates to MoneyOnboardingFlow which carries its own internal state machine; no data wiring at this surface.", bannerState: "partial" },
  { page: "MoneyApprovals",             subdir: "",                  state: "fully-wired", sources: ["useApprovalQueue", "approval_requests"], bannerState: "live" },
  { page: "CapitalAllocationPage",      subdir: "",                  state: "fully-wired", sources: ["useCapitalAllocation hooks"], bannerState: "live" },
  { page: "WealthCommandCenter",        subdir: "",                  state: "degraded",    degradedReason: "Cross-account flows / global positions / danger zones source not yet wired; demo fixtures gated behind reality mode until aggregation pipeline is connected.", bannerState: "partial" },

  // ── Money sub-domain ──────────────────────────────────────────
  { page: "BillsWorkspace",             subdir: "money",             state: "fully-wired", sources: ["useBills", "useUpdateBill", "bills table"], bannerState: "live" },
  { page: "BudgetEnvelopeOffice",       subdir: "money",             state: "fully-wired", sources: ["useBudgetEnvelopes", "budget_envelopes table"], bannerState: "live" },
  { page: "CashAllocator",              subdir: "money",             state: "fully-wired", sources: ["useCashAllocator", "useReserves"], bannerState: "live" },
  { page: "CashTiming",                 subdir: "money",             state: "fully-wired", sources: ["useCashTiming", "useUpcomingObligations"], bannerState: "live" },
  { page: "DebtCreditOffice",           subdir: "money",             state: "degraded",    degradedReason: "Debt-account source not yet wired; ACCOUNTS list is a presentational sample until debt accounts hook is connected.", bannerState: "partial" },
  { page: "FinanceAutomations",         subdir: "money",             state: "degraded",    degradedReason: "Automations registry not yet wired; AUTOMATIONS list is presentational sample until rules engine is connected.", bannerState: "partial" },
  { page: "FinanceBoardroom",           subdir: "money",             state: "fully-wired", sources: ["DomainAdvisorBoard", "AITruthDisclosure"], bannerState: "live" },
  { page: "FinancialBoundaryMonitor",   subdir: "money",             state: "degraded",    degradedReason: "Boundary monitor source not yet wired; renders honest empty state until thresholds + observation pipeline are connected.", bannerState: "partial" },
  { page: "FinancialHealthPulse",       subdir: "money",             state: "fully-wired", sources: ["useFinancialHealth", "money_health_metrics"], bannerState: "live" },
  { page: "HouseholdMoneyOffice",       subdir: "money",             state: "degraded",    degradedReason: "Household finance summary not yet wired; HOUSEHOLD object is a presentational sample until household-money source is connected.", bannerState: "partial" },
  { page: "InvestmentOffice",           subdir: "money",             state: "fully-wired", sources: ["useInvestmentOfficeData"], bannerState: "live" },
  { page: "LifeMoneyEngine",            subdir: "money",             state: "degraded",    degradedReason: "Life-event registry is a presentational catalogue (LIFE_EVENTS) until event store + projections are wired.", bannerState: "partial" },
  { page: "MoneyAdvisorBoard",          subdir: "money",             state: "degraded",    degradedReason: "Money advisor board council pipeline not yet wired into this surface; renders setup-required state until council outputs are emitted.", bannerState: "partial" },
  { page: "MoneyBoardroom",             subdir: "money",             state: "fully-wired", sources: ["DomainAdvisorBoard"], bannerState: "live" },
  { page: "MoneyDocuments",             subdir: "money",             state: "fully-wired", sources: ["useMoneyDocuments", "files namespace"], bannerState: "live" },
  { page: "MoneyModes",                 subdir: "money",             state: "fully-wired", sources: ["MODES — IA descriptor (truth-allow: ia-config)"], bannerState: "live" },
  { page: "MoneyProof",                 subdir: "money",             state: "fully-wired", sources: ["ai_action_receipts", "ReceiptViewer"], bannerState: "live" },
  { page: "MoneyRituals",               subdir: "money",             state: "degraded",    degradedReason: "Ritual cadence engine not yet wired; renders honest empty state until ritual scheduler is connected.", bannerState: "partial" },
  { page: "MoneySettings",              subdir: "money",             state: "fully-wired", sources: ["useMoneySettings", "money_settings"], bannerState: "live" },
  { page: "NetWorthOffice",             subdir: "money",             state: "fully-wired", sources: ["useNetWorth", "net_worth_snapshots"], bannerState: "live" },
  { page: "OpportunityCost",            subdir: "money",             state: "degraded",    degradedReason: "Opportunity-cost engine not yet wired; renders honest empty state until comparative scenario engine is connected.", bannerState: "partial" },
  { page: "PeaceScore",                 subdir: "money",             state: "fully-wired", sources: ["useMoneyHealthScore"], bannerState: "live" },
  { page: "ReceivablesObligations",     subdir: "money",             state: "degraded",    degradedReason: "Receivables/obligations source not yet wired; demo fixtures gated behind reality mode until invoices + obligations pipelines are connected.", bannerState: "partial" },
  { page: "ReconciliationReview",       subdir: "money",             state: "degraded",    degradedReason: "Reconciliation queue source not yet wired; ITEMS is a presentational sample until reconciliation engine is connected.", bannerState: "partial" },
  { page: "ReservesSavings",            subdir: "money",             state: "fully-wired", sources: ["useReserves", "reserves table"], bannerState: "live" },
  { page: "ScenarioPlanner",            subdir: "money",             state: "fully-wired", sources: ["useScenarios"], bannerState: "live" },
  { page: "SpendingPulse",              subdir: "money",             state: "degraded",    degradedReason: "Spending categorization & recurring detection not yet wired; CATEGORIES/RECURRING are presentational samples until transaction enrichment is connected.", bannerState: "partial" },
  { page: "StressRadar",                subdir: "money",             state: "fully-wired", sources: ["useStressRadar"], bannerState: "live" },
  { page: "SubscriptionsWaste",         subdir: "money",             state: "fully-wired", sources: ["useSubscriptions"], bannerState: "live" },
  { page: "TaxEstimator",               subdir: "money",             state: "fully-wired", sources: ["useTaxEstimate"], bannerState: "live" },
  { page: "TransactionIntelligence",    subdir: "money",             state: "degraded",    degradedReason: "Transaction intelligence pipeline not yet wired; TXS list is a presentational sample until enrichment + classification engine is connected.", bannerState: "partial" },
  { page: "TrustGraph",                 subdir: "money",             state: "degraded",    degradedReason: "Trust graph source not yet wired; renders honest empty state until counterparty trust signals are emitted.", bannerState: "partial" },

  // ── Investment Office sub-domain ──────────────────────────────
  { page: "AdvisorBoard",               subdir: "investment-office", state: "fully-wired", sources: ["INVESTMENT_ADVISORS", "AdvisorCouncilShell"], bannerState: "live" },
  { page: "InvestmentReceipts",         subdir: "investment-office", state: "fully-wired", sources: ["ai_action_receipts", "useRealityModeSafe gating"], bannerState: "live" },
  { page: "InvestmentShellPage",        subdir: "investment-office", state: "fully-wired", sources: ["PRIMARY_TABS — IA descriptor (truth-allow: ia-config)"], bannerState: "live" },
  // Investment-office workspaces — many are scaffolds with `([] as any[])`
  // placeholders. Reclassified honestly as `degraded` until the live
  // hooks/services replace the placeholders. PageTruthBanner already
  // surfaces a partial-state banner across all of these.
  { page: "AdvancedMode",               subdir: "investment-office", state: "degraded",    degradedReason: "IA descriptor only — advanced workspace shell pending data wiring.", bannerState: "partial" },
  { page: "BeginnerMode",               subdir: "investment-office", state: "degraded",    degradedReason: "Beginner wizard — WIZARD_STEPS is a static IA descriptor; runtime answers and progression source not yet wired.", bannerState: "partial" },
  { page: "BehavioralFirewall",         subdir: "investment-office", state: "degraded",    degradedReason: "Behavioral firewall observation pipeline not yet wired; renders presentational shell until signals are emitted.", bannerState: "partial" },
  { page: "CapitalPurpose",             subdir: "investment-office", state: "degraded",    degradedReason: "Capital-purpose source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "CapitalTwin",                subdir: "investment-office", state: "degraded",    degradedReason: "Capital twin projection source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "CatalystWarRoom",            subdir: "investment-office", state: "degraded",    degradedReason: "Catalyst feed not yet wired; renders honest empty queue until catalyst-pipeline is connected.", bannerState: "partial" },
  { page: "ConvictionEngine",           subdir: "investment-office", state: "degraded",    degradedReason: "Conviction-engine source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "CrossAssetStoryEngine",      subdir: "investment-office", state: "degraded",    degradedReason: "Cross-asset story source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "DecisionReadiness",          subdir: "investment-office", state: "degraded",    degradedReason: "Decision-readiness source not yet wired; PENDING_DECISIONS is a placeholder sentinel until the decisions service is connected.", bannerState: "partial" },
  { page: "DecisionTheater",            subdir: "investment-office", state: "degraded",    degradedReason: "Decision-theater source not yet wired; advisor-vote map is a placeholder until council outputs stream in.", bannerState: "partial" },
  { page: "DisagreementEngine",         subdir: "investment-office", state: "degraded",    degradedReason: "Disagreement engine source not yet wired; DISAGREEMENTS list is empty until council outputs stream in.", bannerState: "partial" },
  { page: "EventMarketsWorkspace",      subdir: "investment-office", state: "degraded",    degradedReason: "Event-markets source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "EventProbabilityLab",        subdir: "investment-office", state: "degraded",    degradedReason: "Event-probability lab source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "ExecutionDesk",              subdir: "investment-office", state: "degraded",    degradedReason: "Execution desk pipeline not yet wired; status transitions are simulated until the orders service is connected.", bannerState: "partial" },
  { page: "FamilyOffice",               subdir: "investment-office", state: "degraded",    degradedReason: "Family office source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "InstrumentDetail",           subdir: "investment-office", state: "degraded",    degradedReason: "Instrument-detail source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "IntelligenceDossier",        subdir: "investment-office", state: "degraded",    degradedReason: "Dossier source not yet wired; DEPTH_OPTIONS is a static IA descriptor until intelligence pipeline is connected.", bannerState: "partial" },
  { page: "InvestmentBoardroom",        subdir: "investment-office", state: "degraded",    degradedReason: "Investment boardroom council pipeline not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "InvestmentConstitution",     subdir: "investment-office", state: "degraded",    degradedReason: "Constitution rule source not yet wired; CATEGORIES list is empty until rules service is connected.", bannerState: "partial" },
  { page: "InvestmentGate",             subdir: "investment-office", state: "degraded",    degradedReason: "Investment gate evaluation pipeline not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "KnowledgeGraph",             subdir: "investment-office", state: "degraded",    degradedReason: "Knowledge graph source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "MarketExplorer",             subdir: "investment-office", state: "degraded",    degradedReason: "Market explorer source not yet wired; tab descriptors render empty data until market service is connected.", bannerState: "partial" },
  { page: "MarketMemoryFeed",           subdir: "investment-office", state: "degraded",    degradedReason: "Market memory feed source not yet wired; renders honest empty feed until market events stream in.", bannerState: "partial" },
  { page: "OperatingModes",             subdir: "investment-office", state: "degraded",    degradedReason: "Operating-mode catalog source not yet wired; modes are static IA descriptors until activation service is connected.", bannerState: "partial" },
  { page: "OpportunityMap",             subdir: "investment-office", state: "degraded",    degradedReason: "Opportunity themes source not yet wired; THEMES is a sentinel placeholder until opportunity-engine is connected.", bannerState: "partial" },
  { page: "PlatformConnections",        subdir: "investment-office", state: "degraded",    degradedReason: "Platform connection registry not yet wired; STATUS_CONFIG/CATEGORY_TABS are static IA descriptors until connector service is connected.", bannerState: "partial" },
  { page: "PortfolioOffice",            subdir: "investment-office", state: "degraded",    degradedReason: "Portfolio aggregation source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "PositionSizingCoach",        subdir: "investment-office", state: "degraded",    degradedReason: "Position-sizing source not yet wired; SIZING_SCENARIOS is a placeholder sentinel until coaching service is connected.", bannerState: "partial" },
  { page: "PostTradeLoop",              subdir: "investment-office", state: "degraded",    degradedReason: "Post-trade loop source not yet wired; ACTIVE_POSITIONS is a placeholder sentinel until positions service is connected.", bannerState: "partial" },
  { page: "ResearchLibrary",            subdir: "investment-office", state: "degraded",    degradedReason: "Research library source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "RiskOffice",                 subdir: "investment-office", state: "degraded",    degradedReason: "Risk office source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "StrategyDNA",                subdir: "investment-office", state: "degraded",    degradedReason: "Strategy DNA source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "StrategyStudio",             subdir: "investment-office", state: "degraded",    degradedReason: "Strategy studio source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "ThesisJournal",              subdir: "investment-office", state: "degraded",    degradedReason: "Thesis journal source not yet wired; counters render zero until journal service is connected.", bannerState: "partial" },
  { page: "TimeMachineReview",          subdir: "investment-office", state: "degraded",    degradedReason: "Time machine source not yet wired; PAST_DECISIONS is a placeholder sentinel until decision history service is connected.", bannerState: "partial" },
  { page: "TradingFloor",               subdir: "investment-office", state: "degraded",    degradedReason: "Sector-rotation source not yet wired; SECTORS list is a presentational IA descriptor until live sector data is connected.", bannerState: "partial" },
  { page: "WarRoom",                    subdir: "investment-office", state: "degraded",    degradedReason: "Crisis-event ledger source not yet wired; CRISIS_EVENTS list is a presentational IA descriptor until crisis-pipeline is connected.", bannerState: "partial" },
  { page: "WatchlistsSignals",          subdir: "investment-office", state: "degraded",    degradedReason: "Watchlists / signals source not yet wired; renders presentational shell.", bannerState: "partial" },
  { page: "WhatWouldBreak",             subdir: "investment-office", state: "degraded",    degradedReason: "Stress-scenario source not yet wired; TRADES is a placeholder sentinel until risk pipeline is connected.", bannerState: "partial" },
] as const;

// ── Helpers ────────────────────────────────────────────────────

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return FINANCE_TRUTH_MANIFEST.find((e) => e.page === page);
}

export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return FINANCE_TRUTH_MANIFEST.filter((e) => e.state === state);
}

/** Snapshot summary used by the truth report generator. */
export function summarizeManifest() {
  const total = FINANCE_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}