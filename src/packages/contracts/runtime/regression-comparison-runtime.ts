// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract: Regression Comparison Runtime
// Pure type definitions — no runtime imports
// ═══════════════════════════════════════════════════════════════

/** Measurable dimension for regression detection */
export type RegressionDimension =
  | "performance"
  | "quality"
  | "cost"
  | "reliability"
  | "trust"
  | "latency";

/** Severity of a detected regression */
export type RegressionSeverity = "none" | "minor" | "moderate" | "critical";

/** Overall verdict after comparing all metrics */
export type RegressionVerdict = "clean" | "warning" | "regressed";

/** A single metric snapshot within a baseline */
export interface BaselineMetricSnapshot {
  readonly name: string;
  readonly dimension: RegressionDimension;
  readonly value: number;
  readonly unit: string;
  /** Historical values used to compute statistical thresholds */
  readonly history: number[];
}

/** Frozen baseline for a domain at a point in time */
export interface RegressionBaseline {
  readonly domain: string;
  readonly capturedAt: string;
  readonly version: string;
  readonly metrics: BaselineMetricSnapshot[];
  /** Optional tag — e.g. "v2.4.1-stable" */
  readonly tag?: string;
}

/** Per-metric comparison result */
export interface RegressionComparisonResult {
  readonly metricName: string;
  readonly dimension: RegressionDimension;
  readonly baselineValue: number;
  readonly currentValue: number;
  readonly deviationPercent: number;
  readonly zScore: number;
  readonly severity: RegressionSeverity;
  readonly direction: "improved" | "degraded" | "stable";
  readonly detail: string;
}

/** Full regression report for one or more domains */
export interface RegressionReport {
  readonly id: string;
  readonly domains: string[];
  readonly comparisons: RegressionComparisonResult[];
  readonly regressionsFound: number;
  readonly overallVerdict: RegressionVerdict;
  readonly confidence: number;
  readonly generatedAt: string;
  /** Human-readable summary */
  readonly summary: string;
}

/** Thresholds controlling when a metric is considered regressed */
export interface RegressionThresholds {
  /** Percent deviation to trigger "minor" */
  readonly minorPercent: number;
  /** Percent deviation to trigger "moderate" */
  readonly moderatePercent: number;
  /** Percent deviation to trigger "critical" */
  readonly criticalPercent: number;
  /** Z-score threshold (overrides percent if exceeded) */
  readonly zScoreThreshold: number;
}

/** Default thresholds per dimension */
export const DEFAULT_REGRESSION_THRESHOLDS: Record<RegressionDimension, RegressionThresholds> = {
  performance: { minorPercent: 5, moderatePercent: 15, criticalPercent: 30, zScoreThreshold: 2.5 },
  quality:     { minorPercent: 3, moderatePercent: 10, criticalPercent: 25, zScoreThreshold: 2.0 },
  cost:        { minorPercent: 10, moderatePercent: 25, criticalPercent: 50, zScoreThreshold: 2.5 },
  reliability: { minorPercent: 2, moderatePercent: 8, criticalPercent: 20, zScoreThreshold: 2.0 },
  trust:       { minorPercent: 3, moderatePercent: 10, criticalPercent: 20, zScoreThreshold: 2.0 },
  latency:     { minorPercent: 10, moderatePercent: 30, criticalPercent: 60, zScoreThreshold: 2.5 },
};
