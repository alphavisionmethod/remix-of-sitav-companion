// ═══════════════════════════════════════════════════════════════
// SITA OS — Budget-Aware Model Router
// Maps intent complexity, domain risk, and budget to optimal
// model tier. Enforces cost discipline and quality guarantees.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type BrainModelTier = "nano" | "standard" | "premium" | "reasoning";

export type DomainRiskClass = "low" | "standard" | "elevated" | "critical";

export type IntentComplexity = "trivial" | "simple" | "moderate" | "complex" | "expert";

export interface BrainModelRoutingDecision {
  selectedTier: BrainModelTier;
  estimatedCostCents: number;
  estimatedLatencyMs: number;
  reasoning: string;
  downgraded: boolean;
  downgradeReason?: string;
}

export interface ModelBudgetStatus {
  totalBudgetCents: number;
  spentCents: number;
  remainingCents: number;
  spendRateCentsPerHour: number;
  projectedExhaustionAt: string | null;
  isConstrained: boolean;
}

// ── Budget Tracking ──────────────────────────────────────────

interface BudgetState {
  totalBudgetCents: number;
  spentCents: number;
  spendHistory: { timestamp: number; amountCents: number }[];
}

const budgetState: BudgetState = {
  totalBudgetCents: 10000, // $100 default daily budget
  spentCents: 0,
  spendHistory: [],
};

// ── Cost Model ───────────────────────────────────────────────

const TIER_COST_CENTS: Record<BrainModelTier, number> = {
  nano: 1,        // ~$0.01 per call
  standard: 5,    // ~$0.05 per call
  premium: 25,    // ~$0.25 per call
  reasoning: 100, // ~$1.00 per call
};

const TIER_LATENCY_MS: Record<BrainModelTier, number> = {
  nano: 200,
  standard: 800,
  premium: 2000,
  reasoning: 8000,
};

// ── Routing Logic ────────────────────────────────────────────

/**
 * Core routing rules:
 * 1. Critical-truth domains (finance arithmetic, policy decisions) → premium or reasoning
 * 2. Complex/expert intents → premium minimum
 * 3. Simple queries and low-risk domains → nano
 * 4. Simulations → standard minimum
 * 5. Budget exhaustion → force downgrade with caveat
 */
function computeIdealTier(
  complexity: IntentComplexity,
  riskClass: DomainRiskClass,
  isSimulation: boolean
): BrainModelTier {
  // Critical domains always get premium+
  if (riskClass === "critical") {
    return complexity === "expert" ? "reasoning" : "premium";
  }

  // Expert complexity always reasoning
  if (complexity === "expert") return "reasoning";

  // Complex or elevated risk → premium
  if (complexity === "complex" || riskClass === "elevated") return "premium";

  // Simulations need at least standard
  if (isSimulation) return "standard";

  // Moderate → standard
  if (complexity === "moderate" || riskClass === "standard") return "standard";

  // Trivial/simple + low risk → nano
  return "nano";
}

const TIER_RANK: Record<BrainModelTier, number> = {
  nano: 0,
  standard: 1,
  premium: 2,
  reasoning: 3,
};

function downgrade(tier: BrainModelTier): BrainModelTier {
  if (tier === "reasoning") return "premium";
  if (tier === "premium") return "standard";
  return "nano";
}

// ── Public API ───────────────────────────────────────────────

/**
 * Route an intent to the optimal model tier considering complexity,
 * risk, budget, and urgency.
 */
export function routeToModel(params: {
  complexity: IntentComplexity;
  riskClass: DomainRiskClass;
  isSimulation?: boolean;
  urgency?: "low" | "standard" | "high" | "critical";
}): BrainModelRoutingDecision {
  const isSimulation = params.isSimulation ?? false;
  const idealTier = computeIdealTier(params.complexity, params.riskClass, isSimulation);

  const remaining = budgetState.totalBudgetCents - budgetState.spentCents;
  const cost = TIER_COST_CENTS[idealTier];

  // Budget check: can we afford the ideal tier?
  let selectedTier = idealTier;
  let downgraded = false;
  let downgradeReason: string | undefined;

  if (cost > remaining) {
    // Force downgrade
    selectedTier = downgrade(idealTier);
    downgraded = true;
    downgradeReason = `Budget constrained: ${remaining}¢ remaining, ${cost}¢ needed for ${idealTier}`;

    // If still can't afford, keep downgrading
    while (TIER_COST_CENTS[selectedTier] > remaining && TIER_RANK[selectedTier] > 0) {
      selectedTier = downgrade(selectedTier);
    }
  }

  // Critical domains cannot be downgraded below standard
  if (params.riskClass === "critical" && TIER_RANK[selectedTier] < TIER_RANK["standard"]) {
    selectedTier = "standard";
    downgradeReason = (downgradeReason || "") + " | Critical domain floor: standard minimum enforced";
  }

  const finalCost = TIER_COST_CENTS[selectedTier];
  const reasoning = buildRoutingReasoning(params, idealTier, selectedTier, downgraded);

  return {
    selectedTier,
    estimatedCostCents: finalCost,
    estimatedLatencyMs: TIER_LATENCY_MS[selectedTier],
    reasoning,
    downgraded,
    downgradeReason,
  };
}

/**
 * Record actual spend after a model call completes.
 */
export function recordModelSpend(costCents: number): void {
  budgetState.spentCents += costCents;
  budgetState.spendHistory.push({ timestamp: Date.now(), amountCents: costCents });
}

/**
 * Get current budget status with spend rate and projections.
 */
export function getModelBudgetStatus(): ModelBudgetStatus {
  const remaining = budgetState.totalBudgetCents - budgetState.spentCents;

  // Compute spend rate from last hour
  const oneHourAgo = Date.now() - 3600_000;
  const recentSpend = budgetState.spendHistory
    .filter(s => s.timestamp > oneHourAgo)
    .reduce((sum, s) => sum + s.amountCents, 0);

  let projectedExhaustion: string | null = null;
  if (recentSpend > 0 && remaining > 0) {
    const hoursRemaining = remaining / recentSpend;
    projectedExhaustion = new Date(Date.now() + hoursRemaining * 3600_000).toISOString();
  }

  return {
    totalBudgetCents: budgetState.totalBudgetCents,
    spentCents: budgetState.spentCents,
    remainingCents: remaining,
    spendRateCentsPerHour: recentSpend,
    projectedExhaustionAt: projectedExhaustion,
    isConstrained: remaining < budgetState.totalBudgetCents * 0.1,
  };
}

/**
 * Set the daily budget (in cents).
 */
export function setModelBudget(totalCents: number): void {
  budgetState.totalBudgetCents = totalCents;
}

/**
 * Reset daily spend tracking (call at budget period rollover).
 */
export function resetDailySpend(): void {
  budgetState.spentCents = 0;
  budgetState.spendHistory = [];
}

// ── Helpers ──────────────────────────────────────────────────

function buildRoutingReasoning(
  params: { complexity: IntentComplexity; riskClass: DomainRiskClass; isSimulation?: boolean },
  ideal: BrainModelTier,
  actual: BrainModelTier,
  downgraded: boolean
): string {
  const parts: string[] = [];
  parts.push(`Complexity: ${params.complexity}, Risk: ${params.riskClass}`);
  if (params.isSimulation) parts.push("Simulation mode");
  parts.push(`Ideal tier: ${ideal}`);
  if (downgraded) {
    parts.push(`Downgraded to: ${actual} (budget constraint)`);
  } else {
    parts.push(`Selected: ${actual}`);
  }
  return parts.join(" → ");
}

