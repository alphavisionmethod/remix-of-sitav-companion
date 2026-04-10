// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Debt Analyzer Service
// Deterministic debt payoff engine: avalanche, snowball, hybrid
// Interest drag, utilization scoring, debt-to-income ratio
// ═══════════════════════════════════════════════════════════════

import type { DebtAccount, DebtProfile, PayoffPlan, PayoffMilestone, CreditScorePulse, CreditFactor } from "@/packages/finance-contracts";

export function computeDebtProfile(
  accounts: DebtAccount[],
  monthlyIncomeCents: number,
  extraPaymentCents: number = 0
): DebtProfile {
  const totalDebt = accounts.reduce((s, a) => s + a.balanceCents, 0);
  const totalMinPayment = accounts.reduce((s, a) => s + a.minimumPaymentCents, 0);
  const totalLimit = accounts.reduce((s, a) => s + (a.limitCents || a.balanceCents), 0);
  const weightedRate = totalDebt > 0
    ? accounts.reduce((s, a) => s + a.interestRate * (a.balanceCents / totalDebt), 0)
    : 0;
  const utilization = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0;
  const dti = monthlyIncomeCents > 0 ? (totalMinPayment / monthlyIncomeCents) * 100 : 0;
  const interestDrag = accounts.reduce((s, a) => s + Math.round(a.balanceCents * (a.interestRate / 100 / 12)), 0);

  const avalanchePlan = buildPayoffPlan(accounts, totalMinPayment + extraPaymentCents, "avalanche");
  const snowballPlan = buildPayoffPlan(accounts, totalMinPayment + extraPaymentCents, "snowball");
  const bestPlan = avalanchePlan.totalInterestSavedCents >= snowballPlan.totalInterestSavedCents ? avalanchePlan : snowballPlan;

  const creditPulse = estimateCreditScore(accounts, utilization, dti);

  const lastMilestone = bestPlan.milestones[bestPlan.milestones.length - 1];
  const projectedPayoffDate = lastMilestone?.payoffDate || new Date(Date.now() + bestPlan.projectedMonths * 30 * 86400000).toISOString();

  return {
    totalDebtCents: totalDebt,
    totalMinimumPaymentCents: totalMinPayment,
    weightedAvgInterestRate: Math.round(weightedRate * 100) / 100,
    debtToIncomeRatio: Math.round(dti * 100) / 100,
    utilizationPercent: Math.round(utilization * 100) / 100,
    accounts,
    payoffPlan: bestPlan,
    projectedPayoffDate,
    interestDragMonthlyCents: interestDrag,
    creditScorePulse: creditPulse,
  };
}

function buildPayoffPlan(
  accounts: DebtAccount[],
  monthlyBudgetCents: number,
  strategy: "avalanche" | "snowball" | "hybrid"
): PayoffPlan {
  // Sort accounts by strategy
  const sorted = [...accounts].sort((a, b) => {
    if (strategy === "avalanche") return b.interestRate - a.interestRate;
    if (strategy === "snowball") return a.balanceCents - b.balanceCents;
    // Hybrid: high-interest first but prioritize small balances under $500
    const aSmall = a.balanceCents < 50000 ? -1 : 0;
    const bSmall = b.balanceCents < 50000 ? -1 : 0;
    if (aSmall !== bSmall) return aSmall - bSmall;
    return b.interestRate - a.interestRate;
  });

  const balances = new Map(sorted.map(a => [a.id, a.balanceCents]));
  const milestones: PayoffMilestone[] = [];
  const totalPaid = new Map(sorted.map(a => [a.id, 0]));
  const interestPaid = new Map(sorted.map(a => [a.id, 0]));
  let month = 0;
  const maxMonths = 600; // 50 years cap

  while (month < maxMonths) {
    const remaining = sorted.filter(a => (balances.get(a.id) ?? 0) > 0);
    if (remaining.length === 0) break;
    month++;

    // Apply interest
    for (const a of remaining) {
      const bal = balances.get(a.id)!;
      const interest = Math.round(bal * (a.interestRate / 100 / 12));
      balances.set(a.id, bal + interest);
      interestPaid.set(a.id, (interestPaid.get(a.id) ?? 0) + interest);
    }

    // Pay minimums first
    let budgetLeft = monthlyBudgetCents;
    for (const a of remaining) {
      const bal = balances.get(a.id)!;
      const payment = Math.min(a.minimumPaymentCents, bal, budgetLeft);
      balances.set(a.id, bal - payment);
      totalPaid.set(a.id, (totalPaid.get(a.id) ?? 0) + payment);
      budgetLeft -= payment;
    }

    // Extra goes to priority account
    if (budgetLeft > 0) {
      const target = remaining[0];
      const bal = balances.get(target.id)!;
      const extra = Math.min(budgetLeft, bal);
      balances.set(target.id, bal - extra);
      totalPaid.set(target.id, (totalPaid.get(target.id) ?? 0) + extra);
    }

    // Check for payoffs
    for (const a of remaining) {
      if ((balances.get(a.id) ?? 0) <= 0) {
        milestones.push({
          accountId: a.id,
          accountName: a.name,
          payoffDate: new Date(Date.now() + month * 30 * 86400000).toISOString(),
          totalPaidCents: totalPaid.get(a.id) ?? 0,
          interestPaidCents: interestPaid.get(a.id) ?? 0,
        });
      }
    }
  }

  // Interest saved = baseline (min payment only) - actual
  const baselineInterest = accounts.reduce((s, a) => {
    const months = a.interestRate > 0 ? Math.ceil(a.balanceCents / Math.max(a.minimumPaymentCents - Math.round(a.balanceCents * a.interestRate / 100 / 12), 1)) : 0;
    return s + Math.round(a.balanceCents * (a.interestRate / 100 / 12)) * Math.min(months, 360);
  }, 0);
  const actualInterest = Array.from(interestPaid.values()).reduce((s, v) => s + v, 0);

  return {
    strategy,
    monthlyBudgetCents,
    totalInterestSavedCents: Math.max(0, baselineInterest - actualInterest),
    payoffOrder: milestones.map(m => m.accountId),
    projectedMonths: month,
    milestones,
  };
}

function estimateCreditScore(
  accounts: DebtAccount[],
  utilization: number,
  dti: number
): CreditScorePulse {
  const factors: CreditFactor[] = [];
  let score = 700;

  // Utilization factor (30% weight)
  if (utilization < 10) {
    score += 40;
    factors.push({ name: "Credit Utilization", impact: "positive", weight: 0.3, description: `Excellent utilization at ${utilization.toFixed(0)}%` });
  } else if (utilization < 30) {
    score += 15;
    factors.push({ name: "Credit Utilization", impact: "positive", weight: 0.3, description: `Good utilization at ${utilization.toFixed(0)}%` });
  } else if (utilization < 50) {
    factors.push({ name: "Credit Utilization", impact: "neutral", weight: 0.3, description: `Fair utilization at ${utilization.toFixed(0)}%` });
  } else {
    score -= 40;
    factors.push({ name: "Credit Utilization", impact: "negative", weight: 0.3, description: `High utilization at ${utilization.toFixed(0)}% — aim for under 30%` });
  }

  // DTI factor
  if (dti < 20) {
    score += 20;
    factors.push({ name: "Debt-to-Income", impact: "positive", weight: 0.15, description: `Low DTI at ${dti.toFixed(0)}%` });
  } else if (dti < 36) {
    factors.push({ name: "Debt-to-Income", impact: "neutral", weight: 0.15, description: `Manageable DTI at ${dti.toFixed(0)}%` });
  } else {
    score -= 30;
    factors.push({ name: "Debt-to-Income", impact: "negative", weight: 0.15, description: `High DTI at ${dti.toFixed(0)}% — above 36% threshold` });
  }

  // Account mix
  const types = new Set(accounts.map(a => a.type));
  if (types.size >= 3) {
    score += 15;
    factors.push({ name: "Account Mix", impact: "positive", weight: 0.1, description: `Diverse credit mix with ${types.size} account types` });
  } else {
    factors.push({ name: "Account Mix", impact: "neutral", weight: 0.1, description: `${types.size} account type(s) — more diversity helps` });
  }

  // AutoPay factor
  const autoPayPct = accounts.length > 0 ? accounts.filter(a => a.isAutoPay).length / accounts.length * 100 : 100;
  if (autoPayPct === 100) {
    score += 10;
    factors.push({ name: "Payment Automation", impact: "positive", weight: 0.05, description: "All accounts on autopay — great payment consistency" });
  } else {
    factors.push({ name: "Payment Automation", impact: "neutral", weight: 0.05, description: `${autoPayPct.toFixed(0)}% on autopay — consider enabling for all` });
  }

  const trend = utilization < 30 && dti < 25 ? "improving" : utilization > 50 ? "declining" : "stable";

  return {
    estimatedScore: Math.max(300, Math.min(850, score)),
    trend,
    factors,
    lastUpdated: new Date().toISOString(),
  };
}

export function simulateDebtPayoff(
  accounts: DebtAccount[],
  strategy: "avalanche" | "snowball" | "hybrid",
  extraMonthlyCents: number
): PayoffPlan {
  const totalMin = accounts.reduce((s, a) => s + a.minimumPaymentCents, 0);
  return buildPayoffPlan(accounts, totalMin + extraMonthlyCents, strategy);
}
