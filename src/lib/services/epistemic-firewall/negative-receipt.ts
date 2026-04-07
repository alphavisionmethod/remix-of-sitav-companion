// ═══════════════════════════════════════════════════════════════
// SITA OS — Negative Receipt Service
// First-class structured refusal records
// Turns refusal into visible safety, explicit trust, and wow factor
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "@/packages/contracts/_contract-scaffold";
import type { EvidenceGrade } from "./evidence-grader";

// ── Negative Receipt Types ─────────────────────────────────────

export type RefusalReason =
  | "evidence-insufficient"
  | "evidence-grade-too-low"
  | "budget-exceeded"
  | "policy-blocked"
  | "domain-requires-deterministic"
  | "cite-check-failed"
  | "approval-required"
  | "connector-unavailable"
  | "data-stale"
  | "assumption-too-risky"
  | "invariant-violated"
  | "hallucination-risk"
  | "high-stakes-refusal"
  | "unsupported-claim-detected";

export interface NegativeReceipt {
  receiptId: string;
  timestamp: string;
  taskType: string;
  domain: DomainId;
  riskTier: RiskTier;
  correlationId: string;
  userId?: string;

  // What was blocked
  blockedAction: string;
  blockedDescription: string;

  // Why it was blocked
  refusalReasons: RefusalReason[];
  policyTriggered: string[];
  evidenceGradeFound: EvidenceGrade | null;
  evidenceGradeRequired: EvidenceGrade | null;

  // Details
  details: string;
  missingRequirements: string[];

  // What the user/operator can do
  suggestedActions: SuggestedAction[];

  // Admin metadata
  gateSource: "conscience-gate" | "cite-checker" | "sentinel" | "budget-gate" | "approval-gate" | "cortex-loop";
  severity: "info" | "warning" | "critical";
}

export interface SuggestedAction {
  action: string;
  description: string;
  actionType: "retry" | "provide-data" | "request-approval" | "escalate" | "contact-support" | "wait";
}

// ── In-Memory Negative Receipt Ledger ──────────────────────────

const negativeReceiptLedger: NegativeReceipt[] = [];

// ── Create Negative Receipt ────────────────────────────────────

export function createNegativeReceipt(params: {
  taskType: string;
  domain: DomainId;
  riskTier: RiskTier;
  correlationId: string;
  userId?: string;
  blockedAction: string;
  blockedDescription: string;
  refusalReasons: RefusalReason[];
  policyTriggered: string[];
  evidenceGradeFound?: EvidenceGrade;
  evidenceGradeRequired?: EvidenceGrade;
  details: string;
  missingRequirements: string[];
  suggestedActions: SuggestedAction[];
  gateSource: NegativeReceipt["gateSource"];
  severity: NegativeReceipt["severity"];
}): NegativeReceipt {
  const receipt: NegativeReceipt = {
    receiptId: `neg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    taskType: params.taskType,
    domain: params.domain,
    riskTier: params.riskTier,
    correlationId: params.correlationId,
    userId: params.userId,
    blockedAction: params.blockedAction,
    blockedDescription: params.blockedDescription,
    refusalReasons: params.refusalReasons,
    policyTriggered: params.policyTriggered,
    evidenceGradeFound: params.evidenceGradeFound || null,
    evidenceGradeRequired: params.evidenceGradeRequired || null,
    details: params.details,
    missingRequirements: params.missingRequirements,
    suggestedActions: params.suggestedActions,
    gateSource: params.gateSource,
    severity: params.severity,
  };

  negativeReceiptLedger.push(receipt);
  return receipt;
}

// ── Convenience Builders ───────────────────────────────────────

export function refuseForWeakEvidence(params: {
  taskType: string;
  domain: DomainId;
  correlationId: string;
  gradeFound: EvidenceGrade;
  gradeRequired: EvidenceGrade;
  userId?: string;
}): NegativeReceipt {
  return createNegativeReceipt({
    taskType: params.taskType,
    domain: params.domain,
    riskTier: "high",
    correlationId: params.correlationId,
    userId: params.userId,
    blockedAction: `Generate ${params.taskType} response`,
    blockedDescription: `Evidence quality too low for ${params.domain} domain. Found grade ${params.gradeFound}, requires ${params.gradeRequired}.`,
    refusalReasons: ["evidence-grade-too-low"],
    policyTriggered: [`${params.domain}-evidence-policy`],
    evidenceGradeFound: params.gradeFound,
    evidenceGradeRequired: params.gradeRequired,
    details: `The ${params.domain} domain requires grade ${params.gradeRequired} or better evidence. Available evidence is grade ${params.gradeFound}. The system refuses rather than guessing to protect your trust.`,
    missingRequirements: [`Grade ${params.gradeRequired}+ evidence for ${params.domain}`],
    suggestedActions: [
      { action: "Provide fresher data", description: "Upload or sync more recent documents or connector data.", actionType: "provide-data" },
      { action: "Connect a verified source", description: "Link a connector that provides real-time data for this domain.", actionType: "provide-data" },
      { action: "Retry with lower trust requirement", description: "Ask again for a general (non-high-trust) response.", actionType: "retry" },
    ],
    gateSource: "conscience-gate",
    severity: "warning",
  });
}

export function refuseForCiteCheckFailure(params: {
  taskType: string;
  domain: DomainId;
  correlationId: string;
  unsupportedClaims: number;
  totalClaims: number;
  userId?: string;
}): NegativeReceipt {
  return createNegativeReceipt({
    taskType: params.taskType,
    domain: params.domain,
    riskTier: "high",
    correlationId: params.correlationId,
    userId: params.userId,
    blockedAction: `Release ${params.taskType} response`,
    blockedDescription: `${params.unsupportedClaims} of ${params.totalClaims} claims could not be verified against evidence.`,
    refusalReasons: ["cite-check-failed", "unsupported-claim-detected"],
    policyTriggered: [`${params.domain}-cite-check-policy`],
    details: `The adversarial cite-check found ${params.unsupportedClaims} unsupported claims in the generated response. The system blocks unverified outputs in the ${params.domain} domain.`,
    missingRequirements: [`${params.totalClaims - params.unsupportedClaims + 1}+ verified claims out of ${params.totalClaims}`],
    suggestedActions: [
      { action: "Provide more evidence", description: "Add documents or data sources that support the claims.", actionType: "provide-data" },
      { action: "Narrow the question", description: "Ask a more specific question that can be answered with available evidence.", actionType: "retry" },
    ],
    gateSource: "cite-checker",
    severity: "warning",
  });
}

export function refuseForBudgetExceeded(params: {
  taskType: string;
  domain: DomainId;
  correlationId: string;
  estimatedCost: number;
  remainingBudget: number;
  userId?: string;
}): NegativeReceipt {
  return createNegativeReceipt({
    taskType: params.taskType,
    domain: params.domain,
    riskTier: "medium",
    correlationId: params.correlationId,
    userId: params.userId,
    blockedAction: `Execute ${params.taskType}`,
    blockedDescription: `Estimated cost (${params.estimatedCost}¢) exceeds remaining budget (${params.remainingBudget}¢).`,
    refusalReasons: ["budget-exceeded"],
    policyTriggered: ["budget-enforcement"],
    details: `AI budget policy prevents this operation. Estimated cost: ${params.estimatedCost}¢. Remaining budget: ${params.remainingBudget}¢.`,
    missingRequirements: ["Sufficient AI budget"],
    suggestedActions: [
      { action: "Wait for budget reset", description: "Daily/weekly budgets reset automatically.", actionType: "wait" },
      { action: "Request budget increase", description: "Contact admin to increase AI budget.", actionType: "escalate" },
    ],
    gateSource: "budget-gate",
    severity: "info",
  });
}

export function refuseForMissingApproval(params: {
  taskType: string;
  domain: DomainId;
  correlationId: string;
  actionDescription: string;
  userId?: string;
}): NegativeReceipt {
  return createNegativeReceipt({
    taskType: params.taskType,
    domain: params.domain,
    riskTier: "critical",
    correlationId: params.correlationId,
    userId: params.userId,
    blockedAction: params.actionDescription,
    blockedDescription: `This action requires explicit approval before execution.`,
    refusalReasons: ["approval-required"],
    policyTriggered: ["approval-gate"],
    details: `High-risk actions in the ${params.domain} domain require operator approval. No approval token was provided.`,
    missingRequirements: ["Approval token from authorized operator"],
    suggestedActions: [
      { action: "Request approval", description: "Submit this action for operator review.", actionType: "request-approval" },
      { action: "Escalate", description: "Contact a team lead for urgent approval.", actionType: "escalate" },
    ],
    gateSource: "approval-gate",
    severity: "critical",
  });
}

// ── Query Operations ───────────────────────────────────────────

export function getNegativeReceipts(filters?: {
  domain?: DomainId;
  userId?: string;
  correlationId?: string;
  since?: string;
  severity?: NegativeReceipt["severity"];
}): NegativeReceipt[] {
  let results = [...negativeReceiptLedger];

  if (filters?.domain) results = results.filter((r) => r.domain === filters.domain);
  if (filters?.userId) results = results.filter((r) => r.userId === filters.userId);
  if (filters?.correlationId) results = results.filter((r) => r.correlationId === filters.correlationId);
  if (filters?.since) results = results.filter((r) => r.timestamp >= filters.since!);
  if (filters?.severity) results = results.filter((r) => r.severity === filters.severity);

  return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getNegativeReceiptStats(): {
  total: number;
  byReason: Record<string, number>;
  byDomain: Record<string, number>;
  bySeverity: Record<string, number>;
  byGateSource: Record<string, number>;
  last24h: number;
} {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400 * 1000).toISOString();

  const byReason: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byGateSource: Record<string, number> = {};

  for (const r of negativeReceiptLedger) {
    for (const reason of r.refusalReasons) {
      byReason[reason] = (byReason[reason] || 0) + 1;
    }
    byDomain[r.domain] = (byDomain[r.domain] || 0) + 1;
    bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
    byGateSource[r.gateSource] = (byGateSource[r.gateSource] || 0) + 1;
  }

  return {
    total: negativeReceiptLedger.length,
    byReason,
    byDomain,
    bySeverity,
    byGateSource,
    last24h: negativeReceiptLedger.filter((r) => r.timestamp >= dayAgo).length,
  };
}
