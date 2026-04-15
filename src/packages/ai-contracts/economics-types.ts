// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Economics Types
// Budget policies, cost tracking, cache strategy, spend ceilings.
// ═══════════════════════════════════════════════════════════════

export type BudgetPosture = "aggressive" | "balanced" | "conservative" | "minimal";

export interface AIBudgetPolicy {
  policy_id: string;
  tenant_id: string;
  posture: BudgetPosture;
  daily_ceiling_cents: number;
  monthly_ceiling_cents: number;
  per_call_ceiling_cents: number;
  tier_budgets: Record<string, number>;
  alert_thresholds: BudgetAlertThreshold[];
  enforcement: "hard" | "soft" | "advisory";
}

export interface BudgetAlertThreshold {
  percent: number;
  action: "notify" | "throttle" | "block";
  notification_channel: string;
}

export interface AICostTracker {
  tracker_id: string;
  tenant_id: string;
  period: "daily" | "weekly" | "monthly";
  period_start: string;
  total_cost_cents: number;
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  cost_by_model: Record<string, number>;
  cost_by_task: Record<string, number>;
  cost_by_tier: Record<string, number>;
  cache_savings_cents: number;
}

export interface CacheStrategy {
  strategy_id: string;
  task_class: string;
  ttl_seconds: number;
  cache_key_fields: string[];
  max_entries: number;
  eviction_policy: "lru" | "lfu" | "ttl";
  stale_while_revalidate: boolean;
  cache_hit_rate?: number;
}

export interface SpendCeiling {
  ceiling_id: string;
  scope: "global" | "tenant" | "role" | "task";
  scope_id: string;
  ceiling_cents: number;
  current_spend_cents: number;
  period: "hourly" | "daily" | "monthly";
  exceeded: boolean;
  last_checked_at: string;
}

export interface FeatureCostAllocation {
  feature_id: string;
  feature_name: string;
  allocated_budget_cents: number;
  actual_spend_cents: number;
  calls_count: number;
  avg_cost_per_call_cents: number;
  roi_score?: number;
  period: string;
}
