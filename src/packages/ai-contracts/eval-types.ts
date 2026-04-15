// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Eval Types
// Prompt evaluations, regression/hallucination evals, benchmarks.
// ═══════════════════════════════════════════════════════════════

export type EvalStatus = "pending" | "running" | "completed" | "failed";

export type EvalCategory = "accuracy" | "hallucination" | "regression" | "cost" | "latency" | "safety" | "task_success";

export interface EvalRun {
  eval_id: string;
  prompt_id: string;
  prompt_version: number;
  model_id: string;
  category: EvalCategory;
  status: EvalStatus;
  test_cases: EvalTestCase[];
  aggregate_score: number;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface EvalTestCase {
  case_id: string;
  input: Record<string, unknown>;
  expected_output?: unknown;
  actual_output?: unknown;
  score: number;
  passed: boolean;
  failure_reason?: string;
  latency_ms: number;
  cost_cents: number;
}

export interface HallucinationEval {
  eval_id: string;
  prompt_id: string;
  total_claims: number;
  grounded_claims: number;
  ungrounded_claims: number;
  hallucination_rate: number;
  critical_hallucinations: string[];
  sources_cited: number;
  sources_verified: number;
}

export interface RegressionEval {
  eval_id: string;
  prompt_id: string;
  baseline_version: number;
  current_version: number;
  baseline_score: number;
  current_score: number;
  delta: number;
  regressed: boolean;
  regressed_cases: string[];
  improved_cases: string[];
}

export interface TaskSuccessBenchmark {
  benchmark_id: string;
  task_class: string;
  model_id: string;
  success_rate: number;
  avg_quality_score: number;
  avg_latency_ms: number;
  avg_cost_cents: number;
  sample_size: number;
  last_run_at: string;
}

export interface EvalSuite {
  suite_id: string;
  name: string;
  description: string;
  categories: EvalCategory[];
  test_case_count: number;
  schedule: "on_change" | "daily" | "weekly" | "manual";
  last_run_at?: string;
  pass_threshold: number;
}
