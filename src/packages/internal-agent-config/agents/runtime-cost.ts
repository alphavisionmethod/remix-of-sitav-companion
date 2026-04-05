export { RUNTIME_COST_AGENTS } from "@/lib/internal-agents/agents/runtime-cost";

/**
 * Runtime Cost Council — Contract-Level Extension
 */
export interface CostAttribution {
  id: string;
  domain: string;
  advisorId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  purpose: string;
  cached: boolean;
  cacheSavingsCents: number;
  timestamp: string;
}

export interface CostBudget {
  domain: string;
  period: "daily" | "weekly" | "monthly";
  budgetCents: number;
  spentCents: number;
  projectedCents: number;
  utilizationPercent: number;
  alertThreshold: number;
  hardLimitEnforced: boolean;
  lastUpdated: string;
}

export interface ModelSelectionStrategy {
  taskType: string;
  preferredModel: string;
  fallbackModel: string;
  maxCostPerCallCents: number;
  minConfidenceThreshold: number;
  cacheStrategy: "aggressive" | "standard" | "none";
  batchingEnabled: boolean;
  rationale: string;
}

export interface CostOptimizationRecommendation {
  id: string;
  domain: string;
  type: "model-downgrade" | "cache-improvement" | "batch-opportunity" | "redundant-call" | "budget-realloc";
  description: string;
  estimatedSavingsCents: number;
  effort: "low" | "medium" | "high";
  autoApplicable: boolean;
  generatedAt: string;
}

export interface CostAnomalyAlert {
  id: string;
  domain: string;
  type: "spike" | "sustained-overrun" | "unusual-model-usage" | "token-waste";
  severity: "info" | "warning" | "critical";
  currentCostCents: number;
  expectedCostCents: number;
  deviationPercent: number;
  detectedAt: string;
  suggestedAction: string;
}
