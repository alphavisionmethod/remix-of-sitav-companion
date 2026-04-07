// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Routing Seed Service
// Seeds provider, model, capability routing, and launch honesty
// defaults for live AI activation
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

const PROVIDER_SEEDS = [
  {
    provider_key: "openai",
    display_name: "OpenAI",
    api_style: "openai",
    secret_env_name: "OPENAI_API_KEY",
    launch_stage: "active_internal",
    supports_streaming: true,
    supports_structured_output: true,
    supports_tools: true,
    supports_demo_mode: false,
    mode: "live",
  },
  {
    provider_key: "anthropic",
    display_name: "Anthropic",
    api_style: "anthropic",
    secret_env_name: "ANTHROPIC_API_KEY",
    launch_stage: "internal",
    supports_streaming: true,
    supports_structured_output: true,
    supports_tools: true,
    supports_demo_mode: false,
    mode: "live",
  },
  {
    provider_key: "lovable",
    display_name: "Lovable AI Gateway",
    api_style: "openai",
    secret_env_name: "LOVABLE_API_KEY",
    launch_stage: "active_internal",
    supports_streaming: true,
    supports_structured_output: true,
    supports_tools: false,
    supports_demo_mode: true,
    mode: "live",
  },
];

const MODEL_SEEDS = [
  {
    model_id: "gpt-4o",
    provider: "openai",
    provider_model_name: "gpt-4o",
    model_class: "standard",
    cost_tier: "standard",
    latency_tier: "fast",
    structured_output_support: true,
    tool_calling_support: true,
    supports_streaming: true,
    supports_json_mode: true,
    is_active: true,
    display_name: "GPT-4o (Balanced)",
  },
  {
    model_id: "gpt-4o-mini",
    provider: "openai",
    provider_model_name: "gpt-4o-mini",
    model_class: "utility",
    cost_tier: "utility",
    latency_tier: "realtime",
    structured_output_support: true,
    tool_calling_support: true,
    supports_streaming: true,
    supports_json_mode: true,
    is_active: true,
    display_name: "GPT-4o Mini (Economy)",
  },
  {
    model_id: "o3",
    provider: "openai",
    provider_model_name: "o3",
    model_class: "deep",
    cost_tier: "premium",
    latency_tier: "standard",
    structured_output_support: true,
    tool_calling_support: true,
    supports_streaming: true,
    supports_json_mode: true,
    is_active: true,
    display_name: "o3 (Premium Reasoning)",
  },
  {
    model_id: "claude-sonnet-4",
    provider: "anthropic",
    provider_model_name: "claude-sonnet-4-20250514",
    model_class: "standard",
    cost_tier: "standard",
    latency_tier: "fast",
    structured_output_support: true,
    tool_calling_support: true,
    supports_streaming: true,
    supports_json_mode: false,
    is_active: true,
    display_name: "Claude Sonnet 4 (Balanced)",
  },
  {
    model_id: "gemini-2.5-flash",
    provider: "lovable",
    provider_model_name: "google/gemini-2.5-flash",
    model_class: "utility",
    cost_tier: "utility",
    latency_tier: "realtime",
    structured_output_support: true,
    tool_calling_support: true,
    supports_streaming: true,
    supports_json_mode: true,
    is_active: true,
    display_name: "Gemini 2.5 Flash (Economy)",
  },
];

const CAPABILITY_ROUTING_SEEDS = [
  {
    capability_key: "advisor.chat.primary",
    routing_class: "balanced",
    budget_class: "standard",
    quality_requirement: "high",
    max_latency_class: "fast",
    launch_honesty_class: "partial",
    is_active: true,
    structured_output_required: false,
    tool_use_required: false,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
  {
    capability_key: "classification.extract",
    routing_class: "utility",
    budget_class: "utility",
    quality_requirement: "standard",
    max_latency_class: "realtime",
    launch_honesty_class: "partial",
    is_active: true,
    structured_output_required: true,
    tool_use_required: false,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
  {
    capability_key: "boardroom.weekly.summary",
    routing_class: "premium",
    budget_class: "premium",
    quality_requirement: "premium",
    max_latency_class: "standard",
    launch_honesty_class: "partial",
    is_active: true,
    structured_output_required: false,
    tool_use_required: false,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
  {
    capability_key: "admin.synthesis",
    routing_class: "balanced",
    budget_class: "standard",
    quality_requirement: "standard",
    max_latency_class: "fast",
    launch_honesty_class: "internal_only",
    is_active: true,
    structured_output_required: false,
    tool_use_required: false,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
  {
    capability_key: "admin.ai_workforce.run",
    routing_class: "balanced",
    budget_class: "standard",
    quality_requirement: "standard",
    max_latency_class: "standard",
    launch_honesty_class: "internal_only",
    is_active: true,
    structured_output_required: false,
    tool_use_required: true,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
  {
    capability_key: "utility.extract",
    routing_class: "utility",
    budget_class: "utility",
    quality_requirement: "standard",
    max_latency_class: "realtime",
    launch_honesty_class: "partial",
    is_active: true,
    structured_output_required: true,
    tool_use_required: false,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
  {
    capability_key: "daily_pulse.generate",
    routing_class: "balanced",
    budget_class: "standard",
    quality_requirement: "high",
    max_latency_class: "standard",
    launch_honesty_class: "partial",
    is_active: true,
    structured_output_required: false,
    tool_use_required: false,
    can_fallback_to_demo: true,
    can_fallback_to_unavailable: false,
  },
];

const LAUNCH_HONESTY_SEEDS = [
  { capability_key: "advisor.chat.primary", launch_honesty_class: "partial", public_claim_allowed: false, qualifier_required: true, notes: "Runtime exists, needs sustained verification" },
  { capability_key: "classification.extract", launch_honesty_class: "partial", public_claim_allowed: false, qualifier_required: true, notes: "Structured utility, needs schema validation proof" },
  { capability_key: "boardroom.weekly.summary", launch_honesty_class: "partial", public_claim_allowed: false, qualifier_required: true, notes: "Premium synthesis, needs end-to-end verification" },
  { capability_key: "admin.synthesis", launch_honesty_class: "internal_only", public_claim_allowed: false, qualifier_required: false, notes: "Admin-only synthesis capability" },
  { capability_key: "admin.ai_workforce.run", launch_honesty_class: "internal_only", public_claim_allowed: false, qualifier_required: false, notes: "Internal workforce runtime" },
  { capability_key: "utility.extract", launch_honesty_class: "partial", public_claim_allowed: false, qualifier_required: true, notes: "Utility extraction, needs verification" },
  { capability_key: "daily_pulse.generate", launch_honesty_class: "partial", public_claim_allowed: false, qualifier_required: true, notes: "Dashboard pulse, needs live proof" },
];

export interface SeedResult {
  phase: string;
  status: "success" | "skipped" | "error";
  message: string;
  rowsAffected?: number;
}

/**
 * Seeds all AI routing activation data.
 * Uses upsert to avoid duplicates.
 */
export async function seedAIRoutingActivation(userId: string): Promise<SeedResult[]> {
  const results: SeedResult[] = [];

  // Phase 1: Providers
  for (const provider of PROVIDER_SEEDS) {
    const { error } = await fromTable("ai_provider_registry").upsert(
      { ...provider, user_id: userId, is_active: true, metadata: {} },
      { onConflict: "provider_key" }
    );
    results.push({
      phase: "provider",
      status: error ? "error" : "success",
      message: error ? `${provider.provider_key}: ${error.message}` : `${provider.provider_key} seeded`,
    });
  }

  // Phase 2: Models
  for (const model of MODEL_SEEDS) {
    const { error } = await fromTable("ai_model_registry").upsert(
      { ...model, user_id: userId },
      { onConflict: "model_id" }
    );
    results.push({
      phase: "model",
      status: error ? "error" : "success",
      message: error ? `${model.model_id}: ${error.message}` : `${model.model_id} seeded`,
    });
  }

  // Phase 3: Capability routing
  for (const route of CAPABILITY_ROUTING_SEEDS) {
    const { error } = await fromTable("ai_capability_routing").upsert(
      { ...route, user_id: userId, metadata: {} },
      { onConflict: "capability_key" }
    );
    results.push({
      phase: "routing",
      status: error ? "error" : "success",
      message: error ? `${route.capability_key}: ${error.message}` : `${route.capability_key} routing seeded`,
    });
  }

  // Phase 4: Launch honesty defaults
  for (const honesty of LAUNCH_HONESTY_SEEDS) {
    const { error } = await fromTable("ai_launch_honesty").upsert(
      { ...honesty, user_id: userId },
      { onConflict: "capability_key" }
    );
    results.push({
      phase: "launch_honesty",
      status: error ? "error" : "success",
      message: error ? `${honesty.capability_key}: ${error.message}` : `${honesty.capability_key} honesty seeded`,
    });
  }

  return results;
}

export { PROVIDER_SEEDS, MODEL_SEEDS, CAPABILITY_ROUTING_SEEDS, LAUNCH_HONESTY_SEEDS };
