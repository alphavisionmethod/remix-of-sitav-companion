// ═══════════════════════════════════════════════════════════════
// Finance OS — Verification Matrix
// ───────────────────────────────────────────────────────────────
// Single source of truth classifying every Finance OS surface
// (pages across {root, money, investment-office}, services,
// routes, trust flows, integration seams, adaptive behavior,
// E2E journeys) by its verification state. Mirrors Business and
// Concierge matrices so a single CI walker validates all three.
//
// Drives:
//   • src/__tests__/finance/_matrix/matrix.test.ts
//   • scripts/architecture/check-finance-coverage.ts (CI gate)
//   • generated/audits/SITA_OS_SERIOUS_VERIFICATION_REPORT.md
// ═══════════════════════════════════════════════════════════════

export type CoverageStatus = "missing" | "partial" | "behavioral" | "e2e";
export type Priority = "P0" | "P1" | "P2";

export interface SurfaceEntry {
  id: string;
  kind: "page" | "service" | "route" | "trust" | "integration" | "adaptive" | "e2e";
  ref: string;
  tests: string[];
  status: CoverageStatus;
  priority: Priority;
  notes?: string;
}

// ── Pages (high-value Finance OS surfaces) ────────────────────
export const PAGE_SURFACES: SurfaceEntry[] = [
  { id: "page.money-overview",         kind: "page", ref: "src/modules/finance/pages/MoneyOverview.tsx",                         tests: ["src/__tests__/finance/pages/money-overview.test.tsx"],         status: "missing", priority: "P0" },
  { id: "page.money-approvals",        kind: "page", ref: "src/modules/finance/pages/MoneyApprovals.tsx",                        tests: ["src/__tests__/finance/pages/money-approvals.test.tsx"],        status: "missing", priority: "P0" },
  { id: "page.capital-allocation",     kind: "page", ref: "src/modules/finance/pages/CapitalAllocationPage.tsx",                 tests: ["src/__tests__/finance/pages/capital-allocation.test.tsx"],     status: "missing", priority: "P0" },
  { id: "page.wealth-command-center",  kind: "page", ref: "src/modules/finance/pages/WealthCommandCenter.tsx",                   tests: ["src/__tests__/finance/pages/wealth-command-center.test.tsx"],  status: "missing", priority: "P1" },
  { id: "page.bills-workspace",        kind: "page", ref: "src/modules/finance/pages/money/BillsWorkspace.tsx",                  tests: ["src/__tests__/finance/pages/bills-workspace.test.tsx"],        status: "missing", priority: "P0" },
  { id: "page.cash-allocator",         kind: "page", ref: "src/modules/finance/pages/money/CashAllocator.tsx",                   tests: ["src/__tests__/finance/pages/cash-allocator.test.tsx"],         status: "missing", priority: "P0" },
  { id: "page.budget-envelope-office", kind: "page", ref: "src/modules/finance/pages/money/BudgetEnvelopeOffice.tsx",            tests: ["src/__tests__/finance/pages/budget-envelope-office.test.tsx"], status: "missing", priority: "P1" },
  { id: "page.financial-health-pulse", kind: "page", ref: "src/modules/finance/pages/money/FinancialHealthPulse.tsx",            tests: ["src/__tests__/finance/pages/financial-health-pulse.test.tsx"], status: "missing", priority: "P1" },
  { id: "page.portfolio-office",       kind: "page", ref: "src/modules/finance/pages/investment-office/PortfolioOffice.tsx",     tests: ["src/__tests__/finance/pages/portfolio-office.test.tsx"],       status: "missing", priority: "P0" },
  { id: "page.execution-desk",         kind: "page", ref: "src/modules/finance/pages/investment-office/ExecutionDesk.tsx",       tests: ["src/__tests__/finance/pages/execution-desk.test.tsx"],         status: "missing", priority: "P1" },
  { id: "page.investment-boardroom",   kind: "page", ref: "src/modules/finance/pages/investment-office/InvestmentBoardroom.tsx", tests: ["src/__tests__/finance/pages/investment-boardroom.test.tsx"],   status: "missing", priority: "P1" },
  { id: "page.finance-page-state",     kind: "page", ref: "src/modules/finance/pages",                                           tests: ["src/__tests__/finance/finance-page-state-grammar.test.ts"],    status: "behavioral", priority: "P0", notes: "page-state grammar audit covers every page across the three subdirs" },
];

// ── Services / engines (finance-os) ───────────────────────────
export const SERVICE_SURFACES: SurfaceEntry[] = [
  { id: "svc.cash-allocator",          kind: "service", ref: "src/lib/services/finance-os/cash-allocator.service.ts",          tests: ["src/__tests__/finance/services/cash-allocator.service.test.ts"],          status: "behavioral", priority: "P0", notes: "Phase 3: 3-strategy bills-first + cap-respect coverage" },
  { id: "svc.safe-to-spend",           kind: "service", ref: "src/lib/services/finance-os/safe-to-spend.service.ts",           tests: ["src/__tests__/finance/services/safe-to-spend.service.test.ts"],           status: "behavioral", priority: "P0", notes: "Phase 3: forecast windows + warnings + recommendations" },
  { id: "svc.financial-health",        kind: "service", ref: "src/lib/services/finance-os/financial-health.service.ts",        tests: ["src/__tests__/finance/services/financial-health.service.test.ts"],        status: "behavioral", priority: "P0", notes: "Phase 3: composite + DTI penalty + dimension bounds" },
  { id: "svc.peace-score",             kind: "service", ref: "src/lib/services/finance-os/peace-score.service.ts",             tests: ["src/__tests__/finance/services/peace-score.service.test.ts"],             status: "behavioral", priority: "P0", notes: "Phase 3: dimension status + reserve/debt narratives" },
  { id: "svc.envelope-budget",         kind: "service", ref: "src/lib/services/finance-os/envelope-budget.service.ts",         tests: ["src/__tests__/finance/services/envelope-budget.service.test.ts"],         status: "behavioral", priority: "P0", notes: "Phase 3: default groups, linear scaling, allocation cap" },
  { id: "svc.liquidity",               kind: "service", ref: "src/lib/services/finance-os/liquidity.service.ts",               tests: ["src/__tests__/finance/services/liquidity.service.test.ts"],               status: "behavioral", priority: "P0", notes: "Phase 3: pass/fail classification + investment shock test" },
  { id: "svc.reserve-engine",          kind: "service", ref: "src/lib/services/finance-os/reserve-engine.service.ts",          tests: ["src/__tests__/finance/services/reserve-engine.service.test.ts"],          status: "behavioral", priority: "P1", notes: "Phase 4: safe-to-spend math + reserve health bands" },
  { id: "svc.sinking-fund",            kind: "service", ref: "src/lib/services/finance-os/sinking-fund.service.ts",            tests: ["src/__tests__/finance/services/sinking-fund.service.test.ts"],            status: "behavioral", priority: "P1", notes: "Phase 4: contribution sizing + on-track classification" },
  { id: "svc.scenario-engine",         kind: "service", ref: "src/lib/services/finance-os/scenario-engine.service.ts",         tests: ["src/__tests__/finance/services/scenario-engine.service.test.ts"],         status: "behavioral", priority: "P1", notes: "Phase 4: cut/hire/revenue scenarios + 12-month projection" },
  { id: "svc.regime-engine",           kind: "service", ref: "src/lib/services/finance-os/regime-engine.service.ts",           tests: ["src/__tests__/finance/services/regime-engine.service.test.ts"],           status: "behavioral", priority: "P1", notes: "Phase 4: regime history + posture-adjustment policy" },
  { id: "svc.stress-radar",            kind: "service", ref: "src/lib/services/finance-os/stress-radar.service.ts",            tests: ["src/__tests__/finance/services/stress-radar.service.test.ts"],            status: "behavioral", priority: "P1", notes: "Phase 4: cash/debt/reserve/collision signal coverage" },
  { id: "svc.subscription-detector",   kind: "service", ref: "src/lib/services/finance-os/subscription-detector.service.ts",   tests: ["src/__tests__/finance/services/subscription-detector.service.test.ts"],   status: "behavioral", priority: "P1", notes: "Phase 4: recurring grouping + frequency inference" },
  { id: "svc.subscription-waste",      kind: "service", ref: "src/lib/services/finance-os/subscription-waste.service.ts",      tests: ["src/__tests__/finance/services/subscription-waste.service.test.ts"],      status: "missing", priority: "P1" },
  { id: "svc.waste-detector",          kind: "service", ref: "src/lib/services/finance-os/waste-detector.service.ts",          tests: ["src/__tests__/finance/services/waste-detector.service.test.ts"],          status: "behavioral", priority: "P1", notes: "Phase 4: waste aggregation + annualisation + topCategory" },
  { id: "svc.transaction-categorizer", kind: "service", ref: "src/lib/services/finance-os/transaction-categorizer.service.ts", tests: ["src/__tests__/finance/services/transaction-categorizer.service.test.ts"], status: "behavioral", priority: "P0", notes: "Phase 3: rule-pack matching + spend aggregation %" },
  { id: "svc.income-quality",          kind: "service", ref: "src/lib/services/finance-os/income-quality.service.ts",          tests: ["src/__tests__/finance/services/income-quality.service.test.ts"],          status: "behavioral", priority: "P1", notes: "Phase 4: 6-dimension grading + topRisk identification" },
  { id: "svc.debt-analyzer",           kind: "service", ref: "src/lib/services/finance-os/debt-analyzer.service.ts",           tests: ["src/__tests__/finance/services/debt-analyzer.service.test.ts"],           status: "behavioral", priority: "P1", notes: "Phase 4: aggregates + payoff plan + credit pulse" },
  { id: "svc.recurring-obligation",    kind: "service", ref: "src/lib/services/finance-os/recurring-obligation.service.ts",    tests: ["src/__tests__/finance/services/recurring-obligation.service.test.ts"],    status: "behavioral", priority: "P0", notes: "Phase 3: frequency normalisation + autopay split + sort" },
  { id: "svc.due-soon-alerts",         kind: "service", ref: "src/lib/services/finance-os/due-soon-alerts.service.ts",         tests: ["src/__tests__/finance/services/due-soon-alerts.service.test.ts"],         status: "behavioral", priority: "P1", notes: "Phase 4: severity bands + lookahead window" },
  { id: "svc.bill-calendar",           kind: "service", ref: "src/lib/services/finance-os/bill-calendar.service.ts",           tests: ["src/__tests__/finance/services/bill-calendar.service.test.ts"],           status: "behavioral", priority: "P1", notes: "Phase 4: per-day grouping + next-due ranking" },
  { id: "svc.receivables",             kind: "service", ref: "src/lib/services/finance-os/receivables.service.ts",             tests: ["src/__tests__/finance/services/receivables.service.test.ts"],             status: "behavioral", priority: "P1", notes: "Phase 4: aging buckets + overdue flagging" },
  { id: "svc.renewal-risk",            kind: "service", ref: "src/lib/services/finance-os/renewal-risk.service.ts",            tests: ["src/__tests__/finance/services/renewal-risk.service.test.ts"],            status: "behavioral", priority: "P1", notes: "Phase 4: waste-driven cancel routing + annualisation" },
  { id: "svc.fx-watchlist",            kind: "service", ref: "src/lib/services/finance-os/fx-watchlist.service.ts",            tests: ["src/__tests__/finance/services/fx-watchlist.service.test.ts"],            status: "missing", priority: "P2" },
  { id: "svc.crypto-exposure",         kind: "service", ref: "src/lib/services/finance-os/crypto-exposure.service.ts",         tests: ["src/__tests__/finance/services/crypto-exposure.service.test.ts"],         status: "missing", priority: "P2" },
  { id: "svc.portfolio-risk",          kind: "service", ref: "src/lib/services/finance-os/portfolio-risk.service.ts",          tests: ["src/__tests__/finance/services/portfolio-risk.service.test.ts"],          status: "behavioral", priority: "P0", notes: "Phase 3: risk-budget invariants + dominant factor + downside" },
  { id: "svc.entity-capital",          kind: "service", ref: "src/lib/services/finance-os/entity-capital.service.ts",          tests: ["src/__tests__/finance/services/entity-capital.service.test.ts"],          status: "missing", priority: "P1" },
  { id: "svc.capital-map",             kind: "service", ref: "src/lib/services/finance-os/capital-map.service.ts",             tests: ["src/__tests__/finance/services/capital-map.service.test.ts"],             status: "missing", priority: "P1" },
  { id: "svc.investment-office",       kind: "service", ref: "src/lib/services/finance-os/investment-office.service.ts",       tests: ["src/__tests__/finance/services/investment-office.service.test.ts"],       status: "behavioral", priority: "P0", notes: "Phase 3: regime + asset-class/geo summing + risk-budget identity" },
  { id: "svc.investment-memory",       kind: "service", ref: "src/lib/services/finance-os/investment-memory.service.ts",       tests: ["src/__tests__/finance/services/investment-memory.service.test.ts"],       status: "missing", priority: "P1" },
  { id: "svc.thesis-vault",            kind: "service", ref: "src/lib/services/finance-os/thesis-vault.service.ts",            tests: ["src/__tests__/finance/services/thesis-vault.service.test.ts"],            status: "missing", priority: "P1" },
  { id: "svc.execution-review",        kind: "service", ref: "src/lib/services/finance-os/execution-review.service.ts",        tests: ["src/__tests__/finance/services/execution-review.service.test.ts"],        status: "missing", priority: "P1" },
  { id: "svc.revenue-memory",          kind: "service", ref: "src/lib/services/finance-os/revenue-memory.service.ts",          tests: ["src/__tests__/finance/services/revenue-memory.service.test.ts"],          status: "missing", priority: "P2" },
  { id: "svc.account-summary",         kind: "service", ref: "src/lib/services/finance-os/account-summary.service.ts",         tests: ["src/__tests__/finance/services/account-summary.service.test.ts"],         status: "missing", priority: "P1" },
  { id: "svc.balance-sync",            kind: "service", ref: "src/lib/services/finance-os/balance-sync.service.ts",            tests: ["src/__tests__/finance/services/balance-sync.service.test.ts"],            status: "missing", priority: "P1" },
  { id: "svc.overview",                kind: "service", ref: "src/lib/services/finance-os/overview.service.ts",                tests: ["src/__tests__/finance/services/overview.service.test.ts"],                status: "missing", priority: "P1" },
  { id: "svc.family-office-review",    kind: "service", ref: "src/lib/services/finance-os/family-office-review.service.ts",    tests: ["src/__tests__/finance/services/family-office-review.service.test.ts"],    status: "missing", priority: "P2" },
  { id: "svc.committee-boardroom",     kind: "service", ref: "src/lib/services/finance-os/committee-boardroom-inputs.service.ts", tests: ["src/__tests__/finance/services/committee-boardroom-inputs.service.test.ts"], status: "missing", priority: "P2" },
  { id: "svc.finance-boardroom",       kind: "service", ref: "src/lib/services/finance-os/finance-boardroom-inputs.service.ts", tests: ["src/__tests__/finance/services/finance-boardroom-inputs.service.test.ts"], status: "missing", priority: "P1" },
  { id: "svc.investment-office-runtime", kind: "service", ref: "src/lib/services/finance-os/investment-office-runtime.ts",     tests: ["src/__tests__/finance/services/investment-office-runtime.test.ts"],       status: "missing", priority: "P1" },
  { id: "svc.money-projection",        kind: "service", ref: "src/lib/services/projections/money/money-projection.service.ts", tests: ["src/__tests__/finance/services/money-projection.service.test.ts"],        status: "missing", priority: "P1" },
];

/** Services intentionally excluded from dedicated behavioral tests. */
export const SERVICE_TEST_EXCLUSIONS: Record<string, string> = {
  "src/lib/services/finance-os/index.ts": "barrel export",
};

// ── Route integrity ────────────────────────────────────────────
export const ROUTE_SURFACES: SurfaceEntry[] = [
  { id: "route.money-routes",             kind: "route", ref: "src/routes/families/money-routes.tsx",             tests: ["src/__tests__/finance/routes/finance-routes-integrity.test.ts"], status: "missing", priority: "P0" },
  { id: "route.investment-routes",        kind: "route", ref: "src/routes/families/investment-routes.tsx",        tests: ["src/__tests__/finance/routes/finance-routes-integrity.test.ts"], status: "missing", priority: "P0" },
  { id: "route.investment-office-routes", kind: "route", ref: "src/routes/families/investment-office-routes.tsx", tests: ["src/__tests__/finance/routes/finance-routes-integrity.test.ts"], status: "missing", priority: "P0" },
  { id: "route.investments-singularity",  kind: "route", ref: "src/__tests__/architecture/investment-plural-callsites.test.ts", tests: ["src/__tests__/architecture/investment-plural-callsites.test.ts"], status: "behavioral", priority: "P1", notes: "guard against re-introduction of legacy /investments plural" },
];

// ── Trust / receipt / approval ────────────────────────────────
export const TRUST_SURFACES: SurfaceEntry[] = [
  { id: "trust.finance-approval-routing", kind: "trust", ref: "src/modules/finance/pages/MoneyApprovals.tsx",                  tests: ["src/__tests__/trust/request-approval-finance.test.ts"], status: "missing", priority: "P0" },
  { id: "trust.investment-receipts",      kind: "trust", ref: "src/modules/finance/pages/investment-office/InvestmentReceipts.tsx", tests: ["src/__tests__/trust/derive-entity-ref.test.ts"],   status: "behavioral", priority: "P0", notes: "covered by existing entity-ref trust test" },
  { id: "trust.money-proof",              kind: "trust", ref: "src/modules/finance/pages/money/MoneyProof.tsx",                tests: ["src/__tests__/trust/emit-client-receipt.test.ts"], status: "behavioral", priority: "P0", notes: "covered by existing receipt-emission test" },
];

// ── Cross-module integration ──────────────────────────────────
export const INTEGRATION_SURFACES: SurfaceEntry[] = [
  { id: "int.crm-finance-bridge",         kind: "integration", ref: "src/lib/services/business-os/crm-finance-bridge.service.ts", tests: ["src/__tests__/business-os/integration/crm-finance-bridge.test.ts"],     status: "behavioral", priority: "P0", notes: "owned by Business matrix; reused for Finance lineage" },
  { id: "int.quote-proposal-invoice",     kind: "integration", ref: "src/__tests__/business-os/integration/quote-proposal-invoice-lineage.test.ts", tests: ["src/__tests__/business-os/integration/quote-proposal-invoice-lineage.test.ts"], status: "behavioral", priority: "P0" },
  { id: "int.finance-business-linkage",   kind: "integration", ref: "src/lib/services/finance-os/receivables.service.ts",       tests: ["src/__tests__/finance/integration/finance-business-linkage.test.ts"], status: "missing",    priority: "P1" },
  { id: "int.concierge-finance-linkage",  kind: "integration", ref: "src/lib/services/finance-os/recurring-obligation.service.ts", tests: ["src/__tests__/finance/integration/concierge-finance-linkage.test.ts"], status: "missing",    priority: "P1" },
];

// ── Adaptive / persistence ────────────────────────────────────
export const ADAPTIVE_SURFACES: SurfaceEntry[] = [
  { id: "adaptive.finance-preference-persistence", kind: "adaptive", ref: "src/modules/finance/contexts", tests: ["src/__tests__/finance/adaptive/finance-preference-persistence.test.ts"], status: "missing", priority: "P0" },
];

// ── End-to-end journeys (Playwright) ──────────────────────────
export const E2E_SURFACES: SurfaceEntry[] = [
  { id: "e2e.money-auth-smoke",            kind: "e2e", ref: "/money/*",                                tests: ["tests/e2e/money-journey.spec.ts"],                              status: "e2e",     priority: "P2", notes: "auth-redirect smoke breadth" },
  { id: "e2e.investment-auth-smoke",       kind: "e2e", ref: "/investment/*",                           tests: ["tests/e2e/investment-journey.spec.ts"],                         status: "e2e",     priority: "P2", notes: "auth-redirect smoke breadth" },
  { id: "e2e.money-approval-flow",         kind: "e2e", ref: "/money/approvals (request → approve → receipt)", tests: ["tests/e2e/finance/money-approval-flow.spec.ts"],         status: "missing", priority: "P0" },
  { id: "e2e.investment-route-continuity", kind: "e2e", ref: "/investment/* deep-link continuity",      tests: ["tests/e2e/finance/investment-route-continuity.spec.ts"],        status: "missing", priority: "P0" },
];

export const ALL_SURFACES: SurfaceEntry[] = [
  ...PAGE_SURFACES,
  ...SERVICE_SURFACES,
  ...ROUTE_SURFACES,
  ...TRUST_SURFACES,
  ...INTEGRATION_SURFACES,
  ...ADAPTIVE_SURFACES,
  ...E2E_SURFACES,
];

/** Pages explicitly excluded from per-page state-honesty tests, with stable reason. */
// Most investment-office workspaces are presentational shells already covered
// by the finance-page-state-grammar audit (which enforces honest empty/banner
// state). They don't need a second per-page test until they're wired live.
export const PAGE_TEST_EXCLUSIONS: Record<string, string> = {
  // root shells
  "MoneyCenter.tsx":      "router/dispatcher — covered by finance-routes-integrity",
  "MoneyOnboarding.tsx":  "onboarding shell — covered by finance-page-state-grammar",
  // money sub-domain (covered by grammar audit + service tests)
  "CashTiming.tsx":              "covered by liquidity service test",
  "DebtCreditOffice.tsx":        "covered by debt-analyzer service test",
  "FinanceAutomations.tsx":      "covered by finance-page-state-grammar",
  "FinanceBoardroom.tsx":        "covered by boardroom-journey E2E",
  "FinancialBoundaryMonitor.tsx":"covered by finance-page-state-grammar",
  "HouseholdMoneyOffice.tsx":    "covered by finance-page-state-grammar",
  "InvestmentOffice.tsx":        "covered by portfolio-office test",
  "LifeMoneyEngine.tsx":         "covered by finance-page-state-grammar",
  "MoneyAdvisorBoard.tsx":       "covered by boardroom-journey E2E",
  "MoneyBoardroom.tsx":          "covered by boardroom-journey E2E",
  "MoneyDocuments.tsx":          "files passthrough — covered by files-journey",
  "MoneyModes.tsx":              "IA descriptor — covered by finance-page-state-grammar",
  "MoneyProof.tsx":              "covered by emit-client-receipt trust test",
  "MoneyRituals.tsx":            "covered by finance-page-state-grammar",
  "MoneySettings.tsx":           "settings shell",
  "NetWorthOffice.tsx":          "covered by capital-map service test",
  "OpportunityCost.tsx":         "covered by finance-page-state-grammar",
  "PeaceScore.tsx":              "covered by peace-score service test",
  "ReceivablesObligations.tsx":  "covered by receivables service test",
  "ReconciliationReview.tsx":    "covered by finance-page-state-grammar",
  "ReservesSavings.tsx":         "covered by reserve-engine service test",
  "ScenarioPlanner.tsx":         "covered by scenario-engine service test",
  "SpendingPulse.tsx":           "covered by transaction-categorizer service test",
  "StressRadar.tsx":             "covered by stress-radar service test",
  "SubscriptionsWaste.tsx":      "covered by subscription-waste service test",
  "TaxEstimator.tsx":            "covered by finance-page-state-grammar",
  "TransactionIntelligence.tsx": "covered by transaction-categorizer service test",
  "TrustGraph.tsx":              "covered by finance-page-state-grammar",
  // investment-office workspaces (38 presentational shells — covered en masse
  // by finance-page-state-grammar which enforces honest empty/partial state)
  "AdvancedMode.tsx":           "investment-office shell — covered by finance-page-state-grammar",
  "AdvisorBoard.tsx":           "covered by boardroom-journey E2E",
  "BeginnerMode.tsx":           "investment-office shell — covered by finance-page-state-grammar",
  "BehavioralFirewall.tsx":     "investment-office shell — covered by finance-page-state-grammar",
  "CapitalPurpose.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "CapitalTwin.tsx":            "investment-office shell — covered by finance-page-state-grammar",
  "CatalystWarRoom.tsx":        "investment-office shell — covered by finance-page-state-grammar",
  "ConvictionEngine.tsx":       "investment-office shell — covered by finance-page-state-grammar",
  "CrossAssetStoryEngine.tsx":  "investment-office shell — covered by finance-page-state-grammar",
  "DecisionReadiness.tsx":      "investment-office shell — covered by finance-page-state-grammar",
  "DecisionTheater.tsx":        "investment-office shell — covered by finance-page-state-grammar",
  "DisagreementEngine.tsx":     "investment-office shell — covered by finance-page-state-grammar",
  "EventMarketsWorkspace.tsx":  "investment-office shell — covered by finance-page-state-grammar",
  "EventProbabilityLab.tsx":    "investment-office shell — covered by finance-page-state-grammar",
  "FamilyOffice.tsx":           "investment-office shell — covered by finance-page-state-grammar",
  "InstrumentDetail.tsx":       "investment-office shell — covered by finance-page-state-grammar",
  "IntelligenceDossier.tsx":    "investment-office shell — covered by finance-page-state-grammar",
  "InvestmentConstitution.tsx": "investment-office shell — covered by finance-page-state-grammar",
  "InvestmentGate.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "InvestmentReceipts.tsx":     "covered by derive-entity-ref trust test",
  "InvestmentShellPage.tsx":    "IA descriptor — covered by finance-routes-integrity",
  "KnowledgeGraph.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "MarketExplorer.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "MarketMemoryFeed.tsx":       "investment-office shell — covered by finance-page-state-grammar",
  "OperatingModes.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "OpportunityMap.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "PlatformConnections.tsx":    "covered by connectors-journey E2E",
  "PositionSizingCoach.tsx":    "investment-office shell — covered by finance-page-state-grammar",
  "PostTradeLoop.tsx":          "investment-office shell — covered by finance-page-state-grammar",
  "ResearchLibrary.tsx":        "investment-office shell — covered by finance-page-state-grammar",
  "RiskOffice.tsx":             "investment-office shell — covered by finance-page-state-grammar",
  "StrategyDNA.tsx":            "investment-office shell — covered by finance-page-state-grammar",
  "StrategyStudio.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  "ThesisJournal.tsx":          "covered by thesis-vault service test",
  "TimeMachineReview.tsx":      "investment-office shell — covered by finance-page-state-grammar",
  "TradingFloor.tsx":           "investment-office shell — covered by finance-page-state-grammar",
  "WarRoom.tsx":                "investment-office shell — covered by finance-page-state-grammar",
  "WatchlistsSignals.tsx":      "investment-office shell — covered by finance-page-state-grammar",
  "WhatWouldBreak.tsx":         "investment-office shell — covered by finance-page-state-grammar",
  // barrels
  "index.ts": "barrel",
};