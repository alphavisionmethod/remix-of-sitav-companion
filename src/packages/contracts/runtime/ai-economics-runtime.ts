// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: AI Economics Runtime
// ═══════════════════════════════════════════════════════════════

export interface AIModelCost {
  modelId: string;
  provider: string;
  inputTokenCostPer1k: number;
  outputTokenCostPer1k: number;
  cachedTokenCostPer1k?: number;
}

export interface AISpendState {
  periodStart: string;
  periodEnd: string;
  totalSpentCents: number;
  budgetCents: number;
  utilizationPercent: number;
  byModel: Array<{ modelId: string; spentCents: number; tokenCount: number }>;
  byDomain: Array<{ domain: string; spentCents: number }>;
  byCapability: Array<{ capabilityId: string; spentCents: number; invocationCount: number }>;
  projectedMonthEndCents: number;
  alerts: string[];
}

export interface AIEconomicsRuntime {
  currentSpend: AISpendState;
  modelCosts: AIModelCost[];
  costPerAction: Record<string, number>;
  marginAnalysis: {
    revenuePerActionCents: Record<string, number>;
    costPerActionCents: Record<string, number>;
    marginPercent: Record<string, number>;
  };
}
