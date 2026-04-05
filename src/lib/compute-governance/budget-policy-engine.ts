// ═══════════════════════════════════════════════════════════════
// SITA OS — Budget Policy Engine
// Track and enforce tenant/workspace/agent/mission budget
// envelopes with deep reasoning caps, retry limits, and
// proactive inference budgets.
// ═══════════════════════════════════════════════════════════════

import type { CostClass } from "./model-routing-engine";

// ── Budget Envelope Types ───────────────────────────────────

export type BudgetScope = "tenant" | "workspace" | "agent" | "mission" | "workflow" | "domain" | "environment" | "release-cycle" | "async-premium-queue";

export interface BudgetEnvelope {
  envelopeId: string;
  scope: BudgetScope;
  scopeId: string;                // tenant_id, workspace_id, agent_id, etc.
  tenantId: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  allocatedCents: number;
  spentCents: number;
  reservedCents: number;          // committed but not yet spent
  remainingCents: number;         // allocated - spent - reserved
  softLimitCents: number;         // warning threshold
  hardLimitCents: number;         // block threshold
  deepReasoningMinutesAllocated: number;
  deepReasoningMinutesUsed: number;
  premiumEscalationAllowanceCents: number;
  premiumEscalationUsedCents: number;
  proactiveInferenceBudgetCents: number;
  proactiveInferenceSpentCents: number;
  retryBudgetCents: number;
  retrySpentCents: number;
  maxRetries: number;
  retriesUsed: number;
  status: BudgetStatus;
  lastUpdated: string;
}

export type BudgetStatus =
  | "healthy"      // < 70% of soft limit
  | "approaching"  // 70-90% of soft limit
  | "warning"      // > soft limit but < hard limit
  | "exceeded"     // > hard limit
  | "frozen";      // manually frozen by operator

export interface BudgetCheckResult {
  allowed: boolean;
  reason: string;
  budgetStatus: BudgetStatus;
  remainingCents: number;
  suggestedAction?: string;
  requiresApproval: boolean;
  downgradeRecommended: boolean;
}

export interface BudgetSpendEvent {
  eventId: string;
  envelopeId: string;
  tenantId: string;
  scope: BudgetScope;
  scopeId: string;
  amountCents: number;
  costClass: CostClass;
  modelUsed: string;
  tokensUsed: number;
  purpose: string;
  agentId?: string;
  missionId?: string;
  workflowId?: string;
  isDeepReasoning: boolean;
  isProactive: boolean;
  isRetry: boolean;
  timestamp: string;
}

// ── Spend Forecasting ───────────────────────────────────────

export interface SpendForecast {
  tenantId: string;
  currentSpendCents: number;
  projectedEndOfPeriodCents: number;
  budgetCents: number;
  projectedOverageCents: number;
  daysRemaining: number;
  dailyBurnRate: number;
  trendDirection: "increasing" | "stable" | "decreasing";
  confidencePct: number;
  recommendations: string[];
}

// ── Budget Policy Logic ─────────────────────────────────────

export function checkBudget(
  envelope: BudgetEnvelope,
  requestedCostCents: number,
  isDeepReasoning: boolean,
  isRetry: boolean,
): BudgetCheckResult {
  // Frozen check
  if (envelope.status === "frozen") {
    return {
      allowed: false, reason: "Budget frozen by operator",
      budgetStatus: "frozen", remainingCents: envelope.remainingCents,
      suggestedAction: "Contact operator to unfreeze", requiresApproval: false, downgradeRecommended: false,
    };
  }

  // Hard limit exceeded
  if (envelope.spentCents + requestedCostCents > envelope.hardLimitCents) {
    return {
      allowed: false, reason: `Would exceed hard limit (${formatCents(envelope.hardLimitCents)})`,
      budgetStatus: "exceeded", remainingCents: envelope.remainingCents,
      suggestedAction: "Downgrade model tier or wait for next period",
      requiresApproval: false, downgradeRecommended: true,
    };
  }

  // Deep reasoning cap check
  if (isDeepReasoning && envelope.deepReasoningMinutesAllocated !== -1) {
    if (envelope.deepReasoningMinutesUsed >= envelope.deepReasoningMinutesAllocated) {
      return {
        allowed: false, reason: "Deep reasoning minutes exhausted",
        budgetStatus: envelope.status, remainingCents: envelope.remainingCents,
        suggestedAction: "Use standard reasoning or upgrade plan",
        requiresApproval: false, downgradeRecommended: true,
      };
    }
  }

  // Retry budget check
  if (isRetry) {
    if (envelope.retriesUsed >= envelope.maxRetries) {
      return {
        allowed: false, reason: `Retry limit reached (${envelope.maxRetries})`,
        budgetStatus: envelope.status, remainingCents: envelope.remainingCents,
        suggestedAction: "Escalate to human review",
        requiresApproval: false, downgradeRecommended: false,
      };
    }
    if (envelope.retrySpentCents + requestedCostCents > envelope.retryBudgetCents) {
      return {
        allowed: false, reason: "Retry budget exhausted",
        budgetStatus: envelope.status, remainingCents: envelope.remainingCents,
        suggestedAction: "Stop retrying, escalate",
        requiresApproval: false, downgradeRecommended: false,
      };
    }
  }

  // Soft limit warning
  if (envelope.spentCents + requestedCostCents > envelope.softLimitCents) {
    return {
      allowed: true, reason: `Soft limit will be exceeded — approval recommended`,
      budgetStatus: "warning", remainingCents: envelope.remainingCents - requestedCostCents,
      suggestedAction: "Consider downgrading to cheaper model tier",
      requiresApproval: true, downgradeRecommended: true,
    };
  }

  // Approaching soft limit
  const usageRatio = (envelope.spentCents + requestedCostCents) / envelope.softLimitCents;
  if (usageRatio > 0.9) {
    return {
      allowed: true, reason: `Approaching budget limit (${(usageRatio * 100).toFixed(0)}%)`,
      budgetStatus: "approaching", remainingCents: envelope.remainingCents - requestedCostCents,
      requiresApproval: false, downgradeRecommended: false,
    };
  }

  return {
    allowed: true, reason: "Within budget",
    budgetStatus: "healthy", remainingCents: envelope.remainingCents - requestedCostCents,
    requiresApproval: false, downgradeRecommended: false,
  };
}

// ── Spend Forecasting ───────────────────────────────────────

export function forecastSpend(
  envelope: BudgetEnvelope,
  daysElapsed: number,
  totalDays: number,
): SpendForecast {
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const dailyBurn = daysElapsed > 0 ? envelope.spentCents / daysElapsed : 0;
  const projected = envelope.spentCents + (dailyBurn * daysRemaining);
  const overage = Math.max(0, projected - envelope.allocatedCents);

  const recommendations: string[] = [];
  if (projected > envelope.hardLimitCents) {
    recommendations.push("Projected to exceed hard limit — consider model downgrades");
  }
  if (projected > envelope.softLimitCents) {
    recommendations.push("Projected to exceed soft limit — review high-cost agents");
  }
  if (dailyBurn > envelope.allocatedCents / totalDays * 1.5) {
    recommendations.push("Daily burn rate 50%+ above plan average");
  }

  return {
    tenantId: envelope.tenantId,
    currentSpendCents: envelope.spentCents,
    projectedEndOfPeriodCents: Math.round(projected),
    budgetCents: envelope.allocatedCents,
    projectedOverageCents: Math.round(overage),
    daysRemaining,
    dailyBurnRate: Math.round(dailyBurn),
    trendDirection: dailyBurn > envelope.allocatedCents / totalDays ? "increasing" : "stable",
    confidencePct: Math.min(95, daysElapsed * 3),
    recommendations,
  };
}

// ── Helpers ─────────────────────────────────────────────────

export function createEnvelope(
  scope: BudgetScope,
  scopeId: string,
  tenantId: string,
  label: string,
  allocatedCents: number,
  deepReasoningMinutes: number = 0,
): BudgetEnvelope {
  return {
    envelopeId: crypto.randomUUID(),
    scope, scopeId, tenantId, label,
    periodStart: new Date().toISOString(),
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    allocatedCents, spentCents: 0, reservedCents: 0,
    remainingCents: allocatedCents,
    softLimitCents: Math.round(allocatedCents * 0.8),
    hardLimitCents: allocatedCents,
    deepReasoningMinutesAllocated: deepReasoningMinutes,
    deepReasoningMinutesUsed: 0,
    premiumEscalationAllowanceCents: Math.round(allocatedCents * 0.15),
    premiumEscalationUsedCents: 0,
    proactiveInferenceBudgetCents: Math.round(allocatedCents * 0.3),
    proactiveInferenceSpentCents: 0,
    retryBudgetCents: Math.round(allocatedCents * 0.1),
    retrySpentCents: 0,
    maxRetries: 10,
    retriesUsed: 0,
    status: "healthy",
    lastUpdated: new Date().toISOString(),
  };
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
