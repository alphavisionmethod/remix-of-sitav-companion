// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Economics, Token Governance, Model Routing
// ═══════════════════════════════════════════════════════════════

export type ModelTier = "no_llm" | "cheap" | "mid" | "premium" | "specialized";

export interface ModelRoute {
  id: string;
  name: string;
  tier: ModelTier;
  provider: string;
  model: string;
  costPer1kTokens: number;
  latencyMs: number;
  capabilities: string[];
  maxContextTokens: number;
  suitableFor: string[];
  active: boolean;
}

export interface ModelRoutingDecision {
  requestId: string;
  domain: string;
  workflowType: string;
  selectedModel: string;
  selectedTier: ModelTier;
  reason: string;
  estimatedCost: number;
  alternativesConsidered: { model: string; reason: string }[];
  timestamp: string;
}

export interface TokenBudget {
  id: string;
  scope: "user" | "household" | "org" | "plan_tier" | "workflow" | "boardroom" | "advisor" | "connector" | "daily" | "weekly" | "monthly";
  scopeId: string;
  limit: number;
  used: number;
  remaining: number;
  period: string;
  alertThreshold: number;
  hardLimit: boolean;
  overage: number;
  lastReset: string;
}

export interface TokenUsageRecord {
  id: string;
  requestId: string;
  model: string;
  tier: ModelTier;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  domain: string;
  workflowId?: string;
  advisorId?: string;
  userId: string;
  timestamp: string;
  cached: boolean;
  compressed: boolean;
}

export interface InferenceAnomaly {
  id: string;
  type: "cost_spike" | "token_explosion" | "repeated_failure" | "loop_detected" | "unexpected_model" | "budget_breach";
  severity: "info" | "warning" | "critical";
  description: string;
  affectedScope: string;
  detectedAt: string;
  estimatedWaste: number;
  suggestedAction: string;
  resolved: boolean;
}

export interface ContextCompression {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  method: "summary" | "key_extraction" | "sliding_window" | "reuse_packet";
  qualityScore: number;
}

export interface TokenSpendDashboard {
  totalSpend: number;
  period: string;
  byModel: { model: string; tokens: number; cost: number }[];
  byDomain: { domain: string; tokens: number; cost: number }[];
  byAdvisor: { advisorId: string; tokens: number; cost: number }[];
  byWorkflow: { workflowType: string; tokens: number; cost: number }[];
  anomalies: InferenceAnomaly[];
  forecastedSpend: number;
  marginImpact: { feature: string; revenue: number; cost: number; margin: number }[];
  efficiencyScore: number;
}

export interface TokenGovernanceConfig {
  defaultModelTier: ModelTier;
  cheapModeThreshold: number;
  structuredStateFirst: boolean;
  reuseBoardroomPackets: boolean;
  reuseSummaries: boolean;
  compressionEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  backgroundReasoningEnabled: boolean;
  eventDrivenReasoning: boolean;
  premiumEntitlements: string[];
}
