// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Profitability Intelligence Engine
// Pure stateless engine for revenue/margin/cash/capacity analysis
// ═══════════════════════════════════════════════════════════════

export interface LeakItem {
  id: string;
  type: "missed_lead" | "delayed_followup" | "quote_delay" | "pipeline_hole" | "underpriced" | "subscription_waste" | "over_servicing" | "overdue_invoice";
  title: string;
  description: string;
  estimatedLoss: number;
  severity: "low" | "medium" | "high" | "critical";
  daysOpen: number;
  actionable: boolean;
  suggestedAction: string;
}

export interface CashPressure {
  score: number; // 0-100, higher = more pressure
  upcomingBills: number;
  overdueReceivables: number;
  reserveLevel: "healthy" | "adequate" | "thin" | "critical";
  cashRunwayDays: number;
  tightestWindow: string; // "Next Tuesday"
  actions: string[];
}

export interface CapacitySignal {
  overloadedResources: string[];
  congestionPoints: string[];
  utilizationPercent: number;
  missedCommitments: number;
  teamGaps: string[];
}

export interface RetentionRisk {
  atRiskClients: { name: string; risk: "low" | "medium" | "high"; reason: string; value: number }[];
  churnProbability: number;
  neglectedCount: number;
  deliveryDelays: number;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  estimatedValue: number;
  confidence: number;
  source: string;
  timeframe: "immediate" | "short-term" | "medium-term";
  type: "upsell" | "cross-sell" | "new-channel" | "pricing" | "efficiency" | "expansion";
}

export interface BusinessHealthScore {
  overall: number; // 0-100
  revenue: number;
  margin: number;
  cash: number;
  capacity: number;
  retention: number;
  growth: number;
  trend: "improving" | "stable" | "declining";
  sparkline: number[]; // last 7 days
}

export interface ProfitabilityBrief {
  headline: string;
  executiveSummary: string;
  topLeaks: LeakItem[];
  cashPressure: CashPressure;
  capacitySignal: CapacitySignal;
  retentionRisk: RetentionRisk;
  opportunities: GrowthOpportunity[];
  healthScore: BusinessHealthScore;
  generatedAt: string;
}

// ── Revenue Leak Detection ─────────────────────────────────────

export function detectRevenueLeaks(context: {
  leads?: { id: string; name: string; value: number; lastActivity: number; status: string }[];
  invoices?: { id: string; amount: number; status: string; daysOverdue: number; customer: string }[];
  quotes?: { id: string; value: number; daysSinceSent: number; status: string }[];
}): LeakItem[] {
  const leaks: LeakItem[] = [];

  // Missed leads - leads going cold
  context.leads?.filter(l => l.lastActivity > 14 && l.status !== "closed").forEach(l => {
    leaks.push({
      id: `leak-lead-${l.id}`,
      type: "missed_lead",
      title: `${l.name} going cold`,
      description: `No contact for ${l.lastActivity} days — $${l.value.toLocaleString()} at risk`,
      estimatedLoss: l.value,
      severity: l.value > 10000 ? "critical" : l.value > 5000 ? "high" : "medium",
      daysOpen: l.lastActivity,
      actionable: true,
      suggestedAction: `Re-engage ${l.name} with a personalized follow-up`,
    });
  });

  // Overdue invoices
  context.invoices?.filter(i => i.status === "overdue" && i.daysOverdue > 0).forEach(i => {
    leaks.push({
      id: `leak-inv-${i.id}`,
      type: "overdue_invoice",
      title: `${i.customer} — $${i.amount.toLocaleString()} overdue`,
      description: `Invoice ${i.daysOverdue} days past due`,
      estimatedLoss: i.amount,
      severity: i.daysOverdue > 30 ? "critical" : i.daysOverdue > 14 ? "high" : "medium",
      daysOpen: i.daysOverdue,
      actionable: true,
      suggestedAction: `Send payment reminder to ${i.customer}`,
    });
  });

  // Stale quotes
  context.quotes?.filter(q => q.daysSinceSent > 7 && q.status === "sent").forEach(q => {
    leaks.push({
      id: `leak-quote-${q.id}`,
      type: "quote_delay",
      title: `Quote aging — $${q.value.toLocaleString()}`,
      description: `Sent ${q.daysSinceSent} days ago with no response`,
      estimatedLoss: q.value * 0.5,
      severity: q.daysSinceSent > 14 ? "high" : "medium",
      daysOpen: q.daysSinceSent,
      actionable: true,
      suggestedAction: "Follow up on quote with a check-in call",
    });
  });

  return leaks.sort((a, b) => b.estimatedLoss - a.estimatedLoss);
}

// ── Cash Awareness ─────────────────────────────────────────────

export function assessCashAwareness(context: {
  upcomingBills?: { amount: number; dueDate: string }[];
  overdueReceivables?: { amount: number; customer: string; daysOverdue: number }[];
  currentBalance?: number;
  monthlyBurn?: number;
}): CashPressure {
  const totalBills = context.upcomingBills?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalOverdue = context.overdueReceivables?.reduce((s, r) => s + r.amount, 0) ?? 0;
  const balance = context.currentBalance ?? 0;
  const burn = context.monthlyBurn ?? 1;
  const runway = Math.round((balance / burn) * 30);

  const reserveLevel = runway > 90 ? "healthy" : runway > 60 ? "adequate" : runway > 30 ? "thin" : "critical";
  const pressureScore = Math.min(100, Math.round((totalBills + totalOverdue) / Math.max(balance, 1) * 100));

  const actions: string[] = [];
  if (totalOverdue > 0) actions.push(`Collect $${totalOverdue.toLocaleString()} in overdue receivables`);
  if (reserveLevel === "thin" || reserveLevel === "critical") actions.push("Review non-essential spending");
  if (totalBills > balance * 0.5) actions.push("Prioritize bill payments by urgency");

  return {
    score: pressureScore,
    upcomingBills: totalBills,
    overdueReceivables: totalOverdue,
    reserveLevel,
    cashRunwayDays: runway,
    tightestWindow: "This week",
    actions,
  };
}

// ── Capacity Intelligence ──────────────────────────────────────

export function assessCapacityIntelligence(context: {
  totalTasks?: number;
  overdueTasks?: number;
  teamMembers?: number;
  blockedWorkflows?: number;
}): CapacitySignal {
  const tasks = context.totalTasks ?? 0;
  const overdue = context.overdueTasks ?? 0;
  const members = context.teamMembers ?? 1;
  const utilization = Math.min(100, Math.round((tasks / Math.max(members * 8, 1)) * 100));

  return {
    overloadedResources: utilization > 85 ? ["Primary operator"] : [],
    congestionPoints: (context.blockedWorkflows ?? 0) > 0 ? [`${context.blockedWorkflows} blocked workflows`] : [],
    utilizationPercent: utilization,
    missedCommitments: overdue,
    teamGaps: members < 2 && tasks > 20 ? ["Consider delegation or hiring"] : [],
  };
}

// ── Retention Risk ─────────────────────────────────────────────

export function assessRetentionRisk(context: {
  clients?: { name: string; lastContact: number; value: number; satisfaction?: number }[];
}): RetentionRisk {
  const atRisk = (context.clients ?? [])
    .filter(c => c.lastContact > 21 || (c.satisfaction !== undefined && c.satisfaction < 60))
    .map(c => ({
      name: c.name,
      risk: (c.lastContact > 30 ? "high" : "medium") as "low" | "medium" | "high",
      reason: c.lastContact > 21 ? `No contact for ${c.lastContact} days` : "Low satisfaction score",
      value: c.value,
    }));

  return {
    atRiskClients: atRisk,
    churnProbability: atRisk.length > 0 ? Math.min(100, atRisk.length * 15) : 0,
    neglectedCount: atRisk.filter(c => c.reason.includes("No contact")).length,
    deliveryDelays: 0,
  };
}

// ── Growth Opportunities ───────────────────────────────────────

export function assessGrowthOpportunity(context: {
  topClients?: { name: string; revenue: number; potential: number }[];
  leadSources?: { name: string; leads: number; conversion: number }[];
}): GrowthOpportunity[] {
  const opportunities: GrowthOpportunity[] = [];

  context.topClients?.filter(c => c.potential > c.revenue * 1.3).forEach((c, i) => {
    opportunities.push({
      id: `growth-upsell-${i}`,
      title: `Upsell ${c.name}`,
      estimatedValue: c.potential - c.revenue,
      confidence: 0.7,
      source: "Usage analysis",
      timeframe: "short-term",
      type: "upsell",
    });
  });

  context.leadSources?.filter(s => s.conversion > 0.3 && s.leads < 20).forEach((s, i) => {
    opportunities.push({
      id: `growth-channel-${i}`,
      title: `Scale ${s.name} channel`,
      estimatedValue: s.leads * 5000 * s.conversion,
      confidence: 0.65,
      source: "Channel analysis",
      timeframe: "medium-term",
      type: "new-channel",
    });
  });

  return opportunities.sort((a, b) => b.estimatedValue - a.estimatedValue);
}

// ── Composite Health Score ─────────────────────────────────────

export function computeBusinessHealthScore(
  leaks: LeakItem[],
  cash: CashPressure,
  capacity: CapacitySignal,
  retention: RetentionRisk,
  opportunities: GrowthOpportunity[],
): BusinessHealthScore {
  const revenueScore = Math.max(0, 100 - leaks.length * 12);
  const marginScore = Math.max(0, 100 - leaks.filter(l => l.type === "underpriced" || l.type === "subscription_waste").length * 20);
  const cashScore = Math.max(0, 100 - cash.score);
  const capacityScore = Math.max(0, 100 - (capacity.utilizationPercent > 85 ? 30 : 0) - capacity.missedCommitments * 10);
  const retentionScore = Math.max(0, 100 - retention.churnProbability);
  const growthScore = Math.min(100, 40 + opportunities.length * 12);

  const overall = Math.round((revenueScore + marginScore + cashScore + capacityScore + retentionScore + growthScore) / 6);

  return {
    overall,
    revenue: revenueScore,
    margin: marginScore,
    cash: cashScore,
    capacity: capacityScore,
    retention: retentionScore,
    growth: growthScore,
    trend: overall > 70 ? "improving" : overall > 50 ? "stable" : "declining",
    sparkline: [overall - 5, overall - 3, overall - 1, overall, overall + 1, overall - 2, overall],
  };
}

// ── Generate Full Brief ────────────────────────────────────────

export function generateProfitabilityBrief(context: {
  leads?: { id: string; name: string; value: number; lastActivity: number; status: string }[];
  invoices?: { id: string; amount: number; status: string; daysOverdue: number; customer: string }[];
  quotes?: { id: string; value: number; daysSinceSent: number; status: string }[];
  upcomingBills?: { amount: number; dueDate: string }[];
  overdueReceivables?: { amount: number; customer: string; daysOverdue: number }[];
  currentBalance?: number;
  monthlyBurn?: number;
  totalTasks?: number;
  overdueTasks?: number;
  teamMembers?: number;
  blockedWorkflows?: number;
  clients?: { name: string; lastContact: number; value: number; satisfaction?: number }[];
  topClients?: { name: string; revenue: number; potential: number }[];
  leadSources?: { name: string; leads: number; conversion: number }[];
}): ProfitabilityBrief {
  const leaks = detectRevenueLeaks(context);
  const cash = assessCashAwareness(context);
  const capacity = assessCapacityIntelligence(context);
  const retention = assessRetentionRisk(context);
  const opportunities = assessGrowthOpportunity(context);
  const health = computeBusinessHealthScore(leaks, cash, capacity, retention, opportunities);

  const totalAtRisk = leaks.reduce((s, l) => s + l.estimatedLoss, 0);
  const totalOpportunity = opportunities.reduce((s, o) => s + o.estimatedValue, 0);

  return {
    headline: health.overall > 70
      ? "Business is healthy — protect momentum"
      : health.overall > 50
        ? "Business needs attention — action required"
        : "Business under pressure — immediate action needed",
    executiveSummary: `$${totalAtRisk.toLocaleString()} at risk across ${leaks.length} leak${leaks.length !== 1 ? "s" : ""}. $${totalOpportunity.toLocaleString()} in growth opportunities identified. Cash runway: ${cash.cashRunwayDays} days. ${retention.atRiskClients.length} client${retention.atRiskClients.length !== 1 ? "s" : ""} at risk.`,
    topLeaks: leaks.slice(0, 5),
    cashPressure: cash,
    capacitySignal: capacity,
    retentionRisk: retention,
    opportunities: opportunities.slice(0, 5),
    healthScore: health,
    generatedAt: new Date().toISOString(),
  };
}
