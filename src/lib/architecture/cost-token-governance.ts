// ═══════════════════════════════════════════════════════════════
// SITA OS — Cost & Token Governance
// No unconstrained token burn. Budget-aware everything.
// ═══════════════════════════════════════════════════════════════

export type BudgetScope = "user" | "tenant" | "workflow" | "connector" | "advisor";
export type ModelTier = "economy" | "standard" | "premium" | "specialist";

export interface BudgetPolicy {
  policyId: string;
  scope: BudgetScope;
  scopeId: string;           // user/tenant/workflow ID
  period: "hourly" | "daily" | "weekly" | "monthly";
  tokenCeiling: number;
  costCeilingCents: number;
  hardLimit: boolean;         // true = hard stop, false = warn + degrade
  autoDowngradeModel: boolean;
  fallbackModelTier: ModelTier;
  alertThresholdPct: number;  // 0-100, alert at this % usage
}

export interface BudgetUsage {
  usageId: string;
  scope: BudgetScope;
  scopeId: string;
  period: string;             // e.g., "2026-04"
  tokensUsed: number;
  costCents: number;
  requestCount: number;
  modelBreakdown: Record<ModelTier, { tokens: number; costCents: number }>;
  anomalyDetected: boolean;
  anomalyReason?: string;
  lastUpdated: string;
}

export interface ModelRoutingDecision {
  decisionId: string;
  requestType: string;        // e.g., "triage", "planning", "analysis", "conflict-resolution"
  selectedModel: string;
  selectedTier: ModelTier;
  reason: string;
  budgetRemaining: number;
  costEstimateCents: number;
  alternatives: Array<{ model: string; tier: ModelTier; costCents: number }>;
}

export interface ConnectorCostRecord {
  recordId: string;
  connectorId: string;
  actionType: string;
  costCents: number;
  tenantId: string;
  workflowId?: string;
  timestamp: string;
}

// ── Model Routing ───────────────────────────────────────────

export function routeModel(
  requestType: string,
  riskTier: "standard" | "elevated" | "critical",
  budgetRemaining: number,
): ModelRoutingDecision {
  // Economy for triage, standard for most work, premium only for high-stakes
  let tier: ModelTier;
  if (budgetRemaining < 100) {
    tier = "economy";
  } else if (riskTier === "critical" || requestType === "conflict-resolution") {
    tier = "premium";
  } else if (riskTier === "elevated" || requestType === "planning") {
    tier = "standard";
  } else {
    tier = "economy";
  }

  return {
    decisionId: crypto.randomUUID(),
    requestType,
    selectedModel: getModelForTier(tier),
    selectedTier: tier,
    reason: `${riskTier} risk, ${requestType} type, ${budgetRemaining}¢ remaining`,
    budgetRemaining,
    costEstimateCents: getEstimatedCost(tier),
    alternatives: [
      { model: getModelForTier("economy"), tier: "economy", costCents: getEstimatedCost("economy") },
      { model: getModelForTier("standard"), tier: "standard", costCents: getEstimatedCost("standard") },
      { model: getModelForTier("premium"), tier: "premium", costCents: getEstimatedCost("premium") },
    ],
  };
}

export function checkBudget(
  usage: BudgetUsage,
  policy: BudgetPolicy,
  estimatedCostCents: number,
): { allowed: boolean; reason: string; shouldDowngrade: boolean } {
  const projectedCost = usage.costCents + estimatedCostCents;
  const pctUsed = (projectedCost / policy.costCeilingCents) * 100;

  if (projectedCost > policy.costCeilingCents) {
    if (policy.hardLimit) {
      return { allowed: false, reason: "Hard budget limit exceeded", shouldDowngrade: false };
    }
    return { allowed: true, reason: "Soft limit exceeded — degrading", shouldDowngrade: policy.autoDowngradeModel };
  }

  if (pctUsed >= policy.alertThresholdPct) {
    return { allowed: true, reason: `Budget at ${pctUsed.toFixed(0)}% — approaching limit`, shouldDowngrade: false };
  }

  return { allowed: true, reason: "Within budget", shouldDowngrade: false };
}

function getModelForTier(tier: ModelTier): string {
  const map: Record<ModelTier, string> = {
    economy: "fast-model",
    standard: "balanced-model",
    premium: "high-capability-model",
    specialist: "domain-specialist-model",
  };
  return map[tier];
}

function getEstimatedCost(tier: ModelTier): number {
  const map: Record<ModelTier, number> = { economy: 1, standard: 5, premium: 25, specialist: 15 };
  return map[tier];
}
