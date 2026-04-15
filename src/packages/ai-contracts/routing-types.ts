// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Routing Types
// Model routing policies, inference tiers, fallback rules.
// ═══════════════════════════════════════════════════════════════

export type InferenceTier = "utility" | "standard" | "premium" | "sovereign";

export type InferenceLocation = "cloud" | "edge" | "local" | "hybrid";

export interface ModelRoutingPolicy {
  policy_id: string;
  task_class: string;
  risk_tier: string;
  preferred_tier: InferenceTier;
  preferred_location: InferenceLocation;
  model_preferences: ModelPreference[];
  fallback_chain: FallbackRule[];
  max_latency_ms: number;
  max_cost_cents: number;
  require_grounding: boolean;
}

export interface ModelPreference {
  model_id: string;
  provider: string;
  tier: InferenceTier;
  capabilities: string[];
  max_tokens: number;
  cost_per_1k_input_cents: number;
  cost_per_1k_output_cents: number;
  avg_latency_ms: number;
  priority: number;
}

export interface FallbackRule {
  order: number;
  model_id: string;
  trigger: "timeout" | "error" | "overloaded" | "budget_exceeded" | "quality_below_threshold";
  max_retries: number;
  delay_ms: number;
}

export interface InferenceRoute {
  route_id: string;
  task_class: string;
  selected_model: string;
  selected_tier: InferenceTier;
  routing_reason: string;
  policy_id: string;
  estimated_cost_cents: number;
  estimated_latency_ms: number;
  fallback_position: number;
}

export interface ModelCapabilityReport {
  model_id: string;
  provider: string;
  capabilities: string[];
  context_window: number;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_structured_output: boolean;
  supported_languages: string[];
  availability: "available" | "degraded" | "unavailable";
  last_health_check_at: string;
}
