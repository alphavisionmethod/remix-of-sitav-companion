// SITA OS — Wealth Building Engine
// Long-term wealth accumulation with Monte Carlo simulation

export interface WealthTrajectory {
  yearsProjected: number;
  simulations: number;
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] };
  finalMedianCents: number;
  finalBestCaseCents: number;
  finalWorstCaseCents: number;
  probabilityOfGoal: number;
  goalAmountCents: number;
}

export interface FIRECalculation {
  targetNetWorthCents: number;
  annualSpendCents: number;
  safeWithdrawalRate: number;
  currentNetWorthCents: number;
  monthlySavingsCents: number;
  yearsToFIRE: number;
  fireDate: string;
  coastFIREAgeCents: number; // net worth needed now to coast (stop saving, still retire on time)
  baristaFIRECents: number; // net worth where part-time covers expenses
  onTrack: boolean;
}

export interface WealthWaterfall {
  grossIncomeCents: number;
  taxesCents: number;
  netIncomeCents: number;
  essentialExpensesCents: number;
  discretionaryExpensesCents: number;
  savingsCents: number;
  investmentsCents: number;
  savingsRatePercent: number;
  projectedGrowthCents: number;
}

export interface DebtPayoffPlan {
  method: "avalanche" | "snowball";
  debts: DebtItem[];
  totalInterestSavedCents: number;
  payoffDate: string;
  monthlyPaymentCents: number;
  payoffOrder: string[];
}

export interface DebtItem {
  name: string;
  balanceCents: number;
  ratePct: number;
  minimumPaymentCents: number;
  payoffMonths: number;
  totalInterestCents: number;
}

export interface EmergencyFundTarget {
  targetCents: number;
  currentCents: number;
  gapCents: number;
  monthsOfExpenses: number;
  riskMultiplier: number;
  riskFactors: string[];
  monthlyContributionCents: number;
  targetDate: string;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function gaussianFromRng(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export class WealthBuildingEngine {
  projectWealth(params: {
    currentNetWorthCents: number;
    monthlySavingsCents: number;
    annualReturnPct: number;
    annualVolatilityPct: number;
    annualInflationPct: number;
    years: number;
    goalCents: number;
    simulations?: number;
    seed?: number;
  }): WealthTrajectory {
    const sims = params.simulations || 1000;
    const rng = seededRandom(params.seed || 42);
    const monthlyReturn = params.annualReturnPct / 100 / 12;
    const monthlyVol = (params.annualVolatilityPct / 100) / Math.sqrt(12);
    const months = params.years * 12;
    const allPaths: number[][] = [];

    for (let s = 0; s < sims; s++) {
      const path: number[] = [params.currentNetWorthCents];
      let value = params.currentNetWorthCents;
      for (let m = 1; m <= months; m++) {
        const shock = gaussianFromRng(rng) * monthlyVol;
        value = value * (1 + monthlyReturn + shock) + params.monthlySavingsCents;
        path.push(Math.max(0, Math.round(value)));
      }
      allPaths.push(path);
    }

    const percentiles = { p10: [] as number[], p25: [] as number[], p50: [] as number[], p75: [] as number[], p90: [] as number[] };
    for (let m = 0; m <= months; m++) {
      const values = allPaths.map((p) => p[m]).sort((a, b) => a - b);
      percentiles.p10.push(values[Math.floor(sims * 0.1)]);
      percentiles.p25.push(values[Math.floor(sims * 0.25)]);
      percentiles.p50.push(values[Math.floor(sims * 0.5)]);
      percentiles.p75.push(values[Math.floor(sims * 0.75)]);
      percentiles.p90.push(values[Math.floor(sims * 0.9)]);
    }

    const finalValues = allPaths.map((p) => p[months]).sort((a, b) => a - b);
    const hitGoal = finalValues.filter((v) => v >= params.goalCents).length;

    return {
      yearsProjected: params.years,
      simulations: sims,
      percentiles,
      finalMedianCents: finalValues[Math.floor(sims * 0.5)],
      finalBestCaseCents: finalValues[Math.floor(sims * 0.9)],
      finalWorstCaseCents: finalValues[Math.floor(sims * 0.1)],
      probabilityOfGoal: Math.round((hitGoal / sims) * 100),
      goalAmountCents: params.goalCents,
    };
  }

  calculateFIRE(params: {
    annualSpendCents: number;
    currentNetWorthCents: number;
    monthlySavingsCents: number;
    annualReturnPct: number;
    safeWithdrawalRate?: number;
    currentAge?: number;
    targetRetirementAge?: number;
  }): FIRECalculation {
    const swr = params.safeWithdrawalRate || 0.04;
    const target = Math.round(params.annualSpendCents / swr);
    const r = params.annualReturnPct / 100 / 12;
    const monthlySavings = params.monthlySavingsCents;

    // Calculate months to FIRE
    let months = 0;
    let value = params.currentNetWorthCents;
    while (value < target && months < 600) {
      value = value * (1 + r) + monthlySavings;
      months++;
    }
    const yearsToFIRE = Math.round((months / 12) * 10) / 10;

    const fireDate = new Date();
    fireDate.setMonth(fireDate.getMonth() + months);

    // Coast FIRE: how much you'd need NOW to reach target by age 65 with 0 additional savings
    const coastYears = params.targetRetirementAge ? params.targetRetirementAge - (params.currentAge || 30) : 35;
    const coastFIRE = Math.round(target / Math.pow(1 + params.annualReturnPct / 100, coastYears));

    // Barista FIRE: net worth where 4% withdrawal + part-time income covers expenses
    const partTimeAnnualCents = params.annualSpendCents * 0.4;
    const baristaTarget = Math.round((params.annualSpendCents - partTimeAnnualCents) / swr);

    return {
      targetNetWorthCents: target,
      annualSpendCents: params.annualSpendCents,
      safeWithdrawalRate: swr,
      currentNetWorthCents: params.currentNetWorthCents,
      monthlySavingsCents: monthlySavings,
      yearsToFIRE,
      fireDate: fireDate.toISOString().split("T")[0],
      coastFIREAgeCents: coastFIRE,
      baristaFIRECents: baristaTarget,
      onTrack: yearsToFIRE <= (params.targetRetirementAge ? params.targetRetirementAge - (params.currentAge || 30) : 30),
    };
  }

  buildWaterfall(params: {
    grossIncomeCents: number;
    effectiveTaxRatePct: number;
    essentialExpensesCents: number;
    discretionaryExpensesCents: number;
    annualReturnPct: number;
  }): WealthWaterfall {
    const taxes = Math.round(params.grossIncomeCents * params.effectiveTaxRatePct / 100);
    const net = params.grossIncomeCents - taxes;
    const totalExpenses = params.essentialExpensesCents + params.discretionaryExpensesCents;
    const savings = Math.max(0, net - totalExpenses);
    const savingsRate = net > 0 ? Math.round((savings / net) * 100) : 0;
    const projectedGrowth = Math.round(savings * params.annualReturnPct / 100);

    return {
      grossIncomeCents: params.grossIncomeCents,
      taxesCents: taxes,
      netIncomeCents: net,
      essentialExpensesCents: params.essentialExpensesCents,
      discretionaryExpensesCents: params.discretionaryExpensesCents,
      savingsCents: savings,
      investmentsCents: savings,
      savingsRatePercent: savingsRate,
      projectedGrowthCents: projectedGrowth,
    };
  }

  compareDebtPayoff(debts: Array<{ name: string; balanceCents: number; ratePct: number; minimumPaymentCents: number }>, extraMonthlyCents: number): { avalanche: DebtPayoffPlan; snowball: DebtPayoffPlan } {
    return {
      avalanche: this.simulatePayoff(debts, extraMonthlyCents, "avalanche"),
      snowball: this.simulatePayoff(debts, extraMonthlyCents, "snowball"),
    };
  }

  calculateEmergencyFund(params: {
    monthlyExpensesCents: number;
    currentSavingsCents: number;
    incomeStability: "stable" | "variable" | "unstable";
    dependents: number;
    hasInsurance: boolean;
    monthlySavingsCapacityCents: number;
  }): EmergencyFundTarget {
    const factors: string[] = [];
    let multiplier = 3;

    if (params.incomeStability === "variable") { multiplier += 1.5; factors.push("Variable income (+1.5 months)"); }
    if (params.incomeStability === "unstable") { multiplier += 3; factors.push("Unstable income (+3 months)"); }
    if (params.dependents > 0) { multiplier += params.dependents * 0.5; factors.push(`${params.dependents} dependents (+${params.dependents * 0.5} months)`); }
    if (!params.hasInsurance) { multiplier += 1; factors.push("No insurance (+1 month)"); }

    const target = Math.round(params.monthlyExpensesCents * multiplier);
    const gap = Math.max(0, target - params.currentSavingsCents);
    const monthsToTarget = params.monthlySavingsCapacityCents > 0 ? Math.ceil(gap / params.monthlySavingsCapacityCents) : Infinity;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsToTarget);

    return {
      targetCents: target,
      currentCents: params.currentSavingsCents,
      gapCents: gap,
      monthsOfExpenses: multiplier,
      riskMultiplier: multiplier,
      riskFactors: factors,
      monthlyContributionCents: params.monthlySavingsCapacityCents,
      targetDate: monthsToTarget < 600 ? targetDate.toISOString().split("T")[0] : "N/A",
    };
  }

  private simulatePayoff(debts: Array<{ name: string; balanceCents: number; ratePct: number; minimumPaymentCents: number }>, extraMonthlyCents: number, method: "avalanche" | "snowball"): DebtPayoffPlan {
    const sorted = [...debts].sort((a, b) => method === "avalanche" ? b.ratePct - a.ratePct : a.balanceCents - b.balanceCents);
    const balances = sorted.map((d) => d.balanceCents);
    const totalInterest = new Array(sorted.length).fill(0);
    const payoffMonths = new Array(sorted.length).fill(0);
    let months = 0;
    const maxMonths = 600;

    while (balances.some((b) => b > 0) && months < maxMonths) {
      months++;
      let extra = extraMonthlyCents;
      for (let i = 0; i < sorted.length; i++) {
        if (balances[i] <= 0) continue;
        const interest = Math.round(balances[i] * sorted[i].ratePct / 100 / 12);
        totalInterest[i] += interest;
        balances[i] += interest;
        const payment = sorted[i].minimumPaymentCents + (i === balances.findIndex((b) => b > 0) ? extra : 0);
        const actualPayment = Math.min(balances[i], payment);
        balances[i] -= actualPayment;
        if (balances[i] <= 0 && payoffMonths[i] === 0) payoffMonths[i] = months;
      }
    }

    const debtItems: DebtItem[] = sorted.map((d, i) => ({
      name: d.name,
      balanceCents: d.balanceCents,
      ratePct: d.ratePct,
      minimumPaymentCents: d.minimumPaymentCents,
      payoffMonths: payoffMonths[i],
      totalInterestCents: totalInterest[i],
    }));

    const totalMinPayments = sorted.reduce((s, d) => s + d.minimumPaymentCents, 0);
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    return {
      method,
      debts: debtItems,
      totalInterestSavedCents: totalInterest.reduce((a, b) => a + b, 0),
      payoffDate: payoffDate.toISOString().split("T")[0],
      monthlyPaymentCents: totalMinPayments + extraMonthlyCents,
      payoffOrder: debtItems.sort((a, b) => a.payoffMonths - b.payoffMonths).map((d) => d.name),
    };
  }
}

export function createWealthBuildingEngine(): WealthBuildingEngine {
  return new WealthBuildingEngine();
}
