// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Domain Types
// Provider registry, model registry, routing, budget, receipts
// ═══════════════════════════════════════════════════════════════

import type { Database } from "@/integrations/supabase/types";

// ── Row types ──────────────────────────────────────────────────
export type AIModelRegistry = Database["public"]["Tables"]["ai_model_registry"]["Row"];
export type AIRoutingPolicy = Database["public"]["Tables"]["ai_routing_policies"]["Row"];
export type AIProviderHealth = Database["public"]["Tables"]["ai_provider_health"]["Row"];
export type AIPortfolioAllocation = Database["public"]["Tables"]["ai_portfolio_allocations"]["Row"];
export type AICostLedger = Database["public"]["Tables"]["ai_cost_ledger"]["Row"];
export type AITokenUsage = Database["public"]["Tables"]["ai_token_usage"]["Row"];
export type AIInferenceReceipt = Database["public"]["Tables"]["ai_inference_receipts"]["Row"];
export type AITaskRequest = Database["public"]["Tables"]["ai_task_requests"]["Row"];
export type AIPromptFamily = Database["public"]["Tables"]["ai_prompt_families"]["Row"];
export type AISelfHealingRule = Database["public"]["Tables"]["ai_self_healing_rules"]["Row"];
export type AIEfficiencyScore = Database["public"]["Tables"]["ai_efficiency_scores"]["Row"];
export type AIChangePlan = Database["public"]["Tables"]["ai_change_plans"]["Row"];
export type AIFixProposal = Database["public"]["Tables"]["ai_fix_proposals"]["Row"];

// ── Enums ──────────────────────────────────────────────────────
export const QUALITY_TIERS = ["economy", "balanced", "premium", "reasoning", "fast"] as const;
export type QualityTier = typeof QUALITY_TIERS[number];

export const COST_TIERS = ["low", "medium", "high", "very_high"] as const;
export type CostTier = typeof COST_TIERS[number];

export const TASK_CLASSES = [
  "premium_synthesis", "balanced_assistant", "cheap_utility", "fallback_degraded",
] as const;
export type TaskClass = typeof TASK_CLASSES[number];

export const LAUNCH_HONESTY_LEVELS = [
  "real", "partial", "demo_governed", "internal_only", "unavailable", "planned",
] as const;
export type LaunchHonestyLevel = typeof LAUNCH_HONESTY_LEVELS[number];

export const AI_PROVIDERS = ["openai", "anthropic", "google", "lovable_proxy"] as const;
export type AIProvider = typeof AI_PROVIDERS[number];

// ── Gateway request/response ───────────────────────────────────
export interface AIGatewayRequest {
  capabilityId: string;
  taskClass: TaskClass;
  messages: { role: string; content: string }[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGatewayResponse {
  content: string;
  provider: string;
  model: string;
  taskClass: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  latencyMs: number;
  cached: boolean;
  fallbackUsed: boolean;
  receiptId: string;
}

// ── Budget summary ─────────────────────────────────────────────
export interface AIBudgetSummary {
  totalBudgetCents: number;
  totalSpentCents: number;
  utilizationPercent: number;
  byProvider: Record<string, number>;
  byTaskClass: Record<string, number>;
  alertCount: number;
}

// ── Provider status ────────────────────────────────────────────
export interface AIProviderStatus {
  provider: string;
  model: string | null;
  availability: number;
  errorRate: number;
  avgLatencyMs: number;
  healthy: boolean;
  incidentStatus: string | null;
}
