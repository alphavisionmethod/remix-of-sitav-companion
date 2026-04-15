// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Tool Policy Types (Production-Grade)
// Tool access rules, data exposure, high-risk restrictions,
// execution policies, sandboxing, audit requirements.
// ═══════════════════════════════════════════════════════════════

export type ToolAccessLevel = "full" | "read_only" | "write_supervised" | "restricted" | "sandbox_only" | "forbidden";

export type DataClassification = "public" | "internal" | "confidential" | "restricted" | "pii" | "financial" | "health" | "legal";

export type ExecutionMode = "direct" | "supervised" | "dry_run_first" | "approval_required" | "sandbox" | "blocked";

// ── Tool Policy ──

export interface AIToolPolicy {
  policy_id: string;
  policy_name: string;
  role_key: string;
  maturity_required: "experimental" | "beta" | "stable" | "hardened";
  tool_policies: ToolPermission[];
  data_exposure_rules: DataExposureRule[];
  high_risk_restrictions: HighRiskRestriction[];
  sandbox_config: SandboxConfig;
  audit_config: ToolAuditConfig;
  rate_limits: ToolRateLimit[];
  active: boolean;
  version: number;
  effective_from: string;
  effective_until?: string;
  updated_at: string;
}

export interface ToolPermission {
  tool_name: string;
  tool_category: string;
  access_level: ToolAccessLevel;
  execution_mode: ExecutionMode;
  max_calls_per_hour: number;
  max_calls_per_day: number;
  requires_approval: boolean;
  approval_threshold_confidence: number;
  allowed_operations: string[];
  forbidden_operations: string[];
  parameter_restrictions: ParameterRestriction[];
  output_filters: OutputFilter[];
  timeout_ms: number;
  max_retries: number;
  idempotent: boolean;
  side_effect_declaration: SideEffectDeclaration;
}

export interface ParameterRestriction {
  parameter_name: string;
  max_value?: number;
  min_value?: number;
  allowed_values?: unknown[];
  forbidden_values?: unknown[];
  regex_pattern?: string;
  max_length?: number;
}

export interface OutputFilter {
  field: string;
  filter_type: "redact" | "mask" | "hash" | "truncate" | "remove";
  condition?: string;
  replacement?: string;
}

export interface SideEffectDeclaration {
  has_side_effects: boolean;
  effect_types: ("state_mutation" | "external_api" | "notification" | "financial" | "data_deletion" | "permission_change")[];
  reversible: boolean;
  rollback_supported: boolean;
  impact_scope: "user" | "workspace" | "organization" | "system";
}

// ── Data Exposure ──

export interface DataExposureRule {
  rule_id: string;
  data_category: string;
  data_classification: DataClassification;
  allowed_in_prompt: boolean;
  allowed_in_context: boolean;
  allowed_in_response: boolean;
  allowed_in_logs: boolean;
  redaction_required: boolean;
  redaction_strategy: "full" | "partial" | "hash" | "placeholder" | "tokenize" | "generalize";
  pii_fields: string[];
  retention_hours: number;
  encryption_required: boolean;
  consent_required: boolean;
  regulatory_tags: string[];
}

// ── High-Risk Restrictions ──

export interface HighRiskRestriction {
  restriction_id: string;
  action_category: string;
  description: string;
  risk_tier: string;
  max_autonomy_level: number;
  execution_mode: ExecutionMode;
  requires_dual_approval: boolean;
  requires_justification: boolean;
  cooldown_minutes: number;
  max_daily_invocations: number;
  max_financial_impact_cents: number;
  max_affected_records: number;
  audit_required: boolean;
  audit_retention_days: number;
  notification_targets: string[];
  time_window_restrictions?: { business_hours_only: boolean; quiet_hours_blocked: boolean };
}

// ── Execution Policy ──

export interface ToolExecutionPolicy {
  tool_name: string;
  max_retries: number;
  retry_backoff_ms: number;
  timeout_ms: number;
  circuit_breaker_threshold: number;
  rollback_capable: boolean;
  dry_run_required: boolean;
  confirmation_required: boolean;
  output_validation: "none" | "schema" | "semantic" | "full" | "adversarial";
  input_sanitization: "none" | "basic" | "strict" | "paranoid";
  resource_limits: ToolResourceLimits;
}

export interface ToolResourceLimits {
  max_memory_mb: number;
  max_cpu_seconds: number;
  max_network_calls: number;
  max_db_queries: number;
  max_file_size_mb: number;
  max_output_size_kb: number;
}

// ── Sandbox ──

export interface SandboxConfig {
  enabled: boolean;
  isolation_level: "none" | "process" | "container" | "vm";
  network_access: "full" | "allowlist" | "none";
  filesystem_access: "full" | "read_only" | "temp_only" | "none";
  allowed_endpoints?: string[];
  max_execution_time_ms: number;
  max_memory_mb: number;
  capture_output: boolean;
}

// ── Audit ──

export interface ToolAuditConfig {
  log_all_invocations: boolean;
  log_parameters: boolean;
  log_results: boolean;
  redact_sensitive_params: boolean;
  retention_days: number;
  alert_on_forbidden_attempt: boolean;
  alert_on_rate_limit: boolean;
  alert_channels: string[];
}

export interface ToolRateLimit {
  scope: "role" | "tool" | "category" | "global";
  scope_id: string;
  max_per_minute: number;
  max_per_hour: number;
  max_per_day: number;
  burst_limit: number;
  throttle_strategy: "reject" | "queue" | "delay";
}

// ── Tool Registry ──

export interface ToolRegistryEntry {
  tool_name: string;
  tool_category: string;
  display_name: string;
  description: string;
  version: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  side_effects: SideEffectDeclaration;
  default_access_level: ToolAccessLevel;
  default_execution_mode: ExecutionMode;
  risk_classification: "safe" | "moderate" | "high" | "critical";
  owner_service: string;
  documentation_url?: string;
  deprecated: boolean;
  successor_tool?: string;
}
