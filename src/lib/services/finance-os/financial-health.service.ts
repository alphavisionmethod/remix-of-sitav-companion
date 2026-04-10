// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Financial Health Score Service
// Composite health scoring from all money dimensions
// ═══════════════════════════════════════════════════════════════

import type { FinancialHealthScore, HealthDimension, HealthActionItem, FounderBoundaryAlert } from "@/packages/finance-contracts";

interface HealthInputs {
  safeToSpendCents: number;
  monthlyIncomeCents: number;
  totalDebtCents: number;
  debtToIncomeRatio: number;
  creditUtilization: number;
  billsCoveredPct: number;
  reserveFundedPct: number;
  savingsRatePct: number;
  recurringBurdenPct: number;
  taxReservedPct: number;
  wasteSubscriptionCount: number;
  overdueReceivablesCents: number;
  personalInBusinessCents?: number;
  businessInPersonalCents?: number;
}

const DIMENSION_WEIGHTS: Record<string, number> = {
  safeToSpend: 0.15,
  debtPressure: 0.12,
  billCoverage: 0.12,
  cashStability: 0.10,
  savingsProgress: 0.10,
  creditUtilization: 0.10,
  recurringBurden: 0.08,
  spendingDiscipline: 0.08,
  taxPreparedness: 0.08,
  reserveHealth: 0.07,
};

export function computeFinancialHealth(inputs: HealthInputs): FinancialHealthScore {
  const dimensions: HealthDimension[] = [];

  // 1. Safe-to-Spend
  const s2sRatio = inputs.monthlyIncomeCents > 0 ? inputs.safeToSpendCents / inputs.monthlyIncomeCents : 0;
  const s2sScore = Math.min(100, Math.round(s2sRatio * 300));
  dimensions.push(dim("safeToSpend", "Safe to Spend", s2sScore, 0.15,
    s2sScore >= 70 ? "Healthy discretionary room" : "Low discretionary spending room — review obligations"));

  // 2. Debt Pressure
  const debtScore = inputs.debtToIncomeRatio < 10 ? 95 : inputs.debtToIncomeRatio < 20 ? 80 : inputs.debtToIncomeRatio < 36 ? 60 : inputs.debtToIncomeRatio < 50 ? 35 : 15;
  dimensions.push(dim("debtPressure", "Debt Pressure", debtScore, 0.12,
    debtScore >= 70 ? "Debt load manageable" : "High debt-to-income — consider accelerated payoff"));

  // 3. Bill Coverage
  const billScore = Math.min(100, Math.round(inputs.billsCoveredPct));
  dimensions.push(dim("billCoverage", "Bill Coverage", billScore, 0.12,
    billScore >= 95 ? "All bills covered" : "Some bills at risk — check upcoming due dates"));

  // 4. Cash Stability
  const cashScore = inputs.safeToSpendCents > inputs.monthlyIncomeCents * 0.5 ? 90 :
    inputs.safeToSpendCents > inputs.monthlyIncomeCents * 0.2 ? 65 : 30;
  dimensions.push(dim("cashStability", "Cash Stability", cashScore, 0.10,
    cashScore >= 70 ? "Stable cash position" : "Cash position tight — build buffer"));

  // 5. Savings Progress
  const savScore = inputs.savingsRatePct >= 20 ? 95 : inputs.savingsRatePct >= 10 ? 75 : inputs.savingsRatePct >= 5 ? 50 : 20;
  dimensions.push(dim("savingsProgress", "Savings Rate", savScore, 0.10,
    `Saving ${inputs.savingsRatePct.toFixed(0)}% of income`));

  // 6. Credit Utilization
  const creditScore = inputs.creditUtilization < 10 ? 95 : inputs.creditUtilization < 30 ? 80 : inputs.creditUtilization < 50 ? 55 : 25;
  dimensions.push(dim("creditUtilization", "Credit Utilization", creditScore, 0.10,
    inputs.creditUtilization < 30 ? "Healthy credit usage" : "High utilization — impacts credit score"));

  // 7. Recurring Burden
  const recurScore = inputs.recurringBurdenPct < 40 ? 90 : inputs.recurringBurdenPct < 60 ? 65 : inputs.recurringBurdenPct < 80 ? 40 : 15;
  dimensions.push(dim("recurringBurden", "Recurring Burden", recurScore, 0.08,
    `${inputs.recurringBurdenPct.toFixed(0)}% of income is recurring`));

  // 8. Spending Discipline
  const wasteScore = inputs.wasteSubscriptionCount === 0 ? 95 : inputs.wasteSubscriptionCount <= 2 ? 75 : inputs.wasteSubscriptionCount <= 5 ? 50 : 25;
  dimensions.push(dim("spendingDiscipline", "Spending Discipline", wasteScore, 0.08,
    inputs.wasteSubscriptionCount > 0 ? `${inputs.wasteSubscriptionCount} waste subscriptions detected` : "No waste detected"));

  // 9. Tax Preparedness
  const taxScore = inputs.taxReservedPct >= 90 ? 95 : inputs.taxReservedPct >= 60 ? 70 : inputs.taxReservedPct >= 30 ? 45 : 15;
  dimensions.push(dim("taxPreparedness", "Tax Preparedness", taxScore, 0.08,
    `${inputs.taxReservedPct.toFixed(0)}% of estimated tax obligation reserved`));

  // 10. Reserve Health
  const resScore = Math.min(100, Math.round(inputs.reserveFundedPct));
  dimensions.push(dim("reserveHealth", "Reserve Health", resScore, 0.07,
    resScore >= 80 ? "Reserves well-funded" : "Reserve gaps detected — prioritize funding"));

  // Composite
  const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score * d.weight, 0));
  const grade = overallScore >= 95 ? "A+" : overallScore >= 85 ? "A" : overallScore >= 78 ? "B+" :
    overallScore >= 70 ? "B" : overallScore >= 62 ? "C+" : overallScore >= 50 ? "C" : overallScore >= 35 ? "D" : "F";

  // Action items
  const actionItems: HealthActionItem[] = [];
  dimensions.filter(d => d.score < 60).sort((a, b) => a.score - b.score).slice(0, 5).forEach(d => {
    actionItems.push({
      priority: d.score < 30 ? "high" : d.score < 50 ? "medium" : "low",
      category: d.key,
      title: `Improve ${d.label}`,
      description: d.insight,
      potentialImpact: Math.round((80 - d.score) * d.weight),
    });
  });

  // Founder boundary
  let founderBoundary: FounderBoundaryAlert | undefined;
  if (inputs.personalInBusinessCents !== undefined || inputs.businessInPersonalCents !== undefined) {
    const pib = inputs.personalInBusinessCents ?? 0;
    const bip = inputs.businessInPersonalCents ?? 0;
    const violations: string[] = [];
    if (pib > 0) violations.push(`$${(pib / 100).toLocaleString()} personal expenses in business accounts`);
    if (bip > 0) violations.push(`$${(bip / 100).toLocaleString()} business expenses in personal accounts`);
    const totalComingle = pib + bip;
    const risk = totalComingle > 100000 ? "critical" : totalComingle > 50000 ? "high" : totalComingle > 10000 ? "medium" : "low";
    founderBoundary = { comingled: totalComingle > 0, personalInBusiness: pib, businessInPersonal: bip, riskLevel: risk, violations };
  }

  return {
    overallScore,
    grade,
    dimensions,
    trend: overallScore >= 70 ? "improving" : overallScore >= 45 ? "stable" : "declining",
    trendDelta: 0,
    generatedAt: new Date().toISOString(),
    actionItems,
    founderBoundary,
  };
}

function dim(key: string, label: string, score: number, weight: number, insight: string): HealthDimension {
  const status = score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "fair" : score >= 30 ? "poor" : "critical";
  return { key, label, score, weight, status, insight };
}
