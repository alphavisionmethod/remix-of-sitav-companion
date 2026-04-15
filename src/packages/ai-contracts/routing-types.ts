// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Routing Types (Production-Grade)
// Model routing policies, inference tiers, local vs cloud,
// fallback chains, provider health, cost-aware selection.
// ═══════════════════════════════════════════════════════════════

export type InferenceTier = "utility" | "standard" | "premium" | "sovereign" | "local_only";

export type InferenceLocation = "cloud" | "edge" | "local" | "hybrid" | "sovereign_cloud";

export type RoutingStrategy = "lowest_cost" | "lowest_latency" | "highest_quality" | "balanced" | "policy_driven" | "round_robin";

export type ProviderStatus = "healthy" | "degraded" | "partial_outage" | "full_outage" | "maintenance" | "rate_limited";

// ── Routing Policy ──

export interface ModelRoutingPolicy {
  policy_id: string;
  policy_name: string;
  task_class: string;
  risk_tier: string;
  preferred_tier: InferenceTier;
  preferred_location: InferenceLocation;
  routing_strategy: RoutingStrategy;
  model_preferences: ModelPreference[];
  fallback_chain: FallbackRule[];
  max_latency_ms: number;
  max_cost_cents: number;
  require_grounding: boolean;
  require_structured_output: boolean;
  require_function_calling: boolean;
  min_context_window: number;
  data_residency?: string;
  provider_allowlist?: string[];
  provider_denylist?: string[];
  time_of_day_overrides?: TimeOfDayOverride[];
  load_balancing: LoadBalancingConfig;
  circuit_breaker: CircuitBreakerConfig;
  cache_policy?: RouteCachePolicy;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ModelPreference {
  model_id: string;
  provider: string;
  tier: InferenceTier;
  location: InferenceLocation;
  capabilities: string[];
  context_window: number;
  max_output_tokens: number;
  cost_per_1k_input_cents: number;
  cost_per_1k_output_cents: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  priority: number;
  weight: number;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_structured_output: boolean;
  supports_streaming: boolean;
  rate_limit_rpm: number;
  rate_limit_tpm: number;
  quality_score: number;
  reliability_score: number;
  enabled: boolean;
}

// ── Fallback ──

export interface FallbackRule {
  order: number;
  model_id: string;
  trigger: FallbackTrigger;
  max_retries: number;
  delay_ms: number;
  backoff_multiplier: number;
  max_delay_ms: number;
  condition?: string;
  degrade_quality_acceptable: boolean;
}

export type FallbackTrigger =
  | "timeout"
  | "error"
  | "rate_limited"
  | "overloaded"
  | "budget_exceeded"
  | "quality_below_threshold"
  | "context_too_large"
  | "provider_outage"
  | "circuit_open";

// ── Circuit Breaker ──

export interface CircuitBreakerConfig {
  enabled: boolean;
  failure_threshold: number;
  success_threshold: number;
  timeout_ms: number;
  half_open_max_calls: number;
  monitor_window_ms: number;
}

export interface CircuitBreakerState {
  model_id: string;
  state: "closed" | "open" | "half_open";
  failure_count: number;
  success_count: number;
  last_failure_at?: string;
  last_success_at?: string;
  opened_at?: string;
  next_attempt_at?: string;
}

// ── Load Balancing ──

export interface LoadBalancingConfig {
  strategy: "weighted_round_robin" | "least_connections" | "random" | "consistent_hash";
  sticky_session: boolean;
  health_check_interval_ms: number;
}

// ── Time Overrides ──

export interface TimeOfDayOverride {
  start_hour_utc: number;
  end_hour_utc: number;
  override_tier?: InferenceTier;
  override_model?: string;
  reason: string;
}

// ── Cache ──

export interface RouteCachePolicy {
  enabled: boolean;
  ttl_seconds: number;
  max_entries: number;
  cache_key_strategy: "exact_input" | "semantic_hash" | "task_class_hash";
  invalidation_triggers: string[];
}

// ── Route Decision ──

export interface InferenceRoute {
  route_id: string;
  task_class: string;
  selected_model: string;
  selected_provider: string;
  selected_tier: InferenceTier;
  selected_location: InferenceLocation;
  routing_reason: string;
  routing_strategy_used: RoutingStrategy;
  policy_id: string;
  estimated_cost_cents: number;
  estimated_latency_ms: number;
  fallback_position: number;
  circuit_breaker_state: "closed" | "open" | "half_open";
  cache_hit: boolean;
  data_residency_compliant: boolean;
  alternatives_considered: number;
  routed_at: string;
}

// ── Provider Health ──

export interface ProviderHealthReport {
  provider: string;
  status: ProviderStatus;
  models: ModelHealthEntry[];
  avg_latency_ms: number;
  error_rate_percent: number;
  rate_limit_utilization_percent: number;
  last_incident_at?: string;
  uptime_30d_percent: number;
  checked_at: string;
}

export interface ModelHealthEntry {
  model_id: string;
  status: ProviderStatus;
  avg_latency_ms: number;
  p95_latency_ms: number;
  error_rate_percent: number;
  requests_last_hour: number;
  rate_limit_remaining: number;
  quality_score: number;
  last_success_at?: string;
  last_failure_at?: string;
}

// ── Capability Report ──

export interface ModelCapabilityReport {
  model_id: string;
  provider: string;
  display_name: string;
  tier: InferenceTier;
  capabilities: string[];
  context_window: number;
  max_output_tokens: number;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_structured_output: boolean;
  supports_streaming: boolean;
  supports_fine_tuning: boolean;
  supported_languages: string[];
  input_modalities: ("text" | "image" | "audio" | "video")[];
  output_modalities: ("text" | "image" | "audio")[];
  availability: ProviderStatus;
  deprecation_date?: string;
  successor_model?: string;
  last_health_check_at: string;
  benchmark_scores: Record<string, number>;
}

// ── Routing Analytics ──

export interface RoutingAnalytics {
  period: string;
  total_routes: number;
  cache_hit_rate: number;
  avg_routing_latency_ms: number;
  fallback_rate: number;
  circuit_breaker_trips: number;
  routes_by_model: Record<string, number>;
  routes_by_tier: Record<string, number>;
  routes_by_strategy: Record<string, number>;
  cost_savings_from_routing_cents: number;
  quality_impact_score: number;
}
