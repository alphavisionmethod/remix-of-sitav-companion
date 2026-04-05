// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Scenario Providers
// Scenario-backed implementations for all 8 domain providers
// ═══════════════════════════════════════════════════════════════

import type {
  BoardroomProvider, InvestmentProvider, MoneyProvider, BusinessProvider,
  WorkspaceProvider, OwnerProvider, CalendarProvider, AdvisorProvider,
} from "./provider-interfaces";

// ── Demo Boardroom Provider ─────────────────────────────────────

export const demoBoardroomProvider: BoardroomProvider = {
  async getLatestPacket() {
    return {
      id: "demo-packet-001", title: "Weekly Operating Review — Flagship Demo",
      date: new Date().toISOString(),
      metrics: [
        { key: "net-worth", label: "Net Worth", value: "$4.2M", trend: "up", delta: "+2.3%" },
        { key: "revenue-mrr", label: "MRR", value: "$18.5K", trend: "up", delta: "+8.1%" },
        { key: "portfolio-return", label: "Portfolio YTD", value: "+14.2%", trend: "up" },
        { key: "pending-approvals", label: "Pending Approvals", value: 3, trend: "flat" },
        { key: "ai-spend", label: "AI Spend MTD", value: "$12.40", trend: "down", delta: "-15%" },
      ],
      insights: [
        { id: "i1", title: "Revenue acceleration detected", summary: "MRR growth has exceeded 8% for 3 consecutive months. Consider scaling acquisition.", severity: "info", domain: "business" },
        { id: "i2", title: "Portfolio concentration risk", summary: "Tech allocation at 42% exceeds your 35% target. Rebalancing recommended.", severity: "warning", domain: "investment" },
        { id: "i3", title: "Upcoming tax optimization window", summary: "Q2 estimated payments due. $3,200 in harvested losses available.", severity: "info", domain: "money" },
      ],
      actionItems: ["Review rebalancing proposal", "Approve Q2 tax strategy", "Sign partnership agreement"],
    };
  },
  async getMetrics() { return (await this.getLatestPacket())!.metrics; },
  async getInsights() { return (await this.getLatestPacket())!.insights; },
  async getHistoricalPackets() { return [(await this.getLatestPacket())!]; },
};

// ── Demo Investment Provider ────────────────────────────────────

export const demoInvestmentProvider: InvestmentProvider = {
  async getPortfolioSummary() {
    return { totalValue: 1_850_000, totalGain: 234_500, gainPct: 14.5, currency: "USD", asOf: new Date().toISOString() };
  },
  async getHoldings() {
    return [
      { id: "h1", symbol: "VTI", name: "Vanguard Total Stock Market", quantity: 450, currentPrice: 265.30, totalValue: 119_385, gainPct: 18.2, assetClass: "equity" },
      { id: "h2", symbol: "AAPL", name: "Apple Inc.", quantity: 200, currentPrice: 198.50, totalValue: 39_700, gainPct: 24.1, assetClass: "equity" },
      { id: "h3", symbol: "BND", name: "Vanguard Total Bond", quantity: 800, currentPrice: 72.40, totalValue: 57_920, gainPct: 2.1, assetClass: "fixed_income" },
      { id: "h4", symbol: "VNQ", name: "Vanguard Real Estate", quantity: 300, currentPrice: 84.20, totalValue: 25_260, gainPct: -3.4, assetClass: "real_estate" },
      { id: "h5", symbol: "GLD", name: "SPDR Gold Shares", quantity: 150, currentPrice: 215.80, totalValue: 32_370, gainPct: 12.8, assetClass: "commodity" },
    ];
  },
  async getWatchlist() {
    return [
      { id: "w1", symbol: "NVDA", name: "NVIDIA Corp", price: 875.30, change24h: 2.4 },
      { id: "w2", symbol: "MSFT", name: "Microsoft", price: 415.20, change24h: -0.3 },
      { id: "w3", symbol: "AMZN", name: "Amazon", price: 185.60, change24h: 1.1 },
    ];
  },
};

// ── Demo Money Provider ─────────────────────────────────────────

export const demoMoneyProvider: MoneyProvider = {
  async getAccounts() {
    return [
      { id: "a1", name: "Primary Checking", type: "checking", balance: 48_250, currency: "USD", institution: "Chase" },
      { id: "a2", name: "High-Yield Savings", type: "savings", balance: 125_000, currency: "USD", institution: "Marcus" },
      { id: "a3", name: "Business Operating", type: "checking", balance: 67_800, currency: "USD", institution: "Mercury" },
      { id: "a4", name: "Emergency Fund", type: "savings", balance: 50_000, currency: "USD", institution: "Ally" },
    ];
  },
  async getRecentTransactions(limit = 10) {
    const txns = [
      { id: "t1", date: "2026-04-04", description: "Stripe Payout", amount: 4250, category: "Income", accountId: "a3" },
      { id: "t2", date: "2026-04-03", description: "AWS Infrastructure", amount: -342, category: "Business", accountId: "a3" },
      { id: "t3", date: "2026-04-03", description: "Whole Foods", amount: -187, category: "Groceries", accountId: "a1" },
      { id: "t4", date: "2026-04-02", description: "Transfer to Savings", amount: -5000, category: "Transfer", accountId: "a1" },
      { id: "t5", date: "2026-04-01", description: "Salary Deposit", amount: 12500, category: "Income", accountId: "a1" },
    ];
    return txns.slice(0, limit);
  },
  async getUpcomingBills() {
    return [
      { id: "b1", payee: "Mortgage", amount: 3200, dueDate: "2026-04-15", status: "upcoming", recurring: true },
      { id: "b2", payee: "Insurance Bundle", amount: 450, dueDate: "2026-04-20", status: "upcoming", recurring: true },
      { id: "b3", payee: "Estimated Tax Q2", amount: 8500, dueDate: "2026-06-15", status: "upcoming", recurring: false },
    ];
  },
  async getNetWorth() { return { total: 4_200_000, liquid: 291_050, invested: 1_850_000 }; },
};

// ── Demo Business Provider ──────────────────────────────────────

export const demoBusinessProvider: BusinessProvider = {
  async getContacts() {
    return [
      { id: "c1", name: "Sarah Chen", company: "Meridian Ventures", role: "Partner", lastContact: "2026-04-02", stage: "active" },
      { id: "c2", name: "Marcus Webb", company: "Atlas Corp", role: "CTO", lastContact: "2026-03-28", stage: "prospect" },
      { id: "c3", name: "Elena Rossi", company: "Vanguard Advisory", role: "Director", lastContact: "2026-04-04", stage: "active" },
      { id: "c4", name: "James Park", company: "Nordic Digital", role: "CEO", lastContact: "2026-03-15", stage: "nurturing" },
    ];
  },
  async getDeals() {
    return [
      { id: "d1", title: "Atlas Corp Platform License", value: 120_000, stage: "negotiation", probability: 75, closeDate: "2026-05-15", contactId: "c2" },
      { id: "d2", title: "Nordic Digital Consulting", value: 45_000, stage: "proposal", probability: 50, closeDate: "2026-06-01", contactId: "c4" },
      { id: "d3", title: "Vanguard Advisory Retainer", value: 36_000, stage: "closed_won", probability: 100, closeDate: "2026-04-01", contactId: "c3" },
    ];
  },
  async getPipeline() { return { totalValue: 201_000, dealCount: 3, weightedValue: 136_500 }; },
  async getRevenueMetrics() {
    return [
      { period: "2026-01", revenue: 15_200, growth: 5.2, mrr: 15_200, churn: 1.2 },
      { period: "2026-02", revenue: 16_100, growth: 5.9, mrr: 16_100, churn: 0.8 },
      { period: "2026-03", revenue: 17_400, growth: 8.1, mrr: 17_400, churn: 0.5 },
      { period: "2026-04", revenue: 18_500, growth: 6.3, mrr: 18_500, churn: 0.9 },
    ];
  },
};

// ── Demo Workspace Provider ─────────────────────────────────────

export const demoWorkspaceProvider: WorkspaceProvider = {
  async getProjects() {
    return [
      { id: "p1", name: "SITA OS v2 Launch", status: "active", progress: 72, memberCount: 4 },
      { id: "p2", name: "Investor Deck Q2", status: "active", progress: 45, memberCount: 2 },
      { id: "p3", name: "Partnership Integration", status: "planning", progress: 15, memberCount: 3 },
    ];
  },
  async getTasks() {
    return [
      { id: "tk1", title: "Finalize boardroom metrics", status: "in_progress", priority: "high", assignee: "You", dueDate: "2026-04-08", projectId: "p1" },
      { id: "tk2", title: "Review partnership terms", status: "todo", priority: "medium", assignee: "Sarah", dueDate: "2026-04-12", projectId: "p3" },
      { id: "tk3", title: "Update financial projections", status: "todo", priority: "high", assignee: "You", dueDate: "2026-04-10", projectId: "p2" },
    ];
  },
  async getActivityFeed() {
    return [
      { id: "af1", action: "Completed: AI routing policy review", actor: "SITA", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "af2", action: "Approved: Q2 budget allocation", actor: "You", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: "af3", action: "Created: Partnership integration project", actor: "You", timestamp: new Date(Date.now() - 86400000).toISOString() },
    ];
  },
};

// ── Demo Owner Provider ─────────────────────────────────────────

export const demoOwnerProvider: OwnerProvider = {
  async getProfile() {
    return { displayName: "Alex Morgan", email: "alex@demo.sita.os", memberSince: "2025-09-01", plan: "Sovereign" };
  },
  async getNotifications() {
    return [
      { id: "n1", title: "Portfolio rebalance recommended", body: "Tech allocation exceeds target by 7pp.", category: "investment", read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "n2", title: "Bill payment scheduled", body: "Mortgage payment of $3,200 scheduled for Apr 15.", category: "money", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "n3", title: "New deal stage: Negotiation", body: "Atlas Corp Platform License moved to negotiation.", category: "business", read: false, createdAt: new Date(Date.now() - 43200000).toISOString() },
    ];
  },
  async getSystemHealth() {
    return { status: "healthy", uptime: 99.97, activeConnectors: 8, pendingApprovals: 3 };
  },
};

// ── Demo Calendar Provider ──────────────────────────────────────

export const demoCalendarProvider: CalendarProvider = {
  async getUpcomingEvents() {
    return [
      { id: "e1", title: "Weekly Strategy Review", startTime: "2026-04-07T10:00:00Z", endTime: "2026-04-07T11:00:00Z", type: "meeting", attendees: ["Sarah Chen", "Elena Rossi"] },
      { id: "e2", title: "Investor Call — Meridian", startTime: "2026-04-08T14:00:00Z", endTime: "2026-04-08T15:00:00Z", type: "call", attendees: ["Sarah Chen"] },
      { id: "e3", title: "Q2 Tax Filing Deadline", startTime: "2026-06-15T00:00:00Z", endTime: "2026-06-15T23:59:59Z", type: "deadline" },
    ];
  },
  async getTodayEvents() {
    return [
      { id: "e4", title: "Morning Portfolio Check", startTime: new Date().toISOString(), endTime: new Date(Date.now() + 1800000).toISOString(), type: "routine" },
    ];
  },
};

// ── Demo Advisor Provider ───────────────────────────────────────

export const demoAdvisorProvider: AdvisorProvider = {
  async getSuggestions() {
    return [
      { id: "s1", title: "Rebalance tech allocation", summary: "Sell 7% tech, buy bonds/real estate to match target allocation.", confidence: 0.87, domain: "investment", actionable: true },
      { id: "s2", title: "Accelerate Q2 tax harvesting", summary: "$3,200 in harvestable losses expiring. Act before April 15.", confidence: 0.92, domain: "money", actionable: true },
      { id: "s3", title: "Follow up with Marcus Webb", summary: "No contact in 8 days. Deal at negotiation stage needs momentum.", confidence: 0.78, domain: "business", actionable: true },
    ];
  },
  async getRecentMemos() {
    return [
      { id: "m1", title: "Weekly Financial Summary", content: "Net worth grew 2.3% this week driven by portfolio gains and MRR growth. Cash reserves healthy at 3.2x monthly burn.", domain: "money", generatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "m2", title: "Pipeline Health Report", content: "Weighted pipeline at $136.5K. Atlas Corp deal is the key swing factor — 75% probability on $120K. Nordic Digital needs nurturing.", domain: "business", generatedAt: new Date(Date.now() - 172800000).toISOString() },
    ];
  },
};
