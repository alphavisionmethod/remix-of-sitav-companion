// ═══════════════════════════════════════════════════════════════
// SITA OS — Dry Run Types (Production-Grade)
// Command/policy/rollout/approval simulation contracts with
// impact analysis, blast radius, and replay capability.
// ═══════════════════════════════════════════════════════════════

export type DryRunScope = "command" | "policy" | "rollout" | "approval" | "migration" | "budget" | "config_change" | "permission_change" | "ai_prompt";

export type DryRunResult = "safe" | "safe_with_warnings" | "warning" | "dangerous" | "blocked" | "inconclusive";

export type DryRunFidelity = "full" | "approximated" | "estimated" | "skeleton";

// ── Request ──

export interface DryRunRequest<TInput = unknown> {
  dry_run_id: string;
  scope: DryRunScope;
  input: TInput;
  fidelity: DryRunFidelity;
  simulate_side_effects: boolean;
  simulate_notifications: boolean;
  simulate_downstream: boolean;
  compare_with_live: boolean;
  blast_radius_analysis: boolean;
  rollback_simulation: boolean;
  timeout_ms: number;
  requested_by: string;
  requested_at: string;
  context?: Record<string, unknown>;
}

// ── Response ──

export interface DryRunResponse<TOutput = unknown> {
  dry_run_id: string;
  scope: DryRunScope;
  fidelity: DryRunFidelity;
  result: DryRunResult;
  result_confidence: number;
  output: TOutput;
  side_effects_predicted: PredictedSideEffect[];
  blast_radius?: BlastRadius;
  risk_score: number;
  risk_breakdown: RiskBreakdown;
  warnings: DryRunWarning[];
  blockers: DryRunBlocker[];
  live_comparison?: LiveComparison;
  rollback_feasibility?: RollbackFeasibility;
  downstream_impacts: DownstreamImpact[];
  resource_estimates: ResourceEstimate[];
  duration_ms: number;
  simulation_steps: number;
  completed_at: string;
}

export interface PredictedSideEffect {
  effect_id: string;
  effect_type: string;
  target: string;
  target_type: string;
  description: string;
  reversible: boolean;
  reversal_cost: "trivial" | "low" | "medium" | "high" | "impossible";
  probability: number;
  impact: "critical" | "high" | "medium" | "low" | "negligible";
  timing: "immediate" | "delayed" | "eventual";
  affected_entities_count: number;
}

export interface BlastRadius {
  affected_users: number;
  affected_services: string[];
  affected_data_tables: string[];
  affected_integrations: string[];
  financial_impact_cents: number;
  reputational_risk: "none" | "low" | "medium" | "high";
  recovery_time_estimate_minutes: number;
  containment_possible: boolean;
}

export interface RiskBreakdown {
  data_risk: number;
  availability_risk: number;
  financial_risk: number;
  compliance_risk: number;
  security_risk: number;
  performance_risk: number;
  user_experience_risk: number;
}

export interface DryRunWarning {
  warning_id: string;
  category: string;
  message: string;
  severity: "high" | "medium" | "low";
  mitigation?: string;
}

export interface DryRunBlocker {
  blocker_id: string;
  category: string;
  message: string;
  resolution: string;
  auto_resolvable: boolean;
}

export interface DownstreamImpact {
  service: string;
  impact_type: "data_change" | "behavior_change" | "performance_change" | "availability_risk";
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  cascade_depth: number;
}

export interface ResourceEstimate {
  resource: string;
  current_usage: number;
  projected_usage: number;
  delta: number;
  unit: string;
  within_limits: boolean;
}

// ── Live Comparison ──

export interface LiveComparison {
  live_state: Record<string, unknown>;
  simulated_state: Record<string, unknown>;
  differences: StateDifference[];
  divergence_score: number;
  comparison_timestamp: string;
  live_data_age_ms: number;
}

export interface StateDifference {
  path: string;
  field: string;
  live_value: unknown;
  simulated_value: unknown;
  significance: "critical" | "notable" | "minor" | "cosmetic";
  explanation?: string;
}

// ── Rollback Feasibility ──

export interface RollbackFeasibility {
  feasible: boolean;
  confidence: number;
  strategy: "full_revert" | "partial_revert" | "compensating_action" | "manual_only" | "impossible";
  estimated_duration_minutes: number;
  data_loss_risk: "none" | "minimal" | "partial" | "significant";
  blockers: string[];
  prerequisites: string[];
}

// ── History ──

export interface DryRunHistory {
  dry_run_id: string;
  scope: DryRunScope;
  fidelity: DryRunFidelity;
  result: DryRunResult;
  risk_score: number;
  blast_radius_users: number;
  requested_by: string;
  requested_at: string;
  duration_ms: number;
  followed_by_execution: boolean;
  execution_outcome?: string;
  execution_matched_prediction: boolean;
  prediction_accuracy: number;
}

// ── Comparison Report ──

export interface DryRunComparisonReport {
  report_id: string;
  dry_run_id: string;
  execution_id?: string;
  predicted_result: DryRunResult;
  actual_result?: string;
  predicted_side_effects: number;
  actual_side_effects: number;
  prediction_accuracy: number;
  missed_effects: string[];
  false_positive_effects: string[];
  calibration_recommendation: string;
  generated_at: string;
}
