// ═══════════════════════════════════════════════════════════════
// SITA OS — Dry Run Types
// Command/policy/rollout/approval simulation contracts.
// ═══════════════════════════════════════════════════════════════

export type DryRunScope = "command" | "policy" | "rollout" | "approval" | "migration" | "budget";

export type DryRunResult = "safe" | "warning" | "dangerous" | "blocked";

export interface DryRunRequest<TInput = unknown> {
  dry_run_id: string;
  scope: DryRunScope;
  input: TInput;
  simulate_side_effects: boolean;
  compare_with_live: boolean;
  requested_by: string;
  requested_at: string;
}

export interface DryRunResponse<TOutput = unknown> {
  dry_run_id: string;
  scope: DryRunScope;
  result: DryRunResult;
  output: TOutput;
  side_effects_predicted: PredictedSideEffect[];
  risk_score: number;
  warnings: string[];
  blockers: string[];
  live_comparison?: LiveComparison;
  duration_ms: number;
  completed_at: string;
}

export interface PredictedSideEffect {
  effect_type: string;
  target: string;
  description: string;
  reversible: boolean;
  probability: number;
  impact: "high" | "medium" | "low";
}

export interface LiveComparison {
  live_state: Record<string, unknown>;
  simulated_state: Record<string, unknown>;
  differences: StateDifference[];
  divergence_score: number;
}

export interface StateDifference {
  field: string;
  live_value: unknown;
  simulated_value: unknown;
  significance: "critical" | "notable" | "minor";
}

export interface DryRunHistory {
  dry_run_id: string;
  scope: DryRunScope;
  result: DryRunResult;
  risk_score: number;
  requested_by: string;
  requested_at: string;
  followed_by_execution: boolean;
  execution_outcome?: string;
}
