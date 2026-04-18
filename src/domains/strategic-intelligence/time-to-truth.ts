// ═══════════════════════════════════════════════════════════════
// SITA OS — Time-to-Truth Optimizer
// Tracks and optimizes time dimensions for intelligence delivery.
// ═══════════════════════════════════════════════════════════════

export interface TimeToTruthMetrics {
  taskClass: string;
  domain: string;
  timeToUsableMs: number;
  timeToConfidentMs: number;
  timeToVerifiedMs: number;
  timeToApprovedMs: number;
  timeToOperatorUnderstandingMs: number;
  totalTimeMs: number;
  bottleneck: TimeBottleneck;
}

export type TimeBottleneck =
  | "model_inference"
  | "evidence_gathering"
  | "verification"
  | "approval_queue"
  | "operator_review"
  | "reuse_lookup"
  | "packet_compilation"
  | "none";

export interface TimeOptimization {
  taskClass: string;
  domain: string;
  currentTotalMs: number;
  optimizedTotalMs: number;
  savingsMs: number;
  savingsPercent: number;
  optimizations: TimeOptimizationAction[];
}

export interface TimeOptimizationAction {
  action: string;
  expectedSavingsMs: number;
  tradeoff: string;
  priority: "high" | "medium" | "low";
}

// ── Analysis ───────────────────────────────────────────────

export function analyzeTimeToTruth(
  metrics: TimeToTruthMetrics[],
): { byDomain: Record<string, TimeToTruthMetrics[]>; avgByPhase: Record<string, number>; slowest: TimeToTruthMetrics | null } {
  const byDomain: Record<string, TimeToTruthMetrics[]> = {};
  let totalUsable = 0, totalConfident = 0, totalVerified = 0, totalApproved = 0, totalUnderstanding = 0;

  for (const m of metrics) {
    if (!byDomain[m.domain]) byDomain[m.domain] = [];
    byDomain[m.domain].push(m);
    totalUsable += m.timeToUsableMs;
    totalConfident += m.timeToConfidentMs;
    totalVerified += m.timeToVerifiedMs;
    totalApproved += m.timeToApprovedMs;
    totalUnderstanding += m.timeToOperatorUnderstandingMs;
  }

  const n = Math.max(metrics.length, 1);
  return {
    byDomain,
    avgByPhase: {
      usable: Math.round(totalUsable / n),
      confident: Math.round(totalConfident / n),
      verified: Math.round(totalVerified / n),
      approved: Math.round(totalApproved / n),
      understanding: Math.round(totalUnderstanding / n),
    },
    slowest: metrics.reduce<TimeToTruthMetrics | null>((s, m) => !s || m.totalTimeMs > s.totalTimeMs ? m : s, null),
  };
}

export function suggestOptimizations(metrics: TimeToTruthMetrics): TimeOptimization {
  const opts: TimeOptimizationAction[] = [];

  if (metrics.timeToUsableMs > 5000) {
    opts.push({ action: "Use cached/precomputed digest", expectedSavingsMs: Math.round(metrics.timeToUsableMs * 0.6), tradeoff: "Slightly less fresh data", priority: "high" });
  }
  if (metrics.timeToVerifiedMs > 10000) {
    opts.push({ action: "Parallelize verification pass", expectedSavingsMs: Math.round(metrics.timeToVerifiedMs * 0.4), tradeoff: "Higher concurrent cost", priority: "medium" });
  }
  if (metrics.timeToApprovedMs > 30000) {
    opts.push({ action: "Pre-approve low-risk actions", expectedSavingsMs: Math.round(metrics.timeToApprovedMs * 0.7), tradeoff: "Requires trust policy expansion", priority: "high" });
  }
  if (metrics.bottleneck === "reuse_lookup") {
    opts.push({ action: "Index intelligence assets by domain+task", expectedSavingsMs: 2000, tradeoff: "Additional storage", priority: "medium" });
  }
  if (metrics.bottleneck === "packet_compilation") {
    opts.push({ action: "Precompile domain packets on schedule", expectedSavingsMs: 3000, tradeoff: "Background compute cost", priority: "medium" });
  }

  const totalSavings = opts.reduce((s, o) => s + o.expectedSavingsMs, 0);
  return {
    taskClass: metrics.taskClass,
    domain: metrics.domain,
    currentTotalMs: metrics.totalTimeMs,
    optimizedTotalMs: Math.max(1000, metrics.totalTimeMs - totalSavings),
    savingsMs: totalSavings,
    savingsPercent: Math.round((totalSavings / Math.max(metrics.totalTimeMs, 1)) * 100),
    optimizations: opts,
  };
}
