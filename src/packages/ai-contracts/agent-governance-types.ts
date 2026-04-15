// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Agent Governance Types (Production-Grade)
// Role definitions, rights, planner/reviewer separation,
// escalation, lifecycle, council governance, capability matrix.
// ═══════════════════════════════════════════════════════════════

export type AgentMaturity = "experimental" | "alpha" | "beta" | "stable" | "hardened" | "deprecated";

export type AgentRight =
  | "observe" | "recommend" | "draft" | "execute" | "approve"
  | "escalate" | "delegate" | "override" | "create_memory"
  | "modify_memory" | "invoke_tool" | "spawn_subtask"
  | "access_pii" | "financial_action" | "external_communication";

export type AgentLifecycleState =
  | "provisioned" | "onboarding" | "active" | "suspended"
  | "under_review" | "deprecated" | "decommissioned";

export type CouncilType = "business" | "finance" | "concierge" | "platform" | "security" | "executive";

// ── Role Definition ──

export interface AgentRoleDefinition {
  role_key: string;
  display_name: string;
  description: string;
  mission: string;
  council: CouncilType;
  maturity: AgentMaturity;
  lifecycle_state: AgentLifecycleState;
  rights: AgentRight[];
  forbidden_rights: AgentRight[];
  conditional_rights: ConditionalRight[];
  max_autonomy_level: number;
  autonomy_schedule?: AutonomySchedule;
  domains: string[];
  capabilities: string[];
  tools_allowed: string[];
  tools_forbidden: string[];
  kpis: AgentKPI[];
  escalation_targets: string[];
  delegation_sources: string[];
  memory_scope: "own" | "council" | "cross_council" | "global";
  memory_retention_days: number;
  budget_class: string;
  cost_budget_daily_cents: number;
  cost_budget_monthly_cents: number;
  max_invocations_per_hour: number;
  max_concurrent_tasks: number;
  preferred_model_tier: string;
  required_approvals_for_promotion: number;
  promotion_criteria: PromotionCriterion[];
  demotion_criteria: DemotionCriterion[];
  created_at: string;
  updated_at: string;
}

export interface ConditionalRight {
  right: AgentRight;
  condition: string;
  requires_confidence_above: number;
  requires_approval: boolean;
  time_limited_hours?: number;
  audit_required: boolean;
}

export interface AutonomySchedule {
  business_hours_level: number;
  off_hours_level: number;
  weekend_level: number;
  emergency_level: number;
  timezone: string;
}

// ── KPIs ──

export interface AgentKPI {
  kpi_id: string;
  name: string;
  description: string;
  metric: string;
  target: number;
  warning_threshold: number;
  critical_threshold: number;
  current?: number;
  trend: "improving" | "stable" | "degrading" | "unknown";
  unit: string;
  direction: "higher_better" | "lower_better";
  measurement_frequency: "realtime" | "hourly" | "daily" | "weekly";
  weight: number;
}

// ── Planner/Reviewer Separation ──

export interface PlannerReviewerSeparation {
  task_id: string;
  task_type: string;
  domain: string;
  planner_role: string;
  reviewer_role: string;
  planner_output: unknown;
  planner_confidence: number;
  planner_reasoning: string;
  reviewer_verdict: "approve" | "approve_with_changes" | "revise" | "reject" | "escalate";
  reviewer_confidence: number;
  reviewer_feedback?: string;
  reviewer_changes?: unknown;
  iteration: number;
  max_iterations: number;
  convergence_threshold: number;
  converged: boolean;
  total_cost_cents: number;
  total_duration_ms: number;
  final_output?: unknown;
  audit_trail: PlannerReviewerIteration[];
}

export interface PlannerReviewerIteration {
  iteration: number;
  planner_output_hash: string;
  reviewer_verdict: string;
  changes_requested: string[];
  improvement_score: number;
  timestamp: string;
}

// ── Escalation ──

export interface AgentEscalationRule {
  rule_id: string;
  from_role: string;
  to_target: string;
  to_target_type: "agent" | "council" | "human" | "founder";
  trigger_condition: string;
  trigger_metrics?: EscalationMetricTrigger[];
  urgency: "low" | "normal" | "high" | "critical" | "emergency";
  auto_escalate: boolean;
  timeout_minutes: number;
  max_escalation_depth: number;
  cooldown_minutes: number;
  escalation_message_template: string;
  context_to_include: string[];
  notification_channels: string[];
  sla_minutes?: number;
  fallback_if_timeout: "retry" | "skip" | "block" | "founder_alert";
}

export interface EscalationMetricTrigger {
  metric: string;
  operator: "gt" | "lt" | "eq" | "change_percent";
  threshold: number;
  window_minutes: number;
}

// ── Governance Report ──

export interface AgentGovernanceReport {
  report_id: string;
  role_key: string;
  period: string;
  lifecycle_state: AgentLifecycleState;
  total_invocations: number;
  successful_invocations: number;
  failed_invocations: number;
  escalations: number;
  escalation_rate: number;
  approvals_requested: number;
  approvals_granted: number;
  approvals_denied: number;
  avg_confidence: number;
  avg_quality_score: number;
  avg_latency_ms: number;
  budget_used_cents: number;
  budget_limit_cents: number;
  budget_utilization_percent: number;
  kpi_scores: Record<string, { target: number; actual: number; met: boolean }>;
  maturity_recommendation: AgentMaturity;
  promotion_eligible: boolean;
  demotion_risk: boolean;
  issues: GovernanceIssue[];
  recommendations: string[];
  generated_at: string;
}

export interface GovernanceIssue {
  issue_id: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "performance" | "budget" | "safety" | "compliance" | "reliability";
  description: string;
  remediation: string;
  auto_remediation_available: boolean;
}

// ── Promotion/Demotion ──

export interface PromotionCriterion {
  criterion_id: string;
  metric: string;
  operator: "gt" | "lt";
  threshold: number;
  observation_period_days: number;
  weight: number;
}

export interface DemotionCriterion {
  criterion_id: string;
  metric: string;
  operator: "gt" | "lt";
  threshold: number;
  observation_period_days: number;
  severity: "warning" | "immediate";
}

// ── Capability Declaration ──

export interface AgentCapabilityDeclaration {
  role_key: string;
  capabilities: AgentCapability[];
  tools: AgentToolDeclaration[];
  supported_task_types: string[];
  max_context_tokens: number;
  supports_streaming: boolean;
  supports_function_calling: boolean;
  supports_multi_turn: boolean;
  supports_vision: boolean;
  preferred_models: string[];
  version: string;
  last_verified_at: string;
}

export interface AgentCapability {
  capability_id: string;
  name: string;
  proficiency: "novice" | "competent" | "proficient" | "expert";
  verified: boolean;
  last_tested_at?: string;
  success_rate: number;
}

export interface AgentToolDeclaration {
  tool_name: string;
  access_level: string;
  proficiency: number;
  usage_count: number;
  success_rate: number;
  avg_execution_ms: number;
}

// ── Council Governance ──

export interface CouncilGovernanceConfig {
  council: CouncilType;
  members: string[];
  quorum_required: number;
  voting_strategy: "majority" | "unanimous" | "weighted" | "leader_decides";
  leader_role?: string;
  cross_council_escalation_target: string;
  budget_pool_daily_cents: number;
  shared_memory_enabled: boolean;
  conflict_resolution: "leader_decides" | "escalate" | "vote" | "round_robin";
  meeting_frequency: "continuous" | "hourly" | "daily" | "on_demand";
}
