// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS Domain Engine
// Pure deterministic functions for business intelligence
// Canonical types: @/packages/contracts/domain-types/business-engine
// ═══════════════════════════════════════════════════════════════

import type {
  BusinessLead,
  Customer,
  PipelineOpportunity,
  BusinessHealthResult,
  BusinessRisk,
  BusinessOpportunity,
  PipelineAnalysis,
  LeadScoreResult,
  RevenueForeccast,
  FollowUpItem,
  ClientHealthResult,
} from "@/packages/contracts";

// Re-export canonical types for consumers
export type {
  BusinessLead,
  Customer,
  PipelineOpportunity,
  BusinessHealthResult,
  BusinessRisk,
  BusinessOpportunity,
  PipelineAnalysis,
  LeadScoreResult,
  RevenueForeccast,
  FollowUpItem,
  ClientHealthResult,
};

// ── Business Health Assessment ──────────────────────────────────

export function assessBusinessHealth(
  customers: Customer[],
  pipeline: PipelineOpportunity[],
  revenueHistory: number[],   // last 6 months
  operationalMetrics?: { openTasks: number; overdueTasks: number; activeWorkflows: number; failedWorkflows: number }
): BusinessHealthResult {
  const customerHealth = customers.length > 0
    ? Math.round(customers.reduce((sum, c) => sum + (c.healthScore ?? assessClientHealth(c).healthScore), 0) / customers.length)
    : 50;

  const pipelineAnalysis = analyzePipeline(pipeline);
  const pipelineHealth = pipelineAnalysis.velocityScore;

  const revenueHealth = revenueHistory.length >= 2
    ? Math.min(100, Math.max(0, Math.round(50 + (revenueHistory[revenueHistory.length - 1] - revenueHistory[0]) / Math.max(1, revenueHistory[0]) * 100)))
    : 50;

  const operationalHealth = operationalMetrics
    ? Math.max(0, 100 - (operationalMetrics.overdueTasks * 5) - (operationalMetrics.failedWorkflows * 10))
    : 70;

  const overallScore = Math.round(
    customerHealth * 0.3 +
    pipelineHealth * 0.25 +
    revenueHealth * 0.25 +
    operationalHealth * 0.2
  );

  const risks: BusinessRisk[] = [];
  const opportunities: BusinessOpportunity[] = [];

  // Risk detection
  const atRiskCustomers = customers.filter(c => c.status === "at-risk" || c.overdueInvoices > 0);
  if (atRiskCustomers.length > 0) {
    risks.push({
      type: "customer-churn",
      severity: atRiskCustomers.length > 3 ? "critical" : "high",
      description: `${atRiskCustomers.length} customer(s) at risk of churn`,
      suggestedAction: "Review at-risk accounts and schedule retention outreach",
    });
  }

  if (pipelineAnalysis.staleDealCount > 0) {
    risks.push({
      type: "stale-pipeline",
      severity: pipelineAnalysis.staleDealCount > 5 ? "high" : "medium",
      description: `${pipelineAnalysis.staleDealCount} deal(s) stale in pipeline`,
      suggestedAction: "Review stale deals — advance, re-engage, or disqualify",
    });
  }

  if (revenueHealth < 40) {
    risks.push({
      type: "revenue-decline",
      severity: revenueHealth < 20 ? "critical" : "high",
      description: "Revenue trend is declining",
      suggestedAction: "Analyze revenue drivers and accelerate pipeline conversion",
    });
  }

  // Opportunity detection
  const highValueLeadsInPipeline = pipeline.filter(p => p.valueCents > 50000_00 && p.probability > 0.5);
  if (highValueLeadsInPipeline.length > 0) {
    opportunities.push({
      type: "high-value-deals",
      potential: "high",
      description: `${highValueLeadsInPipeline.length} high-value deal(s) with >50% probability`,
      estimatedValue: highValueLeadsInPipeline.reduce((s, p) => s + p.valueCents / 100, 0),
      suggestedAction: "Prioritize closing these deals this period",
    });
  }

  const summary = overallScore >= 80 ? "Business health is strong across all dimensions."
    : overallScore >= 60 ? "Business health is stable with some areas needing attention."
    : overallScore >= 40 ? "Business health needs improvement — review risks and pipeline."
    : "Business health is critical — immediate attention required.";

  return { overallScore, revenueHealth, pipelineHealth, customerHealth, operationalHealth, risks, opportunities, summary };
}

// ── Pipeline Analysis ───────────────────────────────────────────

export function analyzePipeline(opportunities: PipelineOpportunity[]): PipelineAnalysis {
  const stageBreakdown: PipelineAnalysis["stageBreakdown"] = {};
  let totalValue = 0;
  let weightedValue = 0;
  let totalDays = 0;
  let staleDealCount = 0;
  const wonCount = opportunities.filter(o => o.stage === "won").length;
  const closedCount = opportunities.filter(o => o.stage === "won" || o.stage === "lost").length;

  for (const opp of opportunities) {
    const val = opp.valueCents / 100;
    totalValue += val;
    weightedValue += val * opp.probability;
    totalDays += opp.daysInStage;

    if (!stageBreakdown[opp.stage]) {
      stageBreakdown[opp.stage] = { count: 0, value: 0, weighted: 0 };
    }
    stageBreakdown[opp.stage].count++;
    stageBreakdown[opp.stage].value += val;
    stageBreakdown[opp.stage].weighted += val * opp.probability;

    if (opp.lastActivityDays > 14 && opp.stage !== "won" && opp.stage !== "lost") {
      staleDealCount++;
    }
  }

  const avgDaysInPipeline = opportunities.length > 0 ? Math.round(totalDays / opportunities.length) : 0;
  const conversionRate = closedCount > 0 ? wonCount / closedCount : 0;

  // Velocity score: higher is better — fast movement, low stale ratio, good conversion
  const staleRatio = opportunities.length > 0 ? staleDealCount / opportunities.length : 0;
  const velocityScore = Math.min(100, Math.max(0, Math.round(
    (conversionRate * 40) +
    (Math.max(0, 1 - staleRatio) * 30) +
    (Math.max(0, 1 - avgDaysInPipeline / 90) * 30)
  )));

  const healthIndicator: PipelineAnalysis["healthIndicator"] =
    velocityScore >= 70 ? "healthy" :
    velocityScore >= 50 ? "sluggish" :
    velocityScore >= 30 ? "at-risk" : "critical";

  return { totalValue, weightedValue, stageBreakdown, staleDealCount, avgDaysInPipeline, conversionRate, velocityScore, healthIndicator };
}

// ── Lead Scoring ────────────────────────────────────────────────

export function scoreLead(lead: BusinessLead): LeadScoreResult {
  // Weights: engagement 30%, recency 25%, fit 25%, value 20%
  const engagementWeight = Math.min(100, lead.engagementScore) * 0.30;
  const recencyWeight = Math.max(0, 100 - lead.recencyDays * 3) * 0.25;
  const fitWeight = Math.min(100, lead.fitScore) * 0.25;
  const valueNormalized = Math.min(100, (lead.estimatedValue / 100000) * 100);
  const valueWeight = valueNormalized * 0.20;

  const totalScore = Math.round(engagementWeight + recencyWeight + fitWeight + valueWeight);

  const tier: LeadScoreResult["tier"] =
    totalScore >= 75 ? "hot" :
    totalScore >= 50 ? "warm" :
    totalScore >= 25 ? "cool" : "cold";

  const suggestedAction =
    tier === "hot" ? "Schedule call immediately — high conversion probability"
    : tier === "warm" ? "Send personalized follow-up within 48 hours"
    : tier === "cool" ? "Add to nurture sequence"
    : "Monitor — not ready for direct outreach";

  return { totalScore, engagementWeight, recencyWeight, fitWeight, valueWeight, tier, suggestedAction };
}

// ── Revenue Forecasting ────────────────────────────────────────

export function forecastRevenue(revenueHistory: number[]): RevenueForeccast {
  if (revenueHistory.length < 2) {
    const last = revenueHistory[0] ?? 0;
    return { currentMonthProjected: last, nextMonthProjected: last, quarterProjected: last * 3, trend: "stable", confidence: 0.2, dataPoints: revenueHistory.length };
  }

  // Simple linear regression
  const n = revenueHistory.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += revenueHistory[i];
    sumXY += i * revenueHistory[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const currentMonthProjected = Math.max(0, Math.round(intercept + slope * n));
  const nextMonthProjected = Math.max(0, Math.round(intercept + slope * (n + 1)));
  const quarterProjected = Math.max(0, Math.round(
    (intercept + slope * n) + (intercept + slope * (n + 1)) + (intercept + slope * (n + 2))
  ));

  const trend: RevenueForeccast["trend"] =
    slope > 0.02 * (sumY / n) ? "growing" :
    slope < -0.02 * (sumY / n) ? "declining" : "stable";

  // Confidence based on data points and R²
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (revenueHistory[i] - yMean) ** 2;
    const predicted = intercept + slope * i;
    ssRes += (revenueHistory[i] - predicted) ** 2;
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const confidence = Math.min(1, Math.max(0.1, r2 * 0.7 + Math.min(n / 12, 1) * 0.3));

  return { currentMonthProjected, nextMonthProjected, quarterProjected, trend, confidence, dataPoints: n };
}

// ── Follow-Up Identification ────────────────────────────────────

export function identifyFollowUps(
  leads: BusinessLead[],
  customers: Customer[],
  opportunities: PipelineOpportunity[]
): FollowUpItem[] {
  const items: FollowUpItem[] = [];

  // Leads needing follow-up
  for (const lead of leads) {
    if (lead.status === "lost") continue;
    if (lead.recencyDays > 7) {
      const urgency: FollowUpItem["urgency"] =
        lead.recencyDays > 30 ? "immediate" :
        lead.recencyDays > 14 ? "today" :
        lead.recencyDays > 7 ? "this-week" : "next-week";
      items.push({
        entityId: lead.id,
        entityType: "lead",
        entityName: lead.name,
        urgency,
        reason: `No contact in ${lead.recencyDays} days`,
        suggestedAction: scoreLead(lead).suggestedAction,
        daysSinceLastContact: lead.recencyDays,
      });
    }
  }

  // Customers needing attention
  for (const customer of customers) {
    if (customer.overdueInvoices > 0) {
      items.push({
        entityId: customer.id,
        entityType: "customer",
        entityName: customer.name,
        urgency: customer.overdueInvoices > 2 ? "immediate" : "today",
        reason: `${customer.overdueInvoices} overdue invoice(s)`,
        suggestedAction: "Review overdue invoices and initiate collections workflow",
        daysSinceLastContact: customer.lastInteractionDays,
      });
    }
    if (customer.lastInteractionDays > 30 && customer.status === "active") {
      items.push({
        entityId: customer.id,
        entityType: "customer",
        entityName: customer.name,
        urgency: customer.lastInteractionDays > 60 ? "today" : "this-week",
        reason: `No interaction in ${customer.lastInteractionDays} days`,
        suggestedAction: "Schedule check-in to maintain relationship health",
        daysSinceLastContact: customer.lastInteractionDays,
      });
    }
  }

  // Stale opportunities
  for (const opp of opportunities) {
    if (opp.stage === "won" || opp.stage === "lost") continue;
    if (opp.lastActivityDays > 14) {
      items.push({
        entityId: opp.id,
        entityType: "opportunity",
        entityName: opp.name,
        urgency: opp.lastActivityDays > 30 ? "immediate" : "this-week",
        reason: `No activity in ${opp.lastActivityDays} days — deal may go cold`,
        suggestedAction: "Re-engage or disqualify to keep pipeline accurate",
        daysSinceLastContact: opp.lastActivityDays,
      });
    }
  }

  // Sort by urgency
  const urgencyOrder = { immediate: 0, today: 1, "this-week": 2, "next-week": 3 };
  items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return items;
}

// ── Client Health Assessment ────────────────────────────────────

export function assessClientHealth(customer: Customer): ClientHealthResult {
  const factors: ClientHealthResult["factors"] = [];

  // Revenue factor (0-30 points)
  const revScore = Math.min(30, customer.totalRevenue / 1000);
  factors.push({ factor: "Revenue contribution", impact: revScore, direction: "positive" });

  // Payment reliability (-20 to +20)
  const payReliability = customer.avgPayDays <= 30 ? 20 : customer.avgPayDays <= 60 ? 10 : -10;
  factors.push({ factor: "Payment reliability", impact: Math.abs(payReliability), direction: payReliability >= 0 ? "positive" : "negative" });

  // Overdue penalty (-30 per overdue)
  if (customer.overdueInvoices > 0) {
    factors.push({ factor: "Overdue invoices", impact: customer.overdueInvoices * 15, direction: "negative" });
  }

  // Engagement recency
  const recencyScore = customer.lastInteractionDays <= 7 ? 20 : customer.lastInteractionDays <= 30 ? 10 : -5;
  factors.push({ factor: "Recent engagement", impact: Math.abs(recencyScore), direction: recencyScore >= 0 ? "positive" : "negative" });

  const healthScore = Math.min(100, Math.max(0,
    50 + revScore + payReliability - (customer.overdueInvoices * 15) + recencyScore
  ));

  const churnRisk = Math.min(1, Math.max(0, (100 - healthScore) / 100));

  const revenueAtRisk = churnRisk > 0.3 ? customer.totalRevenue : 0;

  const suggestedAction =
    healthScore >= 80 ? "Continue current engagement — healthy relationship"
    : healthScore >= 60 ? "Schedule proactive check-in to strengthen relationship"
    : healthScore >= 40 ? "Escalate to account manager — needs immediate attention"
    : "Critical retention risk — executive outreach recommended";

  return { id: customer.id, name: customer.name, healthScore, churnRisk, revenueAtRisk, factors, suggestedAction };
}
