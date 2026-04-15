// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Economics Types (Production-Grade)
// Budget policies, cost tracking, cache strategy, spend ceilings,
// feature cost allocation, ROI tracking, forecasting.
// ═══════════════════════════════════════════════════════════════

export type BudgetPosture = "aggressive" | "growth" | "balanced" | "conservative" | "minimal" | "emergency";

export type BudgetEnforcement = "hard_block" | "soft_warn" | "advisory" | "emergency_only";

export type CostOptimizationStrategy = "cache_first" | "tier_downgrade" | "batch_requests" | "defer_non_critical" | "reduce_tokens" | "model_substitution";

// ── Budget Policy ──

export interface AIBudgetPolicy {
  policy_id: string;
  tenant_id: string;
  policy_name: string;
  posture: BudgetPosture;
  hourly_ceiling_cents: number;
  daily_ceiling_cents: number;
  weekly_ceiling_cents: number;
  monthly_ceiling_cents: number;
  per_call_ceiling_cents: number;
  per_call_token_limit: number;
  tier_budgets: Record<string, TierBudget>;
  domain_budgets: Record<string, number>;
  role_budgets: Record<string, number>;
  alert_thresholds: BudgetAlertThreshold[];
  enforcement: BudgetEnforcement;
  optimization_strategies: CostOptimizationStrategy[];
  auto_downgrade_tier_at_percent: number;
  emergency_reserve_percent: number;
  rollover_unused: boolean;
  rollover_max_percent: number;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export interface TierBudget {
  tier: string;
  daily_ceiling_cents: number;
  monthly_ceiling_cents: number;
  per_call_ceiling_cents: number;
  max_calls_per_hour: number;
  priority: number;
}

export interface BudgetAlertThreshold {
  threshold_id: string;
  percent: number;
  action: "notify" | "throttle" | "downgrade_tier" | "block" | "emergency_stop";
  notification_channels: string[];
  cooldown_minutes: number;
  escalate_to?: string;
  auto_recover: boolean;
}

// ── Cost Tracking ──

export interface AICostTracker {
  tracker_id: string;
  tenant_id: string;
  period: "hourly" | "daily" | "weekly" | "monthly";
  period_start: string;
  period_end: string;
  total_cost_cents: number;
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cached_calls: number;
  cost_by_model: Record<string, ModelCostBreakdown>;
  cost_by_task: Record<string, number>;
  cost_by_tier: Record<string, number>;
  cost_by_domain: Record<string, number>;
  cost_by_role: Record<string, number>;
  cache_savings_cents: number;
  optimization_savings_cents: number;
  budget_utilization_percent: number;
  projected_end_of_period_cents: number;
  anomaly_detected: boolean;
  anomaly_details?: string;
}

export interface ModelCostBreakdown {
  model_id: string;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_cents: number;
  avg_latency_ms: number;
  cache_hit_rate: number;
  error_rate: number;
}

// ── Cache Strategy ──

export interface CacheStrategy {
  strategy_id: string;
  task_class: string;
  enabled: boolean;
  ttl_seconds: number;
  cache_key_fields: string[];
  max_entries: number;
  max_memory_mb: number;
  eviction_policy: "lru" | "lfu" | "ttl" | "fifo" | "adaptive";
  stale_while_revalidate: boolean;
  stale_max_age_seconds: number;
  semantic_matching: boolean;
  semantic_similarity_threshold: number;
  invalidation_triggers: string[];
  compression_enabled: boolean;
  cache_hit_rate?: number;
  avg_savings_cents?: number;
  last_evaluated_at?: string;
}

// ── Spend Ceilings ──

export interface SpendCeiling {
  ceiling_id: string;
  scope: "global" | "tenant" | "role" | "task" | "model" | "domain" | "feature";
  scope_id: string;
  ceiling_cents: number;
  current_spend_cents: number;
  reserved_cents: number;
  period: "hourly" | "daily" | "weekly" | "monthly";
  period_start: string;
  exceeded: boolean;
  exceeded_at?: string;
  breach_count: number;
  enforcement: BudgetEnforcement;
  auto_reset: boolean;
  last_checked_at: string;
  last_reset_at: string;
}

// ── Feature Cost Allocation ──

export interface FeatureCostAllocation {
  feature_id: string;
  feature_name: string;
  domain: string;
  capability_ids: string[];
  allocated_budget_cents: number;
  actual_spend_cents: number;
  calls_count: number;
  avg_cost_per_call_cents: number;
  avg_tokens_per_call: number;
  cache_hit_rate: number;
  primary_model: string;
  primary_tier: string;
  roi_score?: number;
  value_generated_estimate_cents?: number;
  cost_efficiency_grade: "A" | "B" | "C" | "D" | "F";
  optimization_opportunities: CostOptimizationOpportunity[];
  period: string;
}

export interface CostOptimizationOpportunity {
  opportunity_id: string;
  strategy: CostOptimizationStrategy;
  estimated_savings_cents: number;
  estimated_quality_impact: number;
  implementation_effort: "trivial" | "low" | "medium" | "high";
  description: string;
  auto_applicable: boolean;
}

// ── Forecasting ──

export interface CostForecast {
  forecast_id: string;
  tenant_id: string;
  horizon_days: number;
  projected_daily_costs: CostForecastPoint[];
  projected_total_cents: number;
  confidence: number;
  budget_exhaustion_date?: string;
  recommendation: "on_track" | "increase_budget" | "optimize" | "reduce_usage" | "emergency";
  factors: CostForecastFactor[];
  generated_at: string;
}

export interface CostForecastPoint {
  date: string;
  projected_cents: number;
  lower_bound_cents: number;
  upper_bound_cents: number;
  confidence: number;
}

export interface CostForecastFactor {
  factor: string;
  impact_direction: "increase" | "decrease";
  impact_percent: number;
  description: string;
}

// ── Cost Anomaly ──

export interface CostAnomaly {
  anomaly_id: string;
  detected_at: string;
  scope: string;
  scope_id: string;
  expected_cost_cents: number;
  actual_cost_cents: number;
  deviation_percent: number;
  severity: "critical" | "high" | "medium" | "low";
  probable_cause: string;
  auto_mitigated: boolean;
  mitigation_action?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
}
