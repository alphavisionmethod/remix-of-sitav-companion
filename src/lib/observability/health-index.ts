// ═══════════════════════════════════════════════════════════════
// SITA OS — Composite Health Index
// Computes an overall system health score from all observability signals
// ═══════════════════════════════════════════════════════════════

import { type SLOStatus } from "./slo-tracking";
import { type AnomalyDetection } from "./anomaly-detection";

export type HealthGrade = "A" | "B" | "C" | "D" | "F";
export type HealthTrend = "improving" | "stable" | "degrading";

export interface SubsystemHealth {
  readonly name: string;
  readonly score: number; // 0-100
  readonly status: "healthy" | "degraded" | "unhealthy" | "unknown";
  readonly lastChecked: number;
  readonly details?: string;
}

export interface CompositeHealthIndex {
  readonly overallScore: number; // 0-100
  readonly grade: HealthGrade;
  readonly trend: HealthTrend;
  readonly subsystems: SubsystemHealth[];
  readonly sloCompliance: number; // % of SLOs met
  readonly activeAnomalies: number;
  readonly errorBudgetHealth: number; // weighted average of remaining error budgets
  readonly computedAt: number;
}

// ── Subsystem Weights ──────────────────────────────────────

const SUBSYSTEM_WEIGHTS: Record<string, number> = {
  database: 25,
  auth: 20,
  "edge-functions": 15,
  "ai-gateway": 15,
  storage: 10,
  frontend: 10,
  scheduler: 5,
};

// ── Score Computations ─────────────────────────────────────

export function probeStatusToScore(status: "pass" | "fail" | "degraded"): number {
  switch (status) {
    case "pass": return 100;
    case "degraded": return 60;
    case "fail": return 0;
  }
}

export function scoreToGrade(score: number): HealthGrade {
  if (score >= 95) return "A";
  if (score >= 85) return "B";
  if (score >= 70) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function scoreToStatus(score: number): SubsystemHealth["status"] {
  if (score >= 90) return "healthy";
  if (score >= 60) return "degraded";
  return "unhealthy";
}

// ── Composite Index Computation ────────────────────────────

export function computeHealthIndex(
  subsystems: SubsystemHealth[],
  sloStatuses: SLOStatus[],
  anomalies: AnomalyDetection[],
  previousScore?: number,
): CompositeHealthIndex {
  // 1. Weighted subsystem score
  let weightedSum = 0;
  let totalWeight = 0;
  for (const sub of subsystems) {
    const weight = SUBSYSTEM_WEIGHTS[sub.name] ?? 5;
    weightedSum += sub.score * weight;
    totalWeight += weight;
  }
  const subsystemScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

  // 2. SLO compliance
  const sloMet = sloStatuses.filter(s => s.isMet).length;
  const sloCompliance = sloStatuses.length > 0 ? (sloMet / sloStatuses.length) * 100 : 100;

  // 3. Error budget health
  const errorBudgetHealth = sloStatuses.length > 0
    ? sloStatuses.reduce((sum, s) => sum + s.errorBudgetPercent, 0) / sloStatuses.length
    : 100;

  // 4. Anomaly penalty
  const activeAnomalies = anomalies.length;
  const anomalyPenalty = Math.min(20, anomalies.reduce((sum, a) => {
    switch (a.severity) {
      case "critical": return sum + 8;
      case "high": return sum + 5;
      case "medium": return sum + 3;
      case "low": return sum + 1;
    }
  }, 0));

  // 5. Composite score
  const rawScore = (subsystemScore * 0.4) + (sloCompliance * 0.3) + (errorBudgetHealth * 0.3) - anomalyPenalty;
  const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // 6. Trend
  let trend: HealthTrend = "stable";
  if (previousScore !== undefined) {
    if (overallScore > previousScore + 2) trend = "improving";
    else if (overallScore < previousScore - 2) trend = "degrading";
  }

  return {
    overallScore,
    grade: scoreToGrade(overallScore),
    trend,
    subsystems,
    sloCompliance,
    activeAnomalies,
    errorBudgetHealth,
    computedAt: Date.now(),
  };
}

// ── Performance Budgets ────────────────────────────────────

export interface PerformanceBudget {
  readonly metric: string;
  readonly budget: number;
  readonly unit: string;
  readonly severity: "warning" | "error";
}

export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { metric: "lcp", budget: 2500, unit: "ms", severity: "warning" },
  { metric: "lcp", budget: 4000, unit: "ms", severity: "error" },
  { metric: "fcp", budget: 1800, unit: "ms", severity: "warning" },
  { metric: "cls", budget: 0.1, unit: "score", severity: "warning" },
  { metric: "cls", budget: 0.25, unit: "score", severity: "error" },
  { metric: "inp", budget: 200, unit: "ms", severity: "warning" },
  { metric: "inp", budget: 500, unit: "ms", severity: "error" },
  { metric: "ttfb", budget: 800, unit: "ms", severity: "warning" },
  { metric: "js_heap", budget: 50 * 1024 * 1024, unit: "bytes", severity: "warning" },
  { metric: "js_heap", budget: 100 * 1024 * 1024, unit: "bytes", severity: "error" },
  { metric: "dom_nodes", budget: 1500, unit: "nodes", severity: "warning" },
  { metric: "dom_nodes", budget: 3000, unit: "nodes", severity: "error" },
  { metric: "api_latency", budget: 2000, unit: "ms", severity: "warning" },
  { metric: "api_latency", budget: 5000, unit: "ms", severity: "error" },
];

export interface BudgetViolation {
  readonly budget: PerformanceBudget;
  readonly actual: number;
  readonly overshoot: number; // percentage over budget
}

export function checkPerformanceBudgets(metrics: Record<string, number>): BudgetViolation[] {
  const violations: BudgetViolation[] = [];

  for (const budget of PERFORMANCE_BUDGETS) {
    const actual = metrics[budget.metric];
    if (actual !== undefined && actual > budget.budget) {
      violations.push({
        budget,
        actual,
        overshoot: ((actual - budget.budget) / budget.budget) * 100,
      });
    }
  }

  return violations;
}

// ── Structured Error Classification ────────────────────────

export type ErrorCategory =
  | "network" | "auth" | "validation" | "permission"
  | "timeout" | "rate_limit" | "server" | "client" | "unknown";

export interface ClassifiedError {
  readonly category: ErrorCategory;
  readonly message: string;
  readonly retryable: boolean;
  readonly userMessage: string;
  readonly severity: "low" | "medium" | "high" | "critical";
}

export function classifyError(error: unknown): ClassifiedError {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("network") || lowerMsg.includes("fetch") || lowerMsg.includes("econnrefused")) {
    return { category: "network", message, retryable: true, userMessage: "Network error — please check your connection", severity: "medium" };
  }
  if (lowerMsg.includes("401") || lowerMsg.includes("unauthorized") || lowerMsg.includes("jwt")) {
    return { category: "auth", message, retryable: false, userMessage: "Session expired — please sign in again", severity: "high" };
  }
  if (lowerMsg.includes("403") || lowerMsg.includes("forbidden") || lowerMsg.includes("permission")) {
    return { category: "permission", message, retryable: false, userMessage: "You don't have permission for this action", severity: "medium" };
  }
  if (lowerMsg.includes("422") || lowerMsg.includes("validation") || lowerMsg.includes("invalid")) {
    return { category: "validation", message, retryable: false, userMessage: "Invalid input — please check your data", severity: "low" };
  }
  if (lowerMsg.includes("timeout") || lowerMsg.includes("aborted") || lowerMsg.includes("timed out")) {
    return { category: "timeout", message, retryable: true, userMessage: "Request timed out — please try again", severity: "medium" };
  }
  if (lowerMsg.includes("429") || lowerMsg.includes("rate limit") || lowerMsg.includes("too many")) {
    return { category: "rate_limit", message, retryable: true, userMessage: "Too many requests — please wait a moment", severity: "low" };
  }
  if (lowerMsg.includes("500") || lowerMsg.includes("internal server")) {
    return { category: "server", message, retryable: true, userMessage: "Server error — our team has been notified", severity: "high" };
  }

  return { category: "unknown", message, retryable: false, userMessage: "Something went wrong", severity: "medium" };
}
