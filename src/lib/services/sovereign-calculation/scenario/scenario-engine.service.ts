// SITA OS — Scenario Engine Service (Monte Carlo projections)
export interface ScenarioResult { scenarioId: string; name: string; projectedValueCents: number; probability: number; bestCaseCents: number; worstCaseCents: number; medianCents: number }

export function runMonteCarloScenario(params: { initialValueCents: number; monthlyGrowthRate: number; volatility: number; months: number; simulations?: number }): ScenarioResult {
  const sims = params.simulations || 1000;
  const results: number[] = [];
  for (let s = 0; s < sims; s++) {
    let value = params.initialValueCents;
    for (let m = 0; m < params.months; m++) {
      const randomShock = gaussianRandom() * params.volatility;
      value *= (1 + params.monthlyGrowthRate + randomShock);
    }
    results.push(Math.max(0, Math.round(value)));
  }
  results.sort((a, b) => a - b);
  const median = results[Math.floor(results.length / 2)];
  const p5 = results[Math.floor(results.length * 0.05)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
  return { scenarioId: crypto.randomUUID(), name: `${params.months}-month projection`, projectedValueCents: avg, probability: 0.5, bestCaseCents: p95, worstCaseCents: p5, medianCents: median };
}

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function runMultipleScenarios(baseParams: { initialValueCents: number; months: number }, scenarios: { name: string; growthRate: number; volatility: number }[]): ScenarioResult[] {
  return scenarios.map((s) => ({ ...runMonteCarloScenario({ ...baseParams, monthlyGrowthRate: s.growthRate, volatility: s.volatility }), name: s.name }));
}
