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
  { page: "MoneyOnboarding",            subdir: "",                  state: "fully-wired", sources: ["onboarding wizard shell"], bannerState: "live" },
  { page: "MoneyApprovals",             subdir: "",                  state: "fully-wired", sources: ["useApprovalQueue", "approval_requests"], bannerState: "live" },
  { page: "CapitalAllocationPage",      subdir: "",                  state: "fully-wired", sources: ["useCapitalAllocation hooks"], bannerState: "live" },
  { page: "WealthCommandCenter",        subdir: "",                  state: "degraded",    degradedReason: "Cross-account flows / global positions / danger zones source not yet wired; demo fixtures gated behind reality mode until aggregation pipeline is connected.", bannerState: "partial" },

  // ── Money sub-domain ──────────────────────────────────────────
  { page: "BillsWorkspace",             subdir: "money",             state: "fully-wired", sources: ["useBills", "useUpdateBill", "bills table"], bannerState: "live" },
  { page: "BudgetEnvelopeOffice",       subdir: "money",             state: "fully-wired", sources: ["useBudgetEnvelopes", "budget_envelopes table"], bannerState: "live" },
  { page: "CashAllocator",              subdir: "money",             state: "fully-wired", sources: ["useCashAllocator", "useReserves"], bannerState: "live" },
  { page: "CashTiming",                 subdir: "money",             state: "fully-wired", sources: ["useCashTiming", "useUpcomingObligations"], bannerState: "live" },
  { page: "DebtCreditOffice",           subdir: "money",             state: "fully-wired", sources: ["useDebtAccounts", "debt_accounts table"], bannerState: "live" },
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
  { page: "AdvancedMode",               subdir: "investment-office", state: "fully-wired", sources: ["IA descriptor (truth-allow: ia-config)"], bannerState: "live" },
  { page: "AdvisorBoard",               subdir: "investment-office", state: "fully-wired", sources: ["INVESTMENT_ADVISORS", "AdvisorCouncilShell"], bannerState: "live" },
  { page: "BeginnerMode",               subdir: "investment-office", state: "fully-wired", sources: ["WIZARD_STEPS — IA descriptor (truth-allow: ia-config)"], bannerState: "live" },
  { page: "BehavioralFirewall",         subdir: "investment-office", state: "fully-wired", sources: ["useBehavioralFirewall"], bannerState: "live" },
  { page: "CapitalPurpose",             subdir: "investment-office", state: "fully-wired", sources: ["useCapitalPurpose"], bannerState: "live" },
  { page: "CapitalTwin",                subdir: "investment-office", state: "fully-wired", sources: ["useCapitalTwin"], bannerState: "live" },
  { page: "CatalystWarRoom",            subdir: "investment-office", state: "fully-wired", sources: ["useCatalysts"], bannerState: "live" },
  { page: "ConvictionEngine",           subdir: "investment-office", state: "fully-wired", sources: ["useConviction"], bannerState: "live" },
  { page: "CrossAssetStoryEngine",      subdir: "investment-office", state: "fully-wired", sources: ["useCrossAssetStories"], bannerState: "live" },
  { page: "DecisionReadiness",          subdir: "investment-office", state: "fully-wired", sources: ["useDecisionReadiness"], bannerState: "live" },
  { page: "DecisionTheater",            subdir: "investment-office", state: "fully-wired", sources: ["useDecisionTheater"], bannerState: "live" },
  { page: "DisagreementEngine",         subdir: "investment-office", state: "fully-wired", sources: ["useAdvisorDisagreement"], bannerState: "live" },
  { page: "EventMarketsWorkspace",      subdir: "investment-office", state: "fully-wired", sources: ["useEventMarkets"], bannerState: "live" },
  { page: "EventProbabilityLab",        subdir: "investment-office", state: "fully-wired", sources: ["useEventProbabilities"], bannerState: "live" },
  { page: "ExecutionDesk",              subdir: "investment-office", state: "fully-wired", sources: ["useExecutionDesk"], bannerState: "live" },
  { page: "FamilyOffice",               subdir: "investment-office", state: "fully-wired", sources: ["useFamilyOffice"], bannerState: "live" },
  { page: "InstrumentDetail",           subdir: "investment-office", state: "fully-wired", sources: ["useInstrument"], bannerState: "live" },
  { page: "IntelligenceDossier",        subdir: "investment-office", state: "fully-wired", sources: ["useIntelligenceDossier"], bannerState: "live" },
  { page: "InvestmentBoardroom",        subdir: "investment-office", state: "fully-wired", sources: ["useInvestmentBoardroom"], bannerState: "live" },
  { page: "InvestmentConstitution",     subdir: "investment-office", state: "fully-wired", sources: ["useInvestmentConstitution"], bannerState: "live" },
  { page: "InvestmentGate",             subdir: "investment-office", state: "fully-wired", sources: ["useInvestmentGate"], bannerState: "live" },
  { page: "InvestmentReceipts",         subdir: "investment-office", state: "fully-wired", sources: ["ai_action_receipts", "useRealityModeSafe gating"], bannerState: "live" },
  { page: "InvestmentShellPage",        subdir: "investment-office", state: "fully-wired", sources: ["PRIMARY_TABS — IA descriptor (truth-allow: ia-config)"], bannerState: "live" },
  { page: "KnowledgeGraph",             subdir: "investment-office", state: "fully-wired", sources: ["useInvestmentKnowledgeGraph"], bannerState: "live" },
  { page: "MarketExplorer",             subdir: "investment-office", state: "fully-wired", sources: ["useMarketExplorer"], bannerState: "live" },
  { page: "MarketMemoryFeed",           subdir: "investment-office", state: "fully-wired", sources: ["useMarketMemory"], bannerState: "live" },
  { page: "OperatingModes",             subdir: "investment-office", state: "fully-wired", sources: ["IA descriptor (truth-allow: ia-config)"], bannerState: "live" },
  { page: "OpportunityMap",             subdir: "investment-office", state: "fully-wired", sources: ["useOpportunityMap"], bannerState: "live" },
  { page: "PlatformConnections",        subdir: "investment-office", state: "fully-wired", sources: ["useInvestmentConnections"], bannerState: "live" },
  { page: "PortfolioOffice",            subdir: "investment-office", state: "fully-wired", sources: ["usePortfolio"], bannerState: "live" },
  { page: "PositionSizingCoach",        subdir: "investment-office", state: "fully-wired", sources: ["usePositionSizing"], bannerState: "live" },
  { page: "PostTradeLoop",              subdir: "investment-office", state: "fully-wired", sources: ["usePostTradeLoop"], bannerState: "live" },
  { page: "ResearchLibrary",            subdir: "investment-office", state: "fully-wired", sources: ["useResearchLibrary"], bannerState: "live" },
  { page: "RiskOffice",                 subdir: "investment-office", state: "fully-wired", sources: ["useRiskOffice"], bannerState: "live" },
  { page: "StrategyDNA",                subdir: "investment-office", state: "fully-wired", sources: ["useStrategyDNA"], bannerState: "live" },
  { page: "StrategyStudio",             subdir: "investment-office", state: "fully-wired", sources: ["useStrategyStudio"], bannerState: "live" },
  { page: "ThesisJournal",              subdir: "investment-office", state: "fully-wired", sources: ["useThesisJournal"], bannerState: "live" },
  { page: "TimeMachineReview",          subdir: "investment-office", state: "fully-wired", sources: ["useTimeMachineReview"], bannerState: "live" },
  { page: "TradingFloor",               subdir: "investment-office", state: "degraded",    degradedReason: "Sector-rotation source not yet wired; SECTORS list is a presentational sample until live sector data is connected.", bannerState: "partial" },
  { page: "WarRoom",                    subdir: "investment-office", state: "degraded",    degradedReason: "Crisis-event ledger source not yet wired; CRISIS_EVENTS list is a presentational sample until crisis-pipeline is connected.", bannerState: "partial" },
  { page: "WatchlistsSignals",          subdir: "investment-office", state: "fully-wired", sources: ["useWatchlists"], bannerState: "live" },
  { page: "WhatWouldBreak",             subdir: "investment-office", state: "fully-wired", sources: ["useWhatWouldBreak"], bannerState: "live" },
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