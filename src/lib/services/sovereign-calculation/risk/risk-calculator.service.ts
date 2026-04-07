// SITA OS — Risk Calculator Service
export interface RiskMetrics { valueAtRisk95: number; valueAtRisk99: number; maxDrawdown: number; sharpeRatio: number; sortinoRatio: number; beta: number }

export function calculateVaR(returns: number[], confidenceLevel: number = 0.95): number {
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sorted.length);
  return sorted[index] || 0;
}

export function calculateMaxDrawdown(values: number[]): number {
  let maxDD = 0, peak = values[0] || 0;
  for (const v of values) {
    if (v > peak) peak = v;
    const dd = (peak - v) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.04): number {
  const n = returns.length;
  if (n < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / n;
  const variance = returns.reduce((a, r) => a + (r - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  return stdDev === 0 ? 0 : (mean - riskFreeRate / 252) / stdDev * Math.sqrt(252);
}

export function calculatePortfolioRisk(returns: number[], benchmarkReturns?: number[]): RiskMetrics {
  const var95 = calculateVaR(returns, 0.95);
  const var99 = calculateVaR(returns, 0.99);
  const values = returns.reduce((acc: number[], r) => { acc.push((acc[acc.length - 1] || 100) * (1 + r)); return acc; }, []);
  const maxDD = calculateMaxDrawdown(values);
  const sharpe = calculateSharpeRatio(returns);
  const negReturns = returns.filter((r) => r < 0);
  const downDev = negReturns.length > 0 ? Math.sqrt(negReturns.reduce((a, r) => a + r * r, 0) / negReturns.length) : 0.001;
  const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const sortino = downDev > 0 ? (mean - 0.04 / 252) / downDev * Math.sqrt(252) : 0;
  let beta = 1;
  if (benchmarkReturns && benchmarkReturns.length === returns.length) {
    const bmMean = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;
    const cov = returns.reduce((a, r, i) => a + (r - mean) * (benchmarkReturns[i] - bmMean), 0) / returns.length;
    const bmVar = benchmarkReturns.reduce((a, r) => a + (r - bmMean) ** 2, 0) / benchmarkReturns.length;
    beta = bmVar > 0 ? cov / bmVar : 1;
  }
  return { valueAtRisk95: var95, valueAtRisk99: var99, maxDrawdown: maxDD, sharpeRatio: sharpe, sortinoRatio: sortino, beta };
}

