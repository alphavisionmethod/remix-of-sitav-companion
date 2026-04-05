// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Benchmark Lab
// Continuously compares reasoning strategies for optimization.
// ═══════════════════════════════════════════════════════════════

export type BenchmarkDimension =
  | "cheap_vs_expensive"
  | "reused_vs_fresh"
  | "compressed_vs_full"
  | "single_vs_multi_agent"
  | "async_vs_sync"
  | "premium_vs_standard"
  | "quality_floor_effect";

export interface BenchmarkExperiment {
  experimentId: string;
  dimension: BenchmarkDimension;
  domain: string;
  taskType: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "completed" | "inconclusive";
  sampleSize: number;
  resultA: BenchmarkResult;
  resultB: BenchmarkResult;
  winner: "A" | "B" | "tie" | "pending";
  confidenceInResult: number;
  recommendation: string;
  costToRun: number;
}

export interface BenchmarkResult {
  label: string;
  avgCostCents: number;
  avgLatencyMs: number;
  avgQuality: number;
  avgConfidence: number;
  acceptanceRate: number;
  overrideRate: number;
  reuseContribution: number;
}

export interface BenchmarkSummary {
  totalExperiments: number;
  completed: number;
  running: number;
  totalSavingsIdentified: number;
  topInsights: BenchmarkInsight[];
}

export interface BenchmarkInsight {
  dimension: BenchmarkDimension;
  insight: string;
  savingsCents: number;
  qualityImpact: number;
  confidence: number;
}

// ── Lab Engine ─────────────────────────────────────────────

export function createExperiment(
  dimension: BenchmarkDimension,
  domain: string,
  taskType: string,
  labelA: string,
  labelB: string,
): BenchmarkExperiment {
  const empty: BenchmarkResult = { label: "", avgCostCents: 0, avgLatencyMs: 0, avgQuality: 0, avgConfidence: 0, acceptanceRate: 0, overrideRate: 0, reuseContribution: 0 };
  return {
    experimentId: `bench-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dimension, domain, taskType,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "running",
    sampleSize: 0,
    resultA: { ...empty, label: labelA },
    resultB: { ...empty, label: labelB },
    winner: "pending",
    confidenceInResult: 0,
    recommendation: "",
    costToRun: 0,
  };
}

export function evaluateExperiment(exp: BenchmarkExperiment): BenchmarkExperiment {
  if (exp.sampleSize < 10) return { ...exp, status: "running", winner: "pending" };

  const a = exp.resultA;
  const b = exp.resultB;

  // Composite: quality-adjusted cost efficiency
  const scoreA = (a.avgQuality * a.acceptanceRate) / Math.max(a.avgCostCents, 1);
  const scoreB = (b.avgQuality * b.acceptanceRate) / Math.max(b.avgCostCents, 1);

  const diff = Math.abs(scoreA - scoreB) / Math.max(scoreA, scoreB, 0.01);
  const winner = diff < 0.05 ? "tie" : scoreA > scoreB ? "A" : "B";
  const winnerResult = winner === "A" ? a : winner === "B" ? b : a;
  const loserResult = winner === "A" ? b : winner === "B" ? a : b;

  const savings = Math.max(0, loserResult.avgCostCents - winnerResult.avgCostCents) * exp.sampleSize;

  return {
    ...exp,
    status: "completed",
    completedAt: new Date().toISOString(),
    winner,
    confidenceInResult: Math.min(100, 50 + exp.sampleSize * 2),
    recommendation: winner === "tie"
      ? `No significant difference between ${a.label} and ${b.label}`
      : `${winnerResult.label} outperforms: ${Math.round((diff) * 100)}% better quality/cost ratio, saving ~${savings}¢`,
    costToRun: exp.costToRun,
  };
}

export function summarizeBenchmarks(experiments: BenchmarkExperiment[]): BenchmarkSummary {
  const completed = experiments.filter(e => e.status === "completed");
  const running = experiments.filter(e => e.status === "running");

  const insights: BenchmarkInsight[] = completed
    .filter(e => e.winner !== "tie")
    .map(e => ({
      dimension: e.dimension,
      insight: e.recommendation,
      savingsCents: e.winner === "A"
        ? (e.resultB.avgCostCents - e.resultA.avgCostCents) * e.sampleSize
        : (e.resultA.avgCostCents - e.resultB.avgCostCents) * e.sampleSize,
      qualityImpact: e.winner === "A" ? e.resultA.avgQuality - e.resultB.avgQuality : e.resultB.avgQuality - e.resultA.avgQuality,
      confidence: e.confidenceInResult,
    }))
    .sort((a, b) => b.savingsCents - a.savingsCents);

  return {
    totalExperiments: experiments.length,
    completed: completed.length,
    running: running.length,
    totalSavingsIdentified: insights.reduce((s, i) => s + Math.max(0, i.savingsCents), 0),
    topInsights: insights.slice(0, 5),
  };
}
