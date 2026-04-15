// ═══════════════════════════════════════════════════════════════
// SITA OS — Regression Types
// Fingerprints, detectors, known-bad patterns.
// ═══════════════════════════════════════════════════════════════

export interface RegressionFingerprint {
  fingerprint_id: string;
  release_version: string;
  metric: string;
  baseline_value: number;
  current_value: number;
  deviation_percent: number;
  severity: "critical" | "high" | "medium" | "low";
  first_detected_at: string;
  confirmed: boolean;
  related_changes: string[];
}

export interface SuspectedRegression {
  regression_id: string;
  fingerprints: RegressionFingerprint[];
  suspected_cause: string;
  confidence: number;
  affected_users_estimate: number;
  recommendation: "rollback" | "hotfix" | "monitor" | "ignore";
  detected_at: string;
}

export interface KnownBadPattern {
  pattern_id: string;
  name: string;
  description: string;
  detection_rule: string;
  severity: "critical" | "high" | "medium";
  remediation: string;
  occurrences: number;
  last_seen_at?: string;
  auto_block_rollout: boolean;
}

export interface PostReleaseComparison {
  comparison_id: string;
  release_version: string;
  baseline_version: string;
  metrics: MetricComparison[];
  regressions_detected: number;
  improvements_detected: number;
  overall_delta: "better" | "worse" | "neutral";
  compared_at: string;
}

export interface MetricComparison {
  metric: string;
  baseline: number;
  current: number;
  delta_percent: number;
  significant: boolean;
  direction: "improved" | "regressed" | "stable";
}
