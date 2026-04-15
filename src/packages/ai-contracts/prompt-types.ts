// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Prompt Types (Production-Grade)
// Definitions, versioning, ownership, rollout/rollback, quality metadata,
// A/B testing, guardrails, chain-of-thought control.
// ═══════════════════════════════════════════════════════════════

export type PromptStatus = "draft" | "review" | "active" | "shadow" | "deprecated" | "archived" | "rollback" | "emergency_disabled";

export type PromptRiskTier = "r0_trivial" | "r1_low" | "r2_medium" | "r3_high" | "r4_critical" | "r5_existential";

export type PromptOutputMode = "text" | "json" | "structured" | "streaming" | "function_call" | "multi_turn";

export type PromptChainStrategy = "none" | "sequential" | "parallel" | "conditional" | "recursive";

// ── Core Definition ──

export interface PromptDefinition {
  prompt_id: string;
  family_id: string;
  version: number;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  assistant_prefill?: string;
  variables: PromptVariable[];
  output_schema?: Record<string, unknown>;
  output_mode: PromptOutputMode;
  status: PromptStatus;
  risk_tier: PromptRiskTier;
  owner_service: string;
  owner_team: string;
  capability_id: string;
  task_class: string;
  guardrails: PromptGuardrail[];
  chain_config?: PromptChainConfig;
  model_constraints: ModelConstraint[];
  token_budget: TokenBudget;
  examples: PromptExample[];
  tags: string[];
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  deprecation_reason?: string;
  successor_prompt_id?: string;
}

export interface PromptVariable {
  name: string;
  type: "string" | "number" | "boolean" | "json" | "array" | "enum" | "date" | "file_ref";
  required: boolean;
  description: string;
  default_value?: unknown;
  validation?: string;
  max_length?: number;
  enum_values?: string[];
  sensitive: boolean;
  redact_in_logs: boolean;
}

export interface PromptGuardrail {
  guardrail_id: string;
  type: "input_validation" | "output_validation" | "content_filter" | "pii_scrub" | "hallucination_check" | "bias_check" | "toxicity_check" | "factuality_gate";
  severity: "block" | "warn" | "log";
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface PromptChainConfig {
  strategy: PromptChainStrategy;
  steps: PromptChainStep[];
  max_depth: number;
  timeout_ms: number;
  error_strategy: "fail_fast" | "skip_failed" | "retry_once" | "fallback";
}

export interface PromptChainStep {
  step_id: string;
  prompt_id: string;
  order: number;
  condition?: string;
  input_mapping: Record<string, string>;
  output_key: string;
  required: boolean;
}

export interface ModelConstraint {
  constraint_type: "min_context_window" | "supports_vision" | "supports_function_calling" | "supports_structured_output" | "provider_allowlist" | "provider_denylist" | "tier_minimum";
  value: unknown;
}

export interface TokenBudget {
  max_input_tokens: number;
  max_output_tokens: number;
  max_total_tokens: number;
  temperature: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface PromptExample {
  example_id: string;
  input: Record<string, unknown>;
  expected_output: unknown;
  quality_label: "gold" | "silver" | "bronze";
  notes?: string;
}

// ── Versioning ──

export interface PromptVersion {
  prompt_id: string;
  version: number;
  changelog: string;
  diff_summary: string;
  breaking_change: boolean;
  migration_notes?: string;
  promoted_by?: string;
  promoted_at?: string;
  rollback_from?: number;
  quality_score?: number;
  regression_check_passed: boolean;
  review_status: "pending" | "approved" | "rejected";
  reviewer?: string;
  review_notes?: string;
}

// ── Rollout ──

export interface PromptRollout {
  rollout_id: string;
  prompt_id: string;
  from_version: number;
  to_version: number;
  strategy: "immediate" | "canary" | "shadow" | "ab_test" | "gradual";
  canary_percent?: number;
  shadow_mode: boolean;
  traffic_split?: TrafficSplit[];
  status: "pending" | "active" | "paused" | "completed" | "rolled_back" | "failed";
  health_check_interval_ms: number;
  auto_rollback_on_regression: boolean;
  regression_threshold: number;
  started_at: string;
  completed_at?: string;
  rolled_back_at?: string;
  rollback_reason?: string;
}

export interface TrafficSplit {
  variant: string;
  prompt_version: number;
  percent: number;
  model_override?: string;
}

// ── Quality ──

export interface PromptQualityMetadata {
  prompt_id: string;
  version: number;
  accuracy_score: number;
  hallucination_rate: number;
  factuality_score: number;
  coherence_score: number;
  relevance_score: number;
  safety_score: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  avg_cost_cents: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  sample_size: number;
  confidence_interval: [number, number];
  last_evaluated_at: string;
  evaluated_model: string;
  degradation_detected: boolean;
  degradation_since_version?: number;
}

// ── Family Registry ──

export interface PromptFamily {
  family_id: string;
  name: string;
  description: string;
  domain: string;
  capability_ids: string[];
  active_version: number;
  versions: number[];
  owner_service: string;
  risk_tier: PromptRiskTier;
  review_required: boolean;
  auto_rollback_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ── Prompt Audit ──

export interface PromptAuditEntry {
  audit_id: string;
  prompt_id: string;
  version: number;
  action: "created" | "updated" | "promoted" | "deprecated" | "rolled_back" | "emergency_disabled" | "reviewed" | "tested";
  actor: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
