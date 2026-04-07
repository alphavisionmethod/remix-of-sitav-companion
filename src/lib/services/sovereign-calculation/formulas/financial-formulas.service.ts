// SITA OS — Financial Formulas Service (deterministic, no LLM)
export function burnMultiple(netBurnCents: number, netNewArrCents: number): number {
  return netNewArrCents === 0 ? Infinity : netBurnCents / netNewArrCents;
}

export function runwayMonths(cashCents: number, monthlyBurnCents: number): number {
  return monthlyBurnCents <= 0 ? Infinity : Math.floor(cashCents / monthlyBurnCents);
}

export function cagr(beginValue: number, endValue: number, years: number): number {
  if (beginValue <= 0 || years <= 0) return 0;
  return Math.pow(endValue / beginValue, 1 / years) - 1;
}

export function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0);
}

export function irr(cashflows: number[], guess: number = 0.1, maxIter: number = 100, tolerance: number = 1e-6): number {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    const npvVal = cashflows.reduce((acc, cf, j) => acc + cf / Math.pow(1 + rate, j), 0);
    const deriv = cashflows.reduce((acc, cf, j) => acc - j * cf / Math.pow(1 + rate, j + 1), 0);
    if (Math.abs(deriv) < 1e-12) break;
    const newRate = rate - npvVal / deriv;
    if (Math.abs(newRate - rate) < tolerance) return newRate;
    rate = newRate;
  }
  return rate;
}

export function compoundInterest(principal: number, rate: number, periods: number, compoundingPerPeriod: number = 1): number {
  return principal * Math.pow(1 + rate / compoundingPerPeriod, compoundingPerPeriod * periods);
}

export function debtServiceCoverageRatio(netOperatingIncome: number, totalDebtService: number): number {
  return totalDebtService === 0 ? Infinity : netOperatingIncome / totalDebtService;
}

export function quickRatio(cashCents: number, receivablesCents: number, currentLiabilitiesCents: number): number {
  return currentLiabilitiesCents === 0 ? Infinity : (cashCents + receivablesCents) / currentLiabilitiesCents;
}

