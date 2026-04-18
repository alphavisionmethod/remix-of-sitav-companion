// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Domain Manifest (Phase 24.C)
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "../domain-manifest";

export const investmentManifest: DomainManifest = {
  id: "investment",
  name: "Investment Office",
  description: "Capital management: portfolios, holdings, theses, trades, behavioural firewall, and family-office views",
  owner: "investment-office-service",
  version: "1.0.0",

  entities: [
    { id: "portfolio", name: "Portfolio", description: "Investment portfolio container", dbTable: "portfolios", statusStates: ["active", "rebalancing", "closed"], permissions: { create: "investment.portfolio.create", read: "investment.portfolio.read", update: "investment.portfolio.update", delete: "investment.portfolio.delete", approve: "investment.portfolio.approve" }, searchable: true, fileAttachable: false },
    { id: "holding", name: "Holding", description: "Aggregated holding within a portfolio", dbTable: "holdings", statusStates: ["open", "closed", "transferred"], permissions: { create: "investment.holding.create", read: "investment.holding.read", update: "investment.holding.update", delete: "investment.holding.delete" }, searchable: true, fileAttachable: false },
    { id: "position", name: "Position", description: "Individual long/short position", dbTable: "positions", statusStates: ["open", "partially-closed", "closed"], permissions: { create: "investment.position.create", read: "investment.position.read", update: "investment.position.update", delete: "investment.position.delete" }, searchable: true, fileAttachable: false },
    { id: "instrument", name: "Instrument", description: "Tradable instrument (security, ETF, etc.)", dbTable: "instruments", statusStates: ["active", "delisted", "halted"], permissions: { create: "investment.instrument.create", read: "investment.instrument.read", update: "investment.instrument.update", delete: "investment.instrument.delete" }, searchable: true, fileAttachable: false },
    { id: "thesis", name: "Investment Thesis", description: "Documented rationale for an investment", dbTable: "theses", statusStates: ["draft", "active", "validated", "invalidated", "archived"], permissions: { create: "investment.thesis.create", read: "investment.thesis.read", update: "investment.thesis.update", delete: "investment.thesis.delete" }, searchable: true, fileAttachable: true },
    { id: "trade", name: "Trade", description: "Order/fill record passing through behavioural firewall", dbTable: "trades", statusStates: ["pending", "approved", "executed", "cancelled", "rejected"], permissions: { create: "investment.trade.create", read: "investment.trade.read", update: "investment.trade.update", delete: "investment.trade.delete", approve: "investment.trade.approve" }, searchable: true, fileAttachable: false },
    { id: "watchlist", name: "Watchlist", description: "User-curated symbol watchlist", dbTable: "watchlists", statusStates: ["active", "archived"], permissions: { create: "investment.watchlist.create", read: "investment.watchlist.read", update: "investment.watchlist.update", delete: "investment.watchlist.delete" }, searchable: true, fileAttachable: false },
    { id: "alert", name: "Alert", description: "Market/risk alert", dbTable: null, statusStates: ["new", "acknowledged", "resolved", "snoozed"], permissions: { create: "investment.alert.create", read: "investment.alert.read", update: "investment.alert.update", delete: "investment.alert.delete" }, searchable: true, fileAttachable: false },
    { id: "scenario", name: "Scenario", description: "Investment scenario simulation", dbTable: "scenarios", statusStates: ["draft", "running", "completed"], permissions: { create: "investment.scenario.create", read: "investment.scenario.read", update: "investment.scenario.update", delete: "investment.scenario.delete" }, searchable: true, fileAttachable: false },
  ],

  workflows: [
    {
      id: "trade-execution", name: "Trade Execution", description: "Validate, gate, approve, and execute a trade",
      trigger: "trade.requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["trade.approved", "trade.executed", "trade.rejected"],
      steps: [
        { id: "validate", name: "Validate", type: "automated", description: "Validate trade parameters", canFail: true, rollbackCapable: false },
        { id: "firewall", name: "Behavioural Firewall", type: "automated", description: "Run behavioural firewall checks", canFail: true, rollbackCapable: false },
        { id: "approve", name: "Approve", type: "approval", description: "Owner approves trade", canFail: false, rollbackCapable: true },
        { id: "execute", name: "Execute", type: "automated", description: "Submit order to broker", canFail: true, rollbackCapable: true },
        { id: "settle", name: "Settle", type: "verification", description: "Verify settlement", canFail: true, rollbackCapable: false },
      ],
    },
    {
      id: "rebalance", name: "Portfolio Rebalance", description: "Rebalance portfolio to target allocation",
      trigger: "portfolio.drift-detected", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["rebalance.proposed", "rebalance.executed"],
      steps: [
        { id: "compute-drift", name: "Compute Drift", type: "automated", description: "Compute current vs target weights", canFail: false, rollbackCapable: false },
        { id: "propose", name: "Propose Trades", type: "ai-assisted", description: "Suggest trade list to close drift", canFail: true, rollbackCapable: true },
        { id: "approve", name: "Approve Plan", type: "approval", description: "Owner approves rebalance plan", canFail: false, rollbackCapable: true },
        { id: "dispatch", name: "Dispatch Trades", type: "automated", description: "Dispatch via trade-execution workflow", canFail: true, rollbackCapable: true },
      ],
    },
    {
      id: "thesis-validation", name: "Thesis Validation", description: "Periodically validate active theses against evidence",
      trigger: "thesis.review-due", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["thesis.validated", "thesis.invalidated"],
      steps: [
        { id: "gather", name: "Gather Evidence", type: "ai-assisted", description: "Pull latest signals supporting/refuting thesis", canFail: true, rollbackCapable: false },
        { id: "score", name: "Score Conviction", type: "ai-assisted", description: "Score conviction delta", canFail: false, rollbackCapable: false },
        { id: "decide", name: "Decide", type: "human", description: "Owner reviews and decides", canFail: false, rollbackCapable: true },
      ],
    },
    {
      id: "risk-review", name: "Risk Review", description: "Run portfolio risk review and flag concentrations",
      trigger: "risk.review-due", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["risk.flag-raised"],
      steps: [
        { id: "compute", name: "Compute Risk Metrics", type: "automated", description: "VaR, exposure, concentration", canFail: false, rollbackCapable: false },
        { id: "flag", name: "Flag Issues", type: "automated", description: "Raise flags above threshold", canFail: false, rollbackCapable: false },
        { id: "notify", name: "Notify Owner", type: "automated", description: "Send notification", canFail: true, rollbackCapable: false },
      ],
    },
  ],

  shellIntegration: {
    launcher: {
      appId: "investment", displayName: "Investment Office", icon: "TrendingUp", category: "Money",
      description: "Portfolios, theses, trades, and behavioural firewall",
      keywords: ["invest", "portfolio", "trade", "thesis", "market", "stocks"],
    },
    commandPalette: [
      { id: "inv-portfolio", label: "Portfolio Office", keywords: ["portfolio", "holdings"], action: "/investment/portfolio", icon: "Briefcase" },
      { id: "inv-trades", label: "Trading Floor", keywords: ["trade", "order", "execute"], action: "/investment/trading-floor", icon: "Activity" },
      { id: "inv-thesis", label: "Thesis Journal", keywords: ["thesis", "rationale"], action: "/investment/journal", icon: "BookOpen" },
      { id: "inv-risk", label: "Risk Office", keywords: ["risk", "exposure"], action: "/investment/risk", icon: "ShieldAlert" },
      { id: "inv-firewall", label: "Behavioural Firewall", keywords: ["firewall", "policy", "cooling"], action: "/investment/behavioral", icon: "Shield" },
    ],
    searchProviders: [
      { id: "search-portfolios", name: "Portfolios", entityType: "portfolio", searchFields: ["name"], resultRoute: "/investment/portfolio/:id", icon: "Briefcase" },
      { id: "search-theses", name: "Theses", entityType: "thesis", searchFields: ["title", "summary"], resultRoute: "/investment/journal/:id", icon: "BookOpen" },
      { id: "search-instruments", name: "Instruments", entityType: "instrument", searchFields: ["symbol", "display_name"], resultRoute: "/investment/instrument/:symbol", icon: "BarChart3" },
    ],
    notificationTriggers: [
      { eventSubject: "trade.approved", title: "Trade approved", priority: "high", actionRoute: "/investment/execute", groupKey: "investment-trades" },
      { eventSubject: "risk.flag-raised", title: "Risk flag raised", priority: "critical", actionRoute: "/investment/risk", groupKey: "investment-risk" },
      { eventSubject: "thesis.invalidated", title: "Thesis invalidated", priority: "high", actionRoute: "/investment/journal", groupKey: "investment-thesis" },
    ],
  },

  crossDomainEvents: [
    { id: "inv-fin-trade", sourceEvent: "trade.executed", sourceDomain: "investment", targetDomain: "finance", targetAction: "transaction.record", description: "Record executed trade as finance transaction", direction: "emit" },
    { id: "inv-board-risk", sourceEvent: "risk.flag-raised", sourceDomain: "investment", targetDomain: "boardroom", targetAction: "session.escalate", description: "Escalate risk flag to boardroom", direction: "emit" },
  ],

  truthModel: {
    freshnessThresholds: { portfolio: 300, holding: 300, position: 60, instrument: 3600, thesis: 86400, trade: 30, watchlist: 600, scenario: 86400 },
    simulatedSurfaces: [],
    dataSourceClassification: { portfolio: "live", holding: "synced", position: "live", instrument: "synced", thesis: "live", trade: "live", watchlist: "live", scenario: "derived" },
    deterministic: ["trade.price_cents", "trade.quantity", "holding.avg_cost_cents", "position.entry_price_cents"],
  },

  aiIntegration: {
    advisorIds: ["investment-advisor", "risk-advisor"],
    capabilityKeys: ["investment.thesis-evaluation", "investment.risk-assessment", "investment.behavioral-gate"],
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    budgetClass: "premium",
  },

  fileIntegration: {
    acceptedTypes: ["application/pdf", "text/csv", "image/*"],
    storageBucket: "investment-files",
    maxFileSizeMB: 50,
    autoClassify: true,
  },

  boardroomEscalation: {
    manualEscalationEnabled: true,
    autoEscalateRules: [
      { id: "inv-risk-critical", condition: "risk.severity == 'critical'", description: "Auto-escalate critical risk flags to boardroom", severity: "critical", minConfidence: 0.7 },
      { id: "inv-thesis-broken", condition: "thesis.invalidated && portfolio.exposure > 0.1", description: "Escalate when an invalidated thesis exposes >10% of portfolio", severity: "warning", minConfidence: 0.6 },
    ],
  },
};
