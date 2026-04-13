// ═══════════════════════════════════════════════════════════════
// SITA OS — Validated Financial Formula Library
// Deterministic, peer-reviewed mathematical models
// No LLM involvement — pure math
// ═══════════════════════════════════════════════════════════════

/** Discounted Cash Flow — NPV with terminal value */
export function dcfNPV(
  cashFlows: number[],
  discountRate: number,
  terminalGrowthRate = 0.02,
): number {
  if (discountRate <= terminalGrowthRate) return Infinity;
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + discountRate, t + 1);
  }
  // Terminal value (Gordon Growth Model)
  const lastCF = cashFlows[cashFlows.length - 1] ?? 0;
  const tv = (lastCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
  npv += tv / Math.pow(1 + discountRate, cashFlows.length);
  return npv;
}

/** Standard normal CDF (Abramowitz & Stegun approximation) */
function normCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/** Black-Scholes European option pricing */
export function blackScholes(
  S: number,   // Current price
  K: number,   // Strike price
  T: number,   // Time to expiry (years)
  r: number,   // Risk-free rate
  sigma: number, // Volatility
  type: "call" | "put" = "call",
): number {
  if (T <= 0) return type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
  if (sigma <= 0) {
    const pv = K * Math.exp(-r * T);
    return type === "call" ? Math.max(S - pv, 0) : Math.max(pv - S, 0);
  }
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  if (type === "call") {
    return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  }
  return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

/** Kelly Criterion — optimal fraction of capital to bet */
export function kellyCriterion(
  winProb: number,
  winLossRatio: number, // avg win / avg loss
): number {
  if (winLossRatio <= 0 || winProb <= 0 || winProb >= 1) return 0;
  const f = winProb - (1 - winProb) / winLossRatio;
  return Math.max(0, f);
}

/** CAPM — expected return */
export function capmExpectedReturn(
  riskFreeRate: number,
  beta: number,
  marketReturn: number,
): number {
  return riskFreeRate + beta * (marketReturn - riskFreeRate);
}

/** Sharpe Ratio */
export function sharpeRatio(
  portfolioReturn: number,
  riskFreeRate: number,
  portfolioStdDev: number,
): number {
  if (portfolioStdDev <= 0) return 0;
  return (portfolioReturn - riskFreeRate) / portfolioStdDev;
}

/** Compound Interest — Future Value */
export function compoundInterest(
  principal: number,
  rate: number,     // annual rate (decimal)
  periods: number,  // years
  compoundsPerYear = 12,
): number {
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * periods);
}

/** Value at Risk — parametric (variance-covariance method) */
export function parametricVaR(
  portfolioValue: number,
  meanReturn: number,
  stdDevReturn: number,
  confidenceLevel: number, // e.g. 0.95
): number {
  // z-score for given confidence level
  const zScores: Record<number, number> = { 0.9: 1.2816, 0.95: 1.6449, 0.99: 2.3263 };
  const z = zScores[confidenceLevel] ?? 1.6449;
  return portfolioValue * (meanReturn - z * stdDevReturn);
}

/** Historical VaR from simulation results */
export function historicalVaR(
  sortedResults: number[],
  confidenceLevel: number,
): number {
  if (sortedResults.length === 0) return 0;
  const idx = Math.floor((1 - confidenceLevel) * sortedResults.length);
  return sortedResults[Math.max(0, idx)];
}

/** Expected Shortfall (CVaR) — average of worst X% */
export function expectedShortfall(
  sortedResults: number[],
  confidenceLevel: number,
): number {
  if (sortedResults.length === 0) return 0;
  const cutoffIdx = Math.floor((1 - confidenceLevel) * sortedResults.length);
  if (cutoffIdx <= 0) return sortedResults[0];
  const tail = sortedResults.slice(0, cutoffIdx);
  return tail.reduce((a, b) => a + b, 0) / tail.length;
}

/** Sortino Ratio — only downside deviation */
export function sortinoRatio(
  returns: number[],
  riskFreeRate: number,
): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const downsideReturns = returns.filter(r => r < riskFreeRate);
  if (downsideReturns.length === 0) return mean > riskFreeRate ? Infinity : 0;
  const downsideDev = Math.sqrt(
    downsideReturns.reduce((s, r) => s + (r - riskFreeRate) ** 2, 0) / downsideReturns.length
  );
  return downsideDev > 0 ? (mean - riskFreeRate) / downsideDev : 0;
}

/** Maximum Drawdown from a series of portfolio values */
export function maxDrawdown(values: number[]): number {
  if (values.length < 2) return 0;
  let peak = values[0];
  let maxDD = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    const dd = (peak - v) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

// ─── Formula registry for presets ───

export type FormulaType =
  | "dcf" | "black-scholes" | "kelly" | "capm"
  | "sharpe" | "compound-interest" | "custom";

export const FORMULA_REGISTRY: Record<FormulaType, { label: string; description: string }> = {
  "dcf": { label: "DCF / NPV", description: "Net present value with terminal growth" },
  "black-scholes": { label: "Black-Scholes", description: "European option pricing model" },
  "kelly": { label: "Kelly Criterion", description: "Optimal position sizing" },
  "capm": { label: "CAPM", description: "Risk-adjusted expected returns" },
  "sharpe": { label: "Sharpe Ratio", description: "Risk-adjusted performance" },
  "compound-interest": { label: "Compound Interest", description: "Time value of money" },
  "custom": { label: "Custom Formula", description: "User-defined calculation" },
};
