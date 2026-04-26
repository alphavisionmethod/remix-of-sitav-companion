// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Domain Manifest
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "../domain-manifest";

export const financeManifest: DomainManifest = {
  id: "finance",
  name: "Finance OS",
  description: "Money management: budgets, bills, subscriptions, reserves, investments, and capital allocation",
  owner: "finance-os-service",
  version: "1.0.0",

  entities: [
    { id: "transaction", name: "Transaction", description: "Individual financial transaction", dbTable: "transactions", statusStates: ["pending", "categorized", "reconciled", "disputed", "excluded"], permissions: { create: "finance.transaction.create", read: "finance.transaction.read", update: "finance.transaction.update", delete: "finance.transaction.delete" }, searchable: true, fileAttachable: true },
    { id: "bill", name: "Bill", description: "Upcoming or recurring payment obligation", dbTable: "bills", statusStates: ["upcoming", "due", "paid", "overdue", "cancelled"], permissions: { create: "finance.bill.create", read: "finance.bill.read", update: "finance.bill.update", delete: "finance.bill.delete", approve: "finance.bill.approve" }, searchable: true, fileAttachable: true },
    { id: "budget", name: "Budget", description: "Spending allocation for a category/period", dbTable: "budgets", statusStates: ["active", "exceeded", "completed", "paused"], permissions: { create: "finance.budget.create", read: "finance.budget.read", update: "finance.budget.update", delete: "finance.budget.delete" }, searchable: true, fileAttachable: false },
    { id: "envelope", name: "Envelope", description: "Virtual envelope for earmarked funds", dbTable: "envelopes", statusStates: ["active", "depleted", "overfunded", "closed"], permissions: { create: "finance.envelope.create", read: "finance.envelope.read", update: "finance.envelope.update", delete: "finance.envelope.delete" }, searchable: true, fileAttachable: false },
    { id: "sinking-fund", name: "Sinking Fund", description: "Periodic savings toward a future expense", dbTable: "sinking_funds", statusStates: ["accumulating", "target-reached", "withdrawn", "closed"], permissions: { create: "finance.sinking-fund.create", read: "finance.sinking-fund.read", update: "finance.sinking-fund.update", delete: "finance.sinking-fund.delete" }, searchable: true, fileAttachable: false },
    { id: "subscription", name: "Subscription", description: "Recurring service charge", dbTable: "subscriptions", statusStates: ["active", "trial", "flagged-waste", "cancelling", "cancelled"], permissions: { create: "finance.subscription.create", read: "finance.subscription.read", update: "finance.subscription.update", delete: "finance.subscription.delete" }, searchable: true, fileAttachable: true },
    { id: "asset", name: "Asset", description: "Owned asset with tracked value", dbTable: "assets", statusStates: ["active", "depreciated", "sold", "written-off"], permissions: { create: "finance.asset.create", read: "finance.asset.read", update: "finance.asset.update", delete: "finance.asset.delete" }, searchable: true, fileAttachable: true },
    { id: "portfolio", name: "Portfolio", description: "Investment portfolio grouping", dbTable: "portfolios", statusStates: ["active", "rebalancing", "closed"], permissions: { create: "finance.portfolio.create", read: "finance.portfolio.read", update: "finance.portfolio.update", delete: "finance.portfolio.delete" }, searchable: true, fileAttachable: false },
    { id: "receivable", name: "Receivable", description: "Money owed to the business", dbTable: "receivables", statusStates: ["outstanding", "partial", "collected", "written-off"], permissions: { create: "finance.receivable.create", read: "finance.receivable.read", update: "finance.receivable.update", delete: "finance.receivable.delete" }, searchable: true, fileAttachable: true },
    { id: "debt-obligation", name: "Debt Obligation", description: "Loan or credit obligation", dbTable: "debt_obligations", statusStates: ["active", "deferred", "paid-off", "defaulted"], permissions: { create: "finance.debt.create", read: "finance.debt.read", update: "finance.debt.update", delete: "finance.debt.delete" }, searchable: true, fileAttachable: true },
    { id: "capital-bucket", name: "Capital Bucket", description: "Strategic capital allocation container", dbTable: "capital_buckets", statusStates: ["active", "frozen", "depleted", "closed"], permissions: { create: "finance.capital.create", read: "finance.capital.read", update: "finance.capital.update", delete: "finance.capital.delete", approve: "finance.capital.approve" }, searchable: true, fileAttachable: false },
    { id: "investment-thesis", name: "Investment Thesis", description: "Documented rationale for an investment", dbTable: "investment_theses", statusStates: ["draft", "active", "validated", "invalidated", "archived"], permissions: { create: "finance.thesis.create", read: "finance.thesis.read", update: "finance.thesis.update", delete: "finance.thesis.delete" }, searchable: true, fileAttachable: true },
    { id: "scenario", name: "Scenario", description: "Financial simulation scenario", dbTable: "scenarios", statusStates: ["draft", "running", "completed", "archived"], permissions: { create: "finance.scenario.create", read: "finance.scenario.read", update: "finance.scenario.update", delete: "finance.scenario.delete" }, searchable: true, fileAttachable: false },
    { id: "reserve", name: "Reserve", description: "Emergency or strategic reserve fund", dbTable: "reserves", statusStates: ["healthy", "warning", "critical", "depleted"], permissions: { create: "finance.reserve.create", read: "finance.reserve.read", update: "finance.reserve.update", delete: "finance.reserve.delete", approve: "finance.reserve.approve" }, searchable: true, fileAttachable: false },
  ],

  workflows: [
    {
      id: "bill-pay", name: "Bill Payment", description: "Verify, approve, and execute bill payment",
      trigger: "bill.upcoming", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["bill.paid", "bill.overdue"],
      steps: [
        { id: "verify", name: "Verify Amount", type: "automated", description: "Check amount matches expected", canFail: false, rollbackCapable: false },
        { id: "check-balance", name: "Check Balance", type: "automated", description: "Ensure sufficient funds", canFail: true, rollbackCapable: false },
        { id: "approve", name: "Approve Payment", type: "approval", description: "Owner approves payment", canFail: false, rollbackCapable: true },
        { id: "execute", name: "Execute Payment", type: "automated", description: "Process payment", canFail: true, rollbackCapable: true },
        { id: "receipt", name: "Generate Receipt", type: "automated", description: "Create payment receipt", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "budget-allocation", name: "Budget Allocation", description: "Allocate funds across budget categories",
      trigger: "budget.period-start", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["budget.exceeded"],
      steps: [
        { id: "analyze", name: "Analyze Spending", type: "ai-assisted", description: "AI analyzes past spending patterns", canFail: true, rollbackCapable: false },
        { id: "recommend", name: "Recommend Allocation", type: "ai-assisted", description: "AI suggests allocation", canFail: true, rollbackCapable: false },
        { id: "review", name: "Review", type: "human", description: "Owner reviews allocation", canFail: false, rollbackCapable: true },
        { id: "approve", name: "Approve", type: "approval", description: "Approve allocation", canFail: false, rollbackCapable: true },
        { id: "apply", name: "Apply Allocation", type: "automated", description: "Set budget limits", canFail: false, rollbackCapable: true },
      ],
    },
    {
      id: "subscription-review", name: "Subscription Review", description: "Detect and review subscription waste",
      trigger: "subscription.detected", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["subscription.flagged-waste"],
      steps: [
        { id: "classify", name: "Classify", type: "automated", description: "Categorize subscription", canFail: false, rollbackCapable: false },
        { id: "assess", name: "Assess Waste", type: "ai-assisted", description: "AI assesses usage vs cost", canFail: true, rollbackCapable: false },
        { id: "recommend", name: "Recommend", type: "ai-assisted", description: "Keep/cancel/downgrade recommendation", canFail: true, rollbackCapable: false },
        { id: "approve", name: "Approve Action", type: "approval", description: "Owner decides", canFail: false, rollbackCapable: true },
      ],
    },
    {
      id: "reserve-fund", name: "Reserve Fund Management", description: "Monitor and rebalance reserve funds",
      trigger: "reserve.threshold-crossed", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["reserve.rebalanced"],
      steps: [
        { id: "calculate", name: "Calculate Target", type: "automated", description: "Determine optimal reserve level", canFail: false, rollbackCapable: false },
        { id: "simulate", name: "Simulate Transfer", type: "automated", description: "Preview rebalance impact", canFail: false, rollbackCapable: false },
        { id: "approve", name: "Approve", type: "approval", description: "Owner approves rebalance", canFail: false, rollbackCapable: true },
        { id: "execute", name: "Execute Transfer", type: "automated", description: "Move funds", canFail: true, rollbackCapable: true },
        { id: "verify", name: "Verify", type: "verification", description: "Confirm reserve levels", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "capital-allocation", name: "Capital Allocation", description: "Strategic capital deployment across buckets",
      trigger: "capital.review-scheduled", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["capital.allocated"],
      steps: [
        { id: "assess", name: "Assess Portfolio", type: "ai-assisted", description: "AI assesses current allocation", canFail: true, rollbackCapable: false },
        { id: "recommend", name: "Recommend Reallocation", type: "ai-assisted", description: "AI suggests changes", canFail: true, rollbackCapable: false },
        { id: "simulate", name: "Simulate", type: "automated", description: "Run scenario simulation", canFail: true, rollbackCapable: false },
        { id: "approve", name: "Approve", type: "approval", description: "Owner approves allocation", canFail: false, rollbackCapable: true },
        { id: "execute", name: "Execute", type: "automated", description: "Apply allocation changes", canFail: true, rollbackCapable: true },
      ],
    },
    {
      id: "investment-review", name: "Investment Review", description: "Periodic investment performance review",
      trigger: "investment.review-due", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["investment.underperforming"],
      steps: [
        { id: "gather", name: "Gather Performance", type: "automated", description: "Pull performance data", canFail: true, rollbackCapable: false },
        { id: "analyze", name: "Analyze", type: "ai-assisted", description: "AI analyzes against thesis", canFail: true, rollbackCapable: false },
        { id: "report", name: "Generate Report", type: "ai-assisted", description: "Create review summary", canFail: true, rollbackCapable: false },
        { id: "present", name: "Present to Owner", type: "human", description: "Owner reviews findings", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "debt-payoff", name: "Debt Payoff Strategy", description: "Optimize debt repayment order and amounts",
      trigger: "debt.review-scheduled", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["debt.paid-off"],
      steps: [
        { id: "analyze", name: "Analyze Debts", type: "automated", description: "Calculate optimal payoff strategy", canFail: false, rollbackCapable: false },
        { id: "recommend", name: "Recommend Strategy", type: "ai-assisted", description: "Avalanche vs snowball recommendation", canFail: true, rollbackCapable: false },
        { id: "approve", name: "Approve Plan", type: "approval", description: "Owner approves payoff plan", canFail: false, rollbackCapable: true },
        { id: "schedule", name: "Schedule Payments", type: "automated", description: "Set up payment schedule", canFail: true, rollbackCapable: true },
      ],
    },
    {
      id: "scenario-simulation", name: "Scenario Simulation", description: "Run what-if financial scenarios",
      trigger: "scenario.created", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["scenario.completed"],
      steps: [
        { id: "configure", name: "Configure Parameters", type: "human", description: "Set scenario variables", canFail: false, rollbackCapable: true },
        { id: "simulate", name: "Run Simulation", type: "automated", description: "Execute Monte Carlo or deterministic sim", canFail: true, rollbackCapable: false },
        { id: "analyze", name: "Analyze Results", type: "ai-assisted", description: "AI interprets outcomes", canFail: true, rollbackCapable: false },
        { id: "report", name: "Present Results", type: "automated", description: "Generate visual report", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "reconciliation", name: "Account Reconciliation", description: "Reconcile transactions against bank data",
      trigger: "account.synced", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["transaction.disputed"],
      steps: [
        { id: "match", name: "Auto-Match", type: "automated", description: "Match transactions to bank records", canFail: false, rollbackCapable: false },
        { id: "flag", name: "Flag Discrepancies", type: "automated", description: "Identify unmatched items", canFail: false, rollbackCapable: false },
        { id: "review", name: "Manual Review", type: "human", description: "Owner resolves discrepancies", canFail: false, rollbackCapable: true },
        { id: "finalize", name: "Finalize", type: "automated", description: "Mark period as reconciled", canFail: false, rollbackCapable: true },
      ],
    },
    {
      id: "tax-prep", name: "Tax Preparation", description: "Organize and prepare tax-related data",
      trigger: "tax.season-start", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["tax.estimated"],
      steps: [
        { id: "categorize", name: "Categorize Deductions", type: "ai-assisted", description: "AI categorizes potential deductions", canFail: true, rollbackCapable: false },
        { id: "calculate", name: "Calculate Estimates", type: "automated", description: "Deterministic tax estimation", canFail: false, rollbackCapable: false },
        { id: "gather-docs", name: "Gather Documents", type: "human", description: "Collect required documents", canFail: false, rollbackCapable: false },
        { id: "review", name: "Review Package", type: "human", description: "Final review before filing", canFail: false, rollbackCapable: true },
      ],
    },
  ],

  shellIntegration: {
    launcher: {
      appId: "finance-os", displayName: "Money", icon: "Wallet", category: "Core",
      badgeSource: "finance.bills.due-count", description: "Budgets, bills, investments & financial health",
      keywords: ["money", "finance", "budget", "bill", "investment", "subscription", "tax"],
    },
    commandPalette: [
      { id: "fin-add-transaction", label: "Add Transaction", keywords: ["transaction", "expense", "income"], action: "/finance/transactions/new", icon: "Plus" },
      { id: "fin-pay-bill", label: "Pay a Bill", keywords: ["bill", "pay", "payment"], action: "/finance/bills", icon: "CreditCard" },
      { id: "fin-view-budget", label: "View Budget", keywords: ["budget", "spending", "allocation"], action: "/finance/budgets", icon: "PieChart" },
      { id: "fin-subscriptions", label: "Review Subscriptions", keywords: ["subscription", "recurring", "waste"], action: "/finance/subscriptions", icon: "RefreshCw" },
      { id: "fin-reserves", label: "Check Reserves", keywords: ["reserve", "emergency", "savings"], action: "/finance/reserves", icon: "Shield" },
      { id: "fin-cashflow", label: "Cash Flow Forecast", keywords: ["cashflow", "forecast", "projection"], action: "/finance/cashflow", icon: "TrendingUp" },
      { id: "fin-scenarios", label: "Run Scenario", keywords: ["scenario", "simulation", "what-if"], action: "/finance/scenarios/new", icon: "Beaker" },
      { id: "fin-tax", label: "Tax Dashboard", keywords: ["tax", "deduction", "filing"], action: "/finance/tax", icon: "FileText" },
    ],
    searchProviders: [
      { id: "search-transactions", name: "Transactions", entityType: "transaction", searchFields: ["description", "merchant", "category", "amount"], resultRoute: "/finance/transactions/:id", icon: "ArrowRightLeft" },
      { id: "search-bills", name: "Bills", entityType: "bill", searchFields: ["name", "vendor", "amount"], resultRoute: "/finance/bills/:id", icon: "CreditCard" },
      { id: "search-subscriptions", name: "Subscriptions", entityType: "subscription", searchFields: ["name", "provider", "amount"], resultRoute: "/finance/subscriptions/:id", icon: "RefreshCw" },
      { id: "search-budgets", name: "Budgets", entityType: "budget", searchFields: ["name", "category"], resultRoute: "/finance/budgets/:id", icon: "PieChart" },
      { id: "search-investments", name: "Investments", entityType: "portfolio", searchFields: ["name", "ticker", "thesis"], resultRoute: "/investment/instrument/:id", icon: "BarChart3" },
    ],
    notificationTriggers: [
      { eventSubject: "bill.overdue", title: "Bill overdue", priority: "critical", actionRoute: "/finance/bills/:id", groupKey: "finance-bills" },
      { eventSubject: "bill.upcoming", title: "Bill due soon", priority: "medium", actionRoute: "/finance/bills/:id", groupKey: "finance-bills" },
      { eventSubject: "budget.exceeded", title: "Budget exceeded", priority: "high", actionRoute: "/finance/budgets/:id", groupKey: "finance-budgets" },
      { eventSubject: "subscription.flagged-waste", title: "Possible subscription waste", priority: "medium", actionRoute: "/finance/subscriptions/:id", groupKey: "finance-subscriptions" },
      { eventSubject: "reserve.threshold-crossed", title: "Reserve below threshold", priority: "critical", actionRoute: "/finance/reserves", groupKey: "finance-reserves" },
    ],
  },

  crossDomainEvents: [
    { id: "fin-biz-reconcile", sourceEvent: "bill.paid", sourceDomain: "finance", targetDomain: "business", targetAction: "invoice.reconcile", description: "Reconcile business invoice when bill is paid", direction: "emit" },
    { id: "fin-board-anomaly", sourceEvent: "anomaly.detected", sourceDomain: "finance", targetDomain: "cross-domain", targetAction: "boardroom.escalate", description: "Escalate financial anomalies to boardroom", direction: "emit" },
    { id: "fin-biz-payment", sourceEvent: "payment.executed", sourceDomain: "finance", targetDomain: "business", targetAction: "receivable.update", description: "Update business receivable on payment", direction: "emit" },
    { id: "fin-con-projection", sourceEvent: "cashflow.projected", sourceDomain: "finance", targetDomain: "concierge", targetAction: "budget.update", description: "Update concierge spending limits from projections", direction: "emit" },
  ],

  truthModel: {
    freshnessThresholds: { transaction: 3600, bill: 3600, budget: 7200, subscription: 7200, reserve: 3600, portfolio: 7200, scenario: 86400 },
    simulatedSurfaces: ["scenario-simulator", "investment-simulator"],
    dataSourceClassification: { transaction: "synced", bill: "live", budget: "live", subscription: "synced", reserve: "live", portfolio: "synced", scenario: "simulated" },
    deterministic: ["tax-estimation", "safe-to-spend", "reserve-calculations", "burn-rate", "invoice-aging", "budget-utilization", "cash-flow-projections", "payment-amounts"],
  },

  aiIntegration: {
    advisorIds: ["finance-advisor", "investment-advisor", "tax-advisor"],
    capabilityKeys: ["spending-analysis", "subscription-review", "budget-recommendation", "tax-categorization", "scenario-interpretation"],
    allowedModels: ["google/gemini-2.5-flash", "openai/gpt-5-mini"],
    budgetClass: "standard",
  },

  fileIntegration: {
    acceptedTypes: ["application/pdf", "image/*", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    storageBucket: "finance-files",
    maxFileSizeMB: 25,
    autoClassify: true,
  },

  boardroomEscalation: {
    manualEscalationEnabled: true,
    autoEscalateRules: [
      { id: "spend-anomaly", condition: "spending.variance > 30%", description: "Spending anomaly exceeds 30% variance", severity: "critical", minConfidence: 0.8 },
      { id: "reserve-warning", condition: "reserve.level < 30%", description: "Reserve below 30% threshold", severity: "critical", minConfidence: 0.9 },
      { id: "investment-decision", condition: "investment.amount > 10000", description: "Investment decisions over $10k", severity: "warning", minConfidence: 0.7 },
    ],
  },
};
