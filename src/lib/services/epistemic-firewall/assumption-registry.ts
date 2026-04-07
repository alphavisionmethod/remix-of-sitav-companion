// ═══════════════════════════════════════════════════════════════
// SITA OS — Assumption Registry
// Truth Triangle Gate 3: Explicit assumption tracking
// Makes extrapolations visible, persistent, and invalidatable
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Assumption Types ───────────────────────────────────────────

export type AssumptionCategory =
  | "income-stability"
  | "expense-stability"
  | "market-conditions"
  | "regulatory"
  | "connector-freshness"
  | "user-provided"
  | "temporal"
  | "behavioral"
  | "calculation-basis"
  | "data-completeness";

export type AssumptionStatus = "active" | "invalidated" | "expired" | "confirmed";

export interface Assumption {
  id: string;
  category: AssumptionCategory;
  statement: string;
  basis: string; // What evidence/context led to this assumption
  domain: DomainId;
  impact: "low" | "medium" | "high" | "critical";
  createdAt: string;
  expiresAt?: string;
  status: AssumptionStatus;
  invalidatedAt?: string;
  invalidationReason?: string;
  taskType?: string;
  correlationId?: string;
  userId?: string;
  confidence: number; // 0–1
}

export interface AssumptionSet {
  assumptions: Assumption[];
  totalCount: number;
  highImpactCount: number;
  domain: DomainId;
  taskType: string;
  createdAt: string;
  correlationId: string;
}

// ── In-Memory Registry (application-level, no external deps) ──

const assumptionStore: Assumption[] = [];

// ── Registry Operations ────────────────────────────────────────

export function createAssumption(params: {
  category: AssumptionCategory;
  statement: string;
  basis: string;
  domain: DomainId;
  impact: Assumption["impact"];
  confidence: number;
  taskType?: string;
  correlationId?: string;
  userId?: string;
  ttlSeconds?: number;
}): Assumption {
  const now = new Date();
  const assumption: Assumption = {
    id: `asm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: params.category,
    statement: params.statement,
    basis: params.basis,
    domain: params.domain,
    impact: params.impact,
    createdAt: now.toISOString(),
    expiresAt: params.ttlSeconds
      ? new Date(now.getTime() + params.ttlSeconds * 1000).toISOString()
      : undefined,
    status: "active",
    confidence: Math.max(0, Math.min(1, params.confidence)),
    taskType: params.taskType,
    correlationId: params.correlationId,
    userId: params.userId,
  };

  assumptionStore.push(assumption);
  return assumption;
}

export function invalidateAssumption(
  assumptionId: string,
  reason: string
): Assumption | null {
  const assumption = assumptionStore.find((a) => a.id === assumptionId);
  if (!assumption) return null;

  assumption.status = "invalidated";
  assumption.invalidatedAt = new Date().toISOString();
  assumption.invalidationReason = reason;

  return assumption;
}

export function confirmAssumption(assumptionId: string): Assumption | null {
  const assumption = assumptionStore.find((a) => a.id === assumptionId);
  if (!assumption) return null;
  assumption.status = "confirmed";
  return assumption;
}

export function getAssumptionsForCorrelation(correlationId: string): Assumption[] {
  return assumptionStore.filter((a) => a.correlationId === correlationId);
}

export function getAssumptionsForUser(userId: string): Assumption[] {
  return assumptionStore.filter((a) => a.userId === userId);
}

export function getActiveAssumptions(domain?: DomainId): Assumption[] {
  const now = new Date();
  return assumptionStore.filter((a) => {
    if (a.status !== "active") return false;
    if (a.expiresAt && new Date(a.expiresAt) < now) {
      a.status = "expired";
      return false;
    }
    if (domain && a.domain !== domain) return false;
    return true;
  });
}

export function getHighImpactAssumptions(): Assumption[] {
  return getActiveAssumptions().filter(
    (a) => a.impact === "high" || a.impact === "critical"
  );
}

export function buildAssumptionSet(
  correlationId: string,
  domain: DomainId,
  taskType: string
): AssumptionSet {
  const assumptions = getAssumptionsForCorrelation(correlationId);
  return {
    assumptions,
    totalCount: assumptions.length,
    highImpactCount: assumptions.filter(
      (a) => a.impact === "high" || a.impact === "critical"
    ).length,
    domain,
    taskType,
    createdAt: new Date().toISOString(),
    correlationId,
  };
}

// ── Common Assumption Templates ────────────────────────────────

export function assumeIncomeStable(params: {
  domain: DomainId;
  correlationId: string;
  userId?: string;
}): Assumption {
  return createAssumption({
    category: "income-stability",
    statement: "Income remains stable at current levels for the projection period.",
    basis: "No contradicting data provided. Using last known income.",
    domain: params.domain,
    impact: "high",
    confidence: 0.6,
    correlationId: params.correlationId,
    userId: params.userId,
    ttlSeconds: 86400,
  });
}

export function assumeExpenseStable(params: {
  domain: DomainId;
  correlationId: string;
  userId?: string;
}): Assumption {
  return createAssumption({
    category: "expense-stability",
    statement: "Recurring expenses remain constant for the projection period.",
    basis: "No new obligations or changes reported by user.",
    domain: params.domain,
    impact: "medium",
    confidence: 0.5,
    correlationId: params.correlationId,
    userId: params.userId,
    ttlSeconds: 86400,
  });
}

export function assumeConnectorFresh(params: {
  connectorId: string;
  domain: DomainId;
  correlationId: string;
}): Assumption {
  return createAssumption({
    category: "connector-freshness",
    statement: `Data from connector '${params.connectorId}' reflects current truth.`,
    basis: "Connector last synced within acceptable window.",
    domain: params.domain,
    impact: "medium",
    confidence: 0.7,
    correlationId: params.correlationId,
    ttlSeconds: 3600,
  });
}

export function assumeNoNewObligations(params: {
  domain: DomainId;
  correlationId: string;
  userId?: string;
}): Assumption {
  return createAssumption({
    category: "data-completeness",
    statement: "No new financial obligations have been introduced since last update.",
    basis: "Based on absence of contrary user input.",
    domain: params.domain,
    impact: "high",
    confidence: 0.4,
    correlationId: params.correlationId,
    userId: params.userId,
    ttlSeconds: 86400,
  });
}

// ── Stats ──────────────────────────────────────────────────────

export function getAssumptionStats(): {
  total: number;
  active: number;
  invalidated: number;
  expired: number;
  confirmed: number;
  highImpact: number;
  byCategory: Record<string, number>;
} {
  const active = getActiveAssumptions();
  const byCategory: Record<string, number> = {};
  for (const a of assumptionStore) {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  }

  return {
    total: assumptionStore.length,
    active: active.length,
    invalidated: assumptionStore.filter((a) => a.status === "invalidated").length,
    expired: assumptionStore.filter((a) => a.status === "expired").length,
    confirmed: assumptionStore.filter((a) => a.status === "confirmed").length,
    highImpact: getHighImpactAssumptions().length,
    byCategory,
  };
}
