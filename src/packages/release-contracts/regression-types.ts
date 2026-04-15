// ═══════════════════════════════════════════════════════════════
// SITA OS — Regression Types (Fully Advanced)
// Fingerprints, detectors, known-bad patterns, statistical
// significance, automated root cause, regression clusters.
// ═══════════════════════════════════════════════════════════════

export type RegressionSeverity = "critical" | "high" | "medium" | "low";

export type RegressionStatus = "suspected" | "confirmed" | "false_positive" | "resolved" | "monitoring";

export interface RegressionFingerprint {
  fingerprint_id: string;
  release_version: string;
  metric: string;
  metric_category: "latency" | "error_rate" | "throughput" | "resource" | "business" | "user_experience";
  baseline_value: number;
  current_value: number;
  deviation_percent: number;
  severity: RegressionSeverity;
  status: RegressionStatus;
  statistical_significance: StatisticalSignificance;
  first_detected_at: string;
  confirmed_at?: string;
  resolved_at?: string;
  confirmed: boolean;
  related_changes: string[];
  affected_endpoints: string[];
  sample_size: number;
}

export interface StatisticalSignificance {
  p_value: number;
  confidence_interval: [number, number];
  sample_size_adequate: boolean;
  test_method: "t_test" | "mann_whitney" | "chi_squared" | "bootstrap";
  significant: boolean;
}

export interface SuspectedRegression {
  regression_id: string;
  fingerprints: RegressionFingerprint[];
  cluster?: RegressionCluster;
  suspected_cause: string;
  root_cause_analysis?: RootCauseAnalysis;
  confidence: number;
  affected_users_estimate: number;
  affected_users_by_segment: Record<string, number>;
  business_impact_estimate_cents: number;
  recommendation: "rollback" | "hotfix" | "monitor" | "ignore" | "investigate";
  priority: number;
  assignee?: string;
  detected_at: string;
  status: RegressionStatus;
  timeline: RegressionTimelineEvent[];
}

export interface RegressionCluster {
  cluster_id: string;
  fingerprint_ids: string[];
  common_service?: string;
  common_endpoint?: string;
  common_change?: string;
  correlation_strength: number;
}

export interface RootCauseAnalysis {
  analysis_id: string;
  method: "automated" | "ai_assisted" | "manual";
  suspected_commits: string[];
  suspected_config_changes: string[];
  suspected_dependency_changes: string[];
  evidence: RCAEvidence[];
  confidence: number;
  narrative: string;
  recommended_fix: string;
}

export interface RCAEvidence {
  evidence_type: "temporal_correlation" | "code_change" | "config_change" | "dependency_update" | "metric_correlation";
  description: string;
  strength: number;
  source: string;
}

export interface RegressionTimelineEvent {
  event_type: "detected" | "confirmed" | "investigated" | "fix_deployed" | "verified" | "resolved" | "false_positive";
  detail: string;
  actor?: string;
  timestamp: string;
}

export interface KnownBadPattern {
  pattern_id: string;
  name: string;
  description: string;
  detection_rule: string;
  detection_query?: string;
  severity: "critical" | "high" | "medium";
  category: "performance" | "stability" | "security" | "data_integrity" | "resource_leak";
  remediation: string;
  remediation_automated: boolean;
  occurrences: number;
  last_seen_at?: string;
  auto_block_rollout: boolean;
  false_positive_rate: number;
  created_at: string;
  updated_at: string;
}

export interface PostReleaseComparison {
  comparison_id: string;
  release_version: string;
  baseline_version: string;
  comparison_window_hours: number;
  metrics: MetricComparison[];
  regressions_detected: number;
  improvements_detected: number;
  neutral_metrics: number;
  overall_delta: "better" | "worse" | "neutral" | "mixed";
  confidence: number;
  recommendation: "expand" | "hold" | "rollback" | "monitor";
  narrative: string;
  compared_at: string;
}

export interface MetricComparison {
  metric: string;
  category: string;
  baseline: number;
  current: number;
  delta_percent: number;
  significant: boolean;
  significance: StatisticalSignificance;
  direction: "improved" | "regressed" | "stable";
  weight: number;
  contribution_to_overall: number;
}
