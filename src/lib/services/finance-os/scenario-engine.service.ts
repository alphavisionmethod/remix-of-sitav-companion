// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Scenario Engine Service
// What-if projection engine for financial planning
// ═══════════════════════════════════════════════════════════════

import type { ScenarioInput, ScenarioOutput } from "@/packages/finance-contracts";

interface ScenarioContext {
  monthlyIncomeCents: number;
  monthlyExpensesCents: number;
  safeToSpendCents: number;
  reservesCents: number;
  monthlyBurn: number;
  subscriptionsCostCents: number;
  debtPaymentsCents: number;
}

export function runScenario(input: ScenarioInput, ctx: ScenarioContext): ScenarioOutput {
  const months = 12;
  const baseline: number[] = [];
  const projected: number[] = [];

  let baseCash = ctx.safeToSpendCents;
  let projCash = ctx.safeToSpendCents;
  let monthlyDelta = 0;

  switch (input.type) {
    case "cut-subscription": {
      monthlyDelta = input.parameters.monthlySavingsCents || 0;
      break;
    }
    case "increase-savings": {
      const pct = (input.parameters.increasePercent || 10) / 100;
      monthlyDelta = -Math.round(ctx.monthlyIncomeCents * pct); // negative = less to spend, more saved
      break;
    }
    case "revenue-change": {
      const changePct = (input.parameters.changePercent || 0) / 100;
      monthlyDelta = Math.round(ctx.monthlyIncomeCents * changePct);
      break;
    }
    case "debt-payoff": {
      const extraPayment = input.parameters.extraMonthlyCents || 0;
      const interestSaved = input.parameters.monthlyInterestSavedCents || 0;
      monthlyDelta = interestSaved - extraPayment;
      break;
    }
    case "hire": {
      monthlyDelta = -(input.parameters.monthlySalaryCents || 0);
      break;
    }
    case "custom": {
      monthlyDelta = input.parameters.monthlyImpactCents || 0;
      break;
    }
  }

  const monthlyNet = ctx.monthlyIncomeCents - ctx.monthlyExpensesCents;

  for (let m = 0; m < months; m++) {
    baseCash += monthlyNet;
    projCash += monthlyNet + monthlyDelta;
    baseline.push(baseCash);
    projected.push(projCash);
  }

  const baselineRunway = monthlyNet > 0 ? 999 : ctx.reservesCents / Math.abs(monthlyNet || 1);
  const projectedNet = monthlyNet + monthlyDelta;
  const projectedRunway = projectedNet > 0 ? 999 : ctx.reservesCents / Math.abs(projectedNet || 1);
  const runwayChange = Math.round((projectedRunway - baselineRunway) * 10) / 10;

  const riskLevel = projectedNet < 0 && projectedRunway < 3 ? "high" :
    projectedNet < 0 ? "moderate" : "low";

  const tradeoffs: string[] = [];
  const recommendations: string[] = [];

  if (monthlyDelta > 0) {
    tradeoffs.push(`+$${(monthlyDelta / 100).toLocaleString()}/mo additional cashflow`);
  } else if (monthlyDelta < 0) {
    tradeoffs.push(`-$${(Math.abs(monthlyDelta) / 100).toLocaleString()}/mo reduced cashflow`);
  }

  if (input.type === "cut-subscription" && monthlyDelta > 0) {
    recommendations.push(`Cutting saves $${((monthlyDelta * 12) / 100).toLocaleString()}/year`);
  }
  if (input.type === "hire" && riskLevel === "high") {
    recommendations.push("Consider part-time or contractor to reduce burn risk");
  }
  if (riskLevel === "moderate") {
    recommendations.push("Build additional reserve buffer before this change");
  }

  const annualImpact = monthlyDelta * 12;
  const projSafe = ctx.safeToSpendCents + monthlyDelta;

  return {
    scenarioId: input.id,
    scenarioName: input.name,
    baselineCashflow: baseline,
    projectedCashflow: projected,
    baselineSafeToSpend: ctx.safeToSpendCents,
    projectedSafeToSpend: Math.max(0, projSafe),
    netImpactMonthlyCents: monthlyDelta,
    netImpactAnnualCents: annualImpact,
    runwayChangeMonths: isFinite(runwayChange) ? runwayChange : 0,
    riskLevel,
    tradeoffs,
    recommendations,
    confidenceScore: 0.85,
  };
}

/** Generate preset scenarios from context */
export function generatePresetScenarios(ctx: ScenarioContext): ScenarioInput[] {
  return [
    {
      id: "preset-cut-subs",
      name: "Cancel waste subscriptions",
      type: "cut-subscription",
      parameters: { monthlySavingsCents: Math.round(ctx.subscriptionsCostCents * 0.3) },
      description: "Cancel flagged waste subscriptions",
    },
    {
      id: "preset-save-10",
      name: "Increase savings 10%",
      type: "increase-savings",
      parameters: { increasePercent: 10 },
      description: "Redirect 10% of income to savings",
    },
    {
      id: "preset-revenue-drop",
      name: "Revenue drops 20%",
      type: "revenue-change",
      parameters: { changePercent: -20 },
      description: "Model a 20% revenue decline",
    },
    {
      id: "preset-debt-extra",
      name: "Extra $500/mo on debt",
      type: "debt-payoff",
      parameters: { extraMonthlyCents: 50000, monthlyInterestSavedCents: 5000 },
      description: "Accelerate highest-interest debt payoff",
    },
    {
      id: "preset-hire",
      name: "Hire at $5k/mo",
      type: "hire",
      parameters: { monthlySalaryCents: 500000 },
      description: "Add a full-time team member",
    },
  ];
}
