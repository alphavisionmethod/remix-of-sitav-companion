// ═══════════════════════════════════════════════════════════════
// SITA OS — Risk-Tiered Approval System
// Rule 29: Approval is risk-tiered, not binary.
// Policy-derived and evidence-based.
// ═══════════════════════════════════════════════════════════════

export type ApprovalClass =
  | "informational"
  | "low-risk"
  | "medium-risk"
  | "high-risk"
  | "irreversible"
  | "regulated"
  | "financial-thresholded"
  | "delegated"
  | "multi-party-required";

export interface ApprovalContext {
  userId: string;
  tenantId: string;
  capabilityId: string;
  riskClass: ApprovalClass;
  identityAssurance: "basic" | "elevated" | "strong";
  deviceTrust: "untrusted" | "recognized" | "trusted" | "hardware-attested";
  amountCents?: number;
  entityContext?: string;
  policySensitivity: "low" | "medium" | "high" | "critical";
  timeSensitivity: "none" | "low" | "medium" | "urgent";
  priorPatternMatch: boolean;
  anomalyScore: number;          // 0-1
  delegatedAuthority?: {
    delegatorId: string;
    scope: string[];
    expiresAt: string;
    maxAmountCents?: number;
  };
}

export interface ApprovalDecision {
  decisionId: string;
  approvalClass: ApprovalClass;
  requiredApprovers: number;
  approverRoles: string[];
  autoApproved: boolean;
  reason: string;
  policyRuleIds: string[];
  expiresAt: string;
  escalationTimeMs: number;
}

// ── Financial Thresholds ────────────────────────────────────

export interface FinancialApprovalThresholds {
  autoApproveMaxCents: number;
  singleApprovalMaxCents: number;
  dualApprovalMaxCents: number;
  ownerRequiredAboveCents: number;
}

const DEFAULT_THRESHOLDS: FinancialApprovalThresholds = {
  autoApproveMaxCents: 5000,        // $50
  singleApprovalMaxCents: 50000,    // $500
  dualApprovalMaxCents: 500000,     // $5,000
  ownerRequiredAboveCents: 500000,  // $5,000+
};

// ── Approval Resolution ─────────────────────────────────────

export function resolveApproval(
  context: ApprovalContext,
  thresholds: FinancialApprovalThresholds = DEFAULT_THRESHOLDS,
): ApprovalDecision {
  const decisionId = crypto.randomUUID();

  // Informational — no approval needed
  if (context.riskClass === "informational") {
    return createDecision(decisionId, "informational", 0, [], true, "Informational action — no approval required");
  }

  // Regulated — always multi-party
  if (context.riskClass === "regulated") {
    return createDecision(decisionId, "regulated", 3, ["compliance-officer", "owner", "legal"], false, "Regulated action — multi-party approval required");
  }

  // Irreversible — owner must approve
  if (context.riskClass === "irreversible") {
    return createDecision(decisionId, "irreversible", 1, ["owner"], false, "Irreversible action — owner approval required");
  }

  // Financial threshold escalation
  if (context.amountCents) {
    if (context.amountCents > thresholds.ownerRequiredAboveCents) {
      return createDecision(decisionId, "financial-thresholded", 2, ["owner", "finance-admin"], false, `Amount $${(context.amountCents / 100).toFixed(2)} exceeds owner threshold`);
    }
    if (context.amountCents > thresholds.dualApprovalMaxCents) {
      return createDecision(decisionId, "financial-thresholded", 2, ["finance-admin", "manager"], false, `Amount $${(context.amountCents / 100).toFixed(2)} requires dual approval`);
    }
    if (context.amountCents > thresholds.singleApprovalMaxCents) {
      return createDecision(decisionId, "financial-thresholded", 1, ["finance-admin"], false, `Amount $${(context.amountCents / 100).toFixed(2)} requires single approval`);
    }
    if (context.amountCents <= thresholds.autoApproveMaxCents && context.priorPatternMatch) {
      return createDecision(decisionId, "low-risk", 0, [], true, "Within auto-approve threshold with matching pattern");
    }
  }

  // Anomaly escalation
  if (context.anomalyScore > 0.7) {
    return createDecision(decisionId, "high-risk", 2, ["security-admin", "owner"], false, `High anomaly score: ${context.anomalyScore}`);
  }

  // Delegated authority check
  if (context.riskClass === "delegated" && context.delegatedAuthority) {
    const da = context.delegatedAuthority;
    if (new Date(da.expiresAt) < new Date()) {
      return createDecision(decisionId, "high-risk", 1, ["owner"], false, "Delegated authority expired");
    }
    if (da.maxAmountCents && context.amountCents && context.amountCents > da.maxAmountCents) {
      return createDecision(decisionId, "high-risk", 1, ["owner"], false, "Exceeds delegated authority limit");
    }
    return createDecision(decisionId, "delegated", 0, [], true, "Within delegated authority scope");
  }

  // Device trust escalation
  if (context.deviceTrust === "untrusted" && context.riskClass !== "low-risk") {
    return createDecision(decisionId, "medium-risk", 1, ["user"], false, "Untrusted device — confirmation required");
  }

  // Default by risk class
  if (context.riskClass === "high-risk") return createDecision(decisionId, "high-risk", 1, ["owner"], false, "High-risk action");
  if (context.riskClass === "medium-risk") return createDecision(decisionId, "medium-risk", 1, ["user"], false, "Medium-risk action");
  return createDecision(decisionId, "low-risk", 0, [], true, "Low-risk action — auto-approved");
}

function createDecision(
  decisionId: string, approvalClass: ApprovalClass, requiredApprovers: number,
  approverRoles: string[], autoApproved: boolean, reason: string,
): ApprovalDecision {
  return {
    decisionId, approvalClass, requiredApprovers, approverRoles, autoApproved, reason,
    policyRuleIds: [],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    escalationTimeMs: autoApproved ? 0 : 30 * 60 * 1000,
  };
}
