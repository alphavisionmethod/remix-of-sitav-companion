// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Domain Types
// Provider registry, model registry, routing, budget, receipts
// ═══════════════════════════════════════════════════════════════


// ── Row types from existing tables ─────────────────────────────
export type AIModelRegistry = any;
export type AIRoutingPolicy = any;
export type AIProviderHealth = any;
export type AIPortfolioAllocation = any;
export type AICostLedger = any;
export type AITokenUsage = any;
export type AIInferenceReceipt = any;
export type AITaskRequest = any;
export type AIPromptFamily = any;
export type AISelfHealingRule = any;
export type AIEfficiencyScore = any;
export type AIChangePlan = any;
export type AIFixProposal = any;

// ── Row types from NEW canonical tables ────────────────────────
export type AIProviderRegistry = any;
export type AICapabilityRouting = any;
export type AIBudgetPolicy = any;
export type AIUsageLedger = any;
export type AIFallbackEvent = any;
export type AILaunchHonesty = any;
export type AIReceiptRecord = any;
export type AIBudgetAlert = any;

// ── Enums ──────────────────────────────────────────────────────
export const QUALITY_TIERS = ["economy", "balanced", "premium", "reasoning", "fast"] as const;
export type QualityTier = typeof QUALITY_TIERS[number];

export const COST_TIERS = ["low", "medium", "high", "very_high"] as const;
export type CostTier = typeof COST_TIERS[number];

export const ROUTING_CLASSES = [
  "premium_synthesis", "balanced_assistant", "economy_utility", "fallback", "internal_only",
] as const;
export type RoutingClass = typeof ROUTING_CLASSES[number];

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

export const BUDGET_SCOPE_TYPES = ["global", "workspace", "user", "capability", "provider", "model"] as const;
export type BudgetScopeType = typeof BUDGET_SCOPE_TYPES[number];

export const HEALTH_STATES = ["healthy", "degraded", "unavailable", "missing_secret", "rate_limited", "internal_only"] as const;
export type HealthState = typeof HEALTH_STATES[number];

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
  policies: AIBudgetPolicy[];
  alerts: AIBudgetAlert[];
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

