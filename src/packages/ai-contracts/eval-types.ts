// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Eval Types (Production-Grade)
// Prompt evaluations, regression/hallucination evals,
// task success benchmarks, A/B testing, continuous monitoring.
// ═══════════════════════════════════════════════════════════════

export type EvalStatus = "pending" | "queued" | "running" | "completed" | "failed" | "cancelled" | "timeout";

export type EvalCategory =
  | "accuracy" | "hallucination" | "regression" | "cost"
  | "latency" | "safety" | "task_success" | "factuality"
  | "coherence" | "relevance" | "bias" | "toxicity"
  | "robustness" | "consistency" | "grounding";

export type EvalJudgeType = "automated" | "model_as_judge" | "human" | "consensus" | "statistical";

// ── Eval Run ──

export interface EvalRun {
  eval_id: string;
  eval_suite_id?: string;
  prompt_id: string;
  prompt_version: number;
  model_id: string;
  model_version?: string;
  categories: EvalCategory[];
  status: EvalStatus;
  judge_type: EvalJudgeType;
  judge_model?: string;
  test_cases: EvalTestCase[];
  aggregate_scores: Record<EvalCategory, number>;
  aggregate_score: number;
  pass_rate: number;
  total_cost_cents: number;
  total_tokens: number;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  triggered_by: "manual" | "ci" | "scheduled" | "prompt_change" | "model_change" | "regression_alert";
  metadata?: Record<string, unknown>;
}

export interface EvalTestCase {
  case_id: string;
  case_name?: string;
  category: EvalCategory;
  input: Record<string, unknown>;
  expected_output?: unknown;
  actual_output?: unknown;
  reference_output?: unknown;
  score: number;
  scores_by_dimension: Record<string, number>;
  passed: boolean;
  failure_reason?: string;
  failure_category?: string;
  latency_ms: number;
  cost_cents: number;
  input_tokens: number;
  output_tokens: number;
  grounding_sources_used: number;
  grounding_sources_verified: number;
  judge_reasoning?: string;
  tags: string[];
}

// ── Hallucination Eval ──

export interface HallucinationEval {
  eval_id: string;
  prompt_id: string;
  model_id: string;
  total_claims: number;
  grounded_claims: number;
  ungrounded_claims: number;
  fabricated_claims: number;
  hallucination_rate: number;
  critical_hallucinations: HallucinationInstance[];
  sources_cited: number;
  sources_verified: number;
  source_accuracy_rate: number;
  claim_categories: Record<string, { total: number; hallucinated: number }>;
  worst_performing_categories: string[];
  improvement_vs_baseline: number;
  evaluated_at: string;
}

export interface HallucinationInstance {
  instance_id: string;
  claim: string;
  claim_type: "factual" | "numerical" | "temporal" | "attribution" | "inference" | "comparison";
  severity: "critical" | "high" | "medium" | "low";
  expected_truth?: string;
  source_checked: boolean;
  source_contradicts: boolean;
  fabrication_type: "complete" | "exaggeration" | "conflation" | "outdated" | "misattribution";
}

// ── Regression Eval ──

export interface RegressionEval {
  eval_id: string;
  prompt_id: string;
  baseline_version: number;
  current_version: number;
  baseline_model?: string;
  current_model?: string;
  baseline_score: number;
  current_score: number;
  delta: number;
  delta_percent: number;
  statistically_significant: boolean;
  p_value: number;
  sample_size: number;
  regressed: boolean;
  regressed_categories: EvalCategory[];
  regressed_cases: RegressionCase[];
  improved_cases: RegressionCase[];
  stable_cases: number;
  recommendation: "promote" | "hold" | "rollback" | "investigate";
  auto_rollback_triggered: boolean;
}

export interface RegressionCase {
  case_id: string;
  category: EvalCategory;
  baseline_score: number;
  current_score: number;
  delta: number;
  severity: "critical" | "notable" | "minor";
  root_cause_hypothesis?: string;
}

// ── Task Benchmark ──

export interface TaskSuccessBenchmark {
  benchmark_id: string;
  task_class: string;
  model_id: string;
  prompt_version: number;
  success_rate: number;
  partial_success_rate: number;
  avg_quality_score: number;
  quality_distribution: Record<string, number>;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  avg_cost_cents: number;
  avg_tokens: number;
  sample_size: number;
  confidence_interval: [number, number];
  comparison_vs_baseline: number;
  best_model_for_task: boolean;
  last_run_at: string;
}

// ── Eval Suite ──

export interface EvalSuite {
  suite_id: string;
  name: string;
  description: string;
  categories: EvalCategory[];
  test_case_count: number;
  test_cases: EvalTestCaseDefinition[];
  schedule: "on_change" | "hourly" | "daily" | "weekly" | "manual";
  auto_run_on_prompt_change: boolean;
  auto_run_on_model_change: boolean;
  last_run_at?: string;
  last_run_status?: EvalStatus;
  pass_threshold: number;
  regression_threshold: number;
  alert_on_regression: boolean;
  alert_channels: string[];
  owner_service: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface EvalTestCaseDefinition {
  case_id: string;
  name: string;
  category: EvalCategory;
  input: Record<string, unknown>;
  expected_output?: unknown;
  scoring_rubric: ScoringRubric;
  weight: number;
  critical: boolean;
  tags: string[];
}

export interface ScoringRubric {
  rubric_type: "exact_match" | "semantic_similarity" | "rubric_based" | "model_judge" | "custom_function";
  criteria: RubricCriterion[];
  pass_threshold: number;
}

export interface RubricCriterion {
  criterion_id: string;
  name: string;
  description: string;
  weight: number;
  scoring: "binary" | "scale_1_5" | "scale_1_10" | "percentage";
}

// ── Continuous Monitoring ──

export interface EvalMonitoringConfig {
  config_id: string;
  prompt_id: string;
  sampling_rate: number;
  categories_monitored: EvalCategory[];
  alert_thresholds: EvalAlertThreshold[];
  dashboard_enabled: boolean;
  retention_days: number;
  comparison_baseline: "previous_version" | "best_version" | "rolling_average";
}

export interface EvalAlertThreshold {
  category: EvalCategory;
  metric: string;
  operator: "lt" | "gt" | "change_percent";
  threshold: number;
  window_minutes: number;
  min_sample_size: number;
  alert_channels: string[];
  auto_action?: "pause_rollout" | "rollback" | "notify_only";
}

// ── Eval Report ──

export interface EvalReport {
  report_id: string;
  period: string;
  suites_run: number;
  total_test_cases: number;
  overall_pass_rate: number;
  regressions_detected: number;
  regressions_auto_rolled_back: number;
  hallucination_rate_avg: number;
  top_failing_categories: EvalCategory[];
  model_comparison: Record<string, { score: number; cost_cents: number; latency_ms: number }>;
  improvement_trend: number;
  recommendations: string[];
  generated_at: string;
}
