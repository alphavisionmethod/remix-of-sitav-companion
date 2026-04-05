// ═══════════════════════════════════════════════════════════════
// SITA OS — Model Routing Engine
// Routes every AI task across model tiers based on task class,
// risk, plan entitlement, cache availability, and budget state.
// ═══════════════════════════════════════════════════════════════

export type ComputeModelTier = "utility" | "standard" | "premium" | "exceptional";

export interface ModelDefinition {
  modelId: string;
  provider: string;
  tier: ComputeModelTier;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  cachedCostPer1kTokens: number;
  maxContext: number;
  latencyClass: "fast" | "standard" | "slow";
  capabilities: string[];
  active: boolean;
}

export interface RoutingContext {
  taskClass: CostClass;
  confidenceNeed: "low" | "standard" | "high" | "critical";
  riskLevel: "low" | "medium" | "high" | "critical";
  planTier: string;
  missionImportance: "routine" | "important" | "critical";
  urgency: "background" | "normal" | "urgent" | "immediate";
  currentBurnCents: number;
  budgetRemainingCents: number;
  cacheAvailable: boolean;
  cachedResultAge?: number;
  environment: "production" | "staging" | "sandbox";
  humanReviewRequired: boolean;
  tenantId: string;
  workspaceId: string;
  agentId?: string;
}

export type CostClass = "A" | "B" | "C" | "D";

export interface RoutingDecision {
  decisionId: string;
  selectedModel: string;
  selectedTier: ComputeModelTier;
  costClass: CostClass;
  estimatedCostCents: number;
  maxTokenBudget: number;
  useCachedResult: boolean;
  asyncAllowed: boolean;
  approvalNeeded: boolean;
  compressionLevel: "none" | "standard" | "aggressive";
  reason: string;
  alternatives: Array<{ model: string; tier: ComputeModelTier; costCents: number; reason: string }>;
  timestamp: string;
}

// ── Default Model Registry ──────────────────────────────────

export const DEFAULT_MODELS: ModelDefinition[] = [
  { modelId: "gemini-3-flash", provider: "google", tier: "utility", inputCostPer1kTokens: 0.01, outputCostPer1kTokens: 0.04, cachedCostPer1kTokens: 0.003, maxContext: 128000, latencyClass: "fast", capabilities: ["text", "classification", "triage", "summarization"], active: true },
  { modelId: "gemini-2.5-flash", provider: "google", tier: "standard", inputCostPer1kTokens: 0.05, outputCostPer1kTokens: 0.15, cachedCostPer1kTokens: 0.01, maxContext: 128000, latencyClass: "standard", capabilities: ["text", "reasoning", "analysis", "planning"], active: true },
  { modelId: "gemini-2.5-pro", provider: "google", tier: "premium", inputCostPer1kTokens: 0.15, outputCostPer1kTokens: 0.60, cachedCostPer1kTokens: 0.04, maxContext: 200000, latencyClass: "slow", capabilities: ["text", "reasoning", "deep-analysis", "strategy", "code"], active: true },
  { modelId: "gpt-5", provider: "openai", tier: "exceptional", inputCostPer1kTokens: 0.25, outputCostPer1kTokens: 1.00, cachedCostPer1kTokens: 0.06, maxContext: 256000, latencyClass: "slow", capabilities: ["text", "reasoning", "deep-analysis", "strategy", "debate", "synthesis"], active: true },
];

// ── Cost Class Definitions ──────────────────────────────────

export const COST_CLASS_SPECS: Record<CostClass, {
  name: string;
  description: string;
  allowedTiers: ComputeModelTier[];
  maxTokens: number;
  retryLimit: number;
  batchAllowed: boolean;
  asyncPreferred: boolean;
  approvalRequired: boolean;
  contextCompression: "none" | "standard" | "aggressive";
}> = {
  A: { name: "Continuous Intelligence", description: "Cheap always-on monitoring, classification, triage", allowedTiers: ["utility"], maxTokens: 2000, retryLimit: 1, batchAllowed: true, asyncPreferred: true, approvalRequired: false, contextCompression: "aggressive" },
  B: { name: "Operational Reasoning", description: "Mid-cost analysis, planning, advisory work", allowedTiers: ["utility", "standard"], maxTokens: 8000, retryLimit: 2, batchAllowed: true, asyncPreferred: false, approvalRequired: false, contextCompression: "standard" },
  C: { name: "Deep Reasoning", description: "Expensive multi-step reasoning, strategy, synthesis", allowedTiers: ["standard", "premium"], maxTokens: 32000, retryLimit: 1, batchAllowed: false, asyncPreferred: true, approvalRequired: true, contextCompression: "standard" },
  D: { name: "Premium / Enterprise Compute", description: "Maximum quality reasoning, boardroom debates, critical decisions", allowedTiers: ["premium", "exceptional"], maxTokens: 64000, retryLimit: 0, batchAllowed: false, asyncPreferred: true, approvalRequired: true, contextCompression: "none" },
};

// ── Routing Logic ───────────────────────────────────────────

export function routeTask(ctx: RoutingContext, models: ModelDefinition[] = DEFAULT_MODELS): RoutingDecision {
  const classSpec = COST_CLASS_SPECS[ctx.taskClass];

  // Use cache if available and fresh enough
  if (ctx.cacheAvailable && ctx.cachedResultAge !== undefined && ctx.cachedResultAge < 3600) {
    return {
      decisionId: crypto.randomUUID(),
      selectedModel: "cache",
      selectedTier: "utility",
      costClass: ctx.taskClass,
      estimatedCostCents: 0,
      maxTokenBudget: 0,
      useCachedResult: true,
      asyncAllowed: true,
      approvalNeeded: false,
      compressionLevel: "none",
      reason: "Fresh cached result available, zero cost",
      alternatives: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Budget-driven downgrade
  let effectiveTiers = [...classSpec.allowedTiers];
  if (ctx.budgetRemainingCents < 50) {
    effectiveTiers = ["utility"];
  } else if (ctx.budgetRemainingCents < 200) {
    effectiveTiers = effectiveTiers.filter(t => t !== "exceptional" && t !== "premium");
  }

  // Select best model from allowed tiers
  const candidates = models
    .filter(m => m.active && effectiveTiers.includes(m.tier))
    .sort((a, b) => a.inputCostPer1kTokens - b.inputCostPer1kTokens);

  // Pick cheapest for low confidence, most capable for high
  let selected: ModelDefinition;
  if (ctx.confidenceNeed === "critical" || ctx.riskLevel === "critical") {
    selected = candidates[candidates.length - 1] || candidates[0];
  } else if (ctx.confidenceNeed === "high" || ctx.missionImportance === "critical") {
    selected = candidates[Math.min(1, candidates.length - 1)] || candidates[0];
  } else {
    selected = candidates[0];
  }

  if (!selected) {
    selected = DEFAULT_MODELS[0]; // fallback to utility
  }

  const estimatedTokens = Math.min(classSpec.maxTokens, selected.maxContext);
  const estimatedCost = Math.ceil((estimatedTokens / 1000) * (selected.inputCostPer1kTokens + selected.outputCostPer1kTokens) * 0.5);

  return {
    decisionId: crypto.randomUUID(),
    selectedModel: selected.modelId,
    selectedTier: selected.tier,
    costClass: ctx.taskClass,
    estimatedCostCents: estimatedCost,
    maxTokenBudget: estimatedTokens,
    useCachedResult: false,
    asyncAllowed: classSpec.asyncPreferred || ctx.urgency === "background",
    approvalNeeded: classSpec.approvalRequired && ctx.riskLevel !== "low",
    compressionLevel: classSpec.contextCompression,
    reason: `Class ${ctx.taskClass} task, ${ctx.confidenceNeed} confidence, ${ctx.budgetRemainingCents}¢ remaining`,
    alternatives: candidates.filter(c => c.modelId !== selected.modelId).map(c => ({
      model: c.modelId, tier: c.tier,
      costCents: Math.ceil((estimatedTokens / 1000) * (c.inputCostPer1kTokens + c.outputCostPer1kTokens) * 0.5),
      reason: `${c.tier} fallback`,
    })),
    timestamp: new Date().toISOString(),
  };
}

export function classifyTask(
  taskType: string,
  riskLevel: "low" | "medium" | "high" | "critical",
  isProactive: boolean,
): CostClass {
  if (isProactive && riskLevel === "low") return "A";
  if (taskType === "monitoring" || taskType === "triage" || taskType === "classification") return "A";
  if (taskType === "analysis" || taskType === "planning" || taskType === "advisory") return "B";
  if (taskType === "strategy" || taskType === "synthesis" || taskType === "debate") return riskLevel === "critical" ? "D" : "C";
  if (taskType === "deep-analysis" || taskType === "boardroom") return "D";
  return "B";
}
