// ═══════════════════════════════════════════════════════════════
// SITA OS — Monte Carlo Simulation Engine
// Batched execution with real-time progress callbacks
// ═══════════════════════════════════════════════════════════════

export interface SimulationVariable {
  id: string;
  label: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  distribution: "normal" | "uniform" | "triangular";
}

export interface SimulationConfig {
  variables: SimulationVariable[];
  iterations: number;
  outputFormula: (vars: Record<string, number>) => number;
  batchSize?: number;
}

export interface SimulationProgress {
  completed: number;
  total: number;
  results: number[];
  percentiles: Record<string, number>;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  speed: number; // iterations per second
}

export interface SimulationResult extends SimulationProgress {
  histogram: { bin: number; count: number }[];
  clusters: { label: string; percentage: number; range: [number, number] }[];
  sensitivity: { variable: string; impact: number }[];
  tailRisk: { threshold: number; probability: number; label: string }[];
}

// Box-Muller transform for normal distribution
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function sampleVariable(v: SimulationVariable): number {
  switch (v.distribution) {
    case "normal":
      return Math.max(v.min, Math.min(v.max, normalRandom(v.mean, v.stdDev)));
    case "uniform":
      return v.min + Math.random() * (v.max - v.min);
    case "triangular": {
      const u = Math.random();
      const mode = v.mean;
      const fc = (mode - v.min) / (v.max - v.min);
      if (u < fc) {
        return v.min + Math.sqrt(u * (v.max - v.min) * (mode - v.min));
      }
      return v.max - Math.sqrt((1 - u) * (v.max - v.min) * (v.max - mode));
    }
    default:
      return v.mean;
  }
}

function computePercentiles(sorted: number[]): Record<string, number> {
  const n = sorted.length;
  if (n === 0) return {};
  const p = (pct: number) => sorted[Math.min(Math.floor(pct * n), n - 1)];
  return { P10: p(0.1), P25: p(0.25), P50: p(0.5), P75: p(0.75), P90: p(0.9) };
}

function buildHistogram(results: number[], bins = 40): { bin: number; count: number }[] {
  if (results.length === 0) return [];
  const min = results[0];
  const max = results[results.length - 1];
  const range = max - min || 1;
  const binWidth = range / bins;
  const hist = Array.from({ length: bins }, (_, i) => ({ bin: min + (i + 0.5) * binWidth, count: 0 }));
  for (const v of results) {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    hist[idx].count++;
  }
  return hist;
}

function identifyClusters(sorted: number[]): SimulationResult["clusters"] {
  if (sorted.length === 0) return [];
  const n = sorted.length;
  const p50 = sorted[Math.floor(n * 0.5)];
  const p25 = sorted[Math.floor(n * 0.25)];
  const p75 = sorted[Math.floor(n * 0.75)];
  const low = sorted.filter(v => v < p25).length;
  const mid = sorted.filter(v => v >= p25 && v <= p75).length;
  const high = sorted.filter(v => v > p75).length;
  return [
    { label: "Bear case", percentage: Math.round((low / n) * 100), range: [sorted[0], p25] },
    { label: "Base case", percentage: Math.round((mid / n) * 100), range: [p25, p75] },
    { label: "Bull case", percentage: Math.round((high / n) * 100), range: [p75, sorted[n - 1]] },
  ];
}

export function runSimulationBatch(
  config: SimulationConfig,
  onProgress: (p: SimulationProgress) => void,
  onComplete: (r: SimulationResult) => void,
): { cancel: () => void } {
  const { variables, iterations, outputFormula, batchSize = 2000 } = config;
  const results: number[] = [];
  let completed = 0;
  let cancelled = false;
  const startTime = performance.now();

  // For sensitivity: run baseline
  const baselineVars: Record<string, number> = {};
  variables.forEach(v => { baselineVars[v.id] = v.mean; });
  const baselineOutput = outputFormula(baselineVars);

  const tick = () => {
    if (cancelled) return;
    const batchEnd = Math.min(completed + batchSize, iterations);

    for (let i = completed; i < batchEnd; i++) {
      const sampled: Record<string, number> = {};
      variables.forEach(v => { sampled[v.id] = sampleVariable(v); });
      results.push(outputFormula(sampled));
    }
    completed = batchEnd;

    const sorted = [...results].sort((a, b) => a - b);
    const mean = results.reduce((s, v) => s + v, 0) / results.length;
    const variance = results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length;
    const elapsed = (performance.now() - startTime) / 1000;

    const progress: SimulationProgress = {
      completed,
      total: iterations,
      results: sorted,
      percentiles: computePercentiles(sorted),
      mean,
      stdDev: Math.sqrt(variance),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      speed: Math.round(completed / elapsed),
    };

    onProgress(progress);

    if (completed >= iterations) {
      // Sensitivity analysis
      const sensitivity = variables.map(v => {
        const tweaked = { ...baselineVars, [v.id]: v.mean + v.stdDev };
        const delta = Math.abs(outputFormula(tweaked) - baselineOutput);
        return { variable: v.label, impact: delta };
      }).sort((a, b) => b.impact - a.impact);

      // Tail risk
      const p10 = progress.percentiles.P10 ?? 0;
      const tailCount = sorted.filter(v => v <= p10 * 0.5).length;
      const tailRisk = [{
        threshold: p10 * 0.5,
        probability: Math.round((tailCount / sorted.length) * 100),
        label: `Severe downside (below ${(p10 * 0.5).toFixed(0)})`,
      }];

      onComplete({
        ...progress,
        histogram: buildHistogram(sorted),
        clusters: identifyClusters(sorted),
        sensitivity,
        tailRisk,
      });
    } else {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
  return { cancel: () => { cancelled = true; } };
}

// Preset decision templates
export const SIMULATION_PRESETS = [
  {
    id: "hire-engineers",
    label: "Hire Engineers",
    domain: "Business",
    question: "Should I hire 3 new engineers?",
    variables: [
      { id: "salary", label: "Annual Salary", min: 80000, max: 200000, mean: 130000, stdDev: 25000, distribution: "normal" as const },
      { id: "rampMonths", label: "Ramp-up (months)", min: 1, max: 6, mean: 3, stdDev: 1, distribution: "normal" as const },
      { id: "productivity", label: "Productivity Multiplier", min: 0.5, max: 2.0, mean: 1.2, stdDev: 0.3, distribution: "normal" as const },
      { id: "revenueGrowth", label: "Revenue Growth %", min: 0, max: 40, mean: 15, stdDev: 8, distribution: "normal" as const },
    ],
    formula: (v: Record<string, number>) => {
      const cost = v.salary * 3;
      const revenueGain = 1000000 * (v.revenueGrowth / 100) * v.productivity;
      return revenueGain - cost;
    },
  },
  {
    id: "raise-prices",
    label: "Raise Prices 20%",
    domain: "Finance",
    question: "What if I raise prices by 20%?",
    variables: [
      { id: "churnRate", label: "Customer Churn %", min: 0, max: 30, mean: 10, stdDev: 6, distribution: "normal" as const },
      { id: "currentRevenue", label: "Current Revenue", min: 500000, max: 2000000, mean: 1000000, stdDev: 300000, distribution: "normal" as const },
      { id: "elasticity", label: "Price Elasticity", min: 0.2, max: 1.5, mean: 0.7, stdDev: 0.2, distribution: "normal" as const },
    ],
    formula: (v: Record<string, number>) => {
      const retainedCustomers = 1 - (v.churnRate / 100) * v.elasticity;
      return v.currentRevenue * 1.2 * retainedCustomers;
    },
  },
  {
    id: "new-market",
    label: "Enter New Market",
    domain: "Investment",
    question: "Should I expand into a new geographic market?",
    variables: [
      { id: "marketSize", label: "Market Size ($M)", min: 5, max: 50, mean: 20, stdDev: 10, distribution: "normal" as const },
      { id: "captureRate", label: "Market Capture %", min: 0.5, max: 10, mean: 3, stdDev: 2, distribution: "normal" as const },
      { id: "entryCost", label: "Entry Cost ($M)", min: 0.5, max: 5, mean: 2, stdDev: 1, distribution: "normal" as const },
      { id: "timeToBreakeven", label: "Break-even (months)", min: 6, max: 36, mean: 18, stdDev: 6, distribution: "normal" as const },
    ],
    formula: (v: Record<string, number>) => {
      const revenue = v.marketSize * 1000000 * (v.captureRate / 100);
      const cost = v.entryCost * 1000000;
      const yearsToBreakeven = v.timeToBreakeven / 12;
      return revenue * 3 - cost * yearsToBreakeven;
    },
  },
];
