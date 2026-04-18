// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Learning Constraints
// Rule 16: Self-learning never mutates permissions/authority/trust.
// ═══════════════════════════════════════════════════════════════

export type LearningAction =
  // ALLOWED automatically
  | "ranking-improvement"
  | "suggestion-quality"
  | "summarization-quality"
  | "preference-learning"
  | "workflow-optimization-proposal"
  // PROHIBITED without human approval
  | "permission-change"
  | "authority-widening"
  | "policy-rewrite"
  | "evidence-threshold-change"
  | "approval-requirement-change"
  | "financial-limit-change"
  | "connector-scope-creation";

const ALLOWED_AUTOMATIC: LearningAction[] = [
  "ranking-improvement",
  "suggestion-quality",
  "summarization-quality",
  "preference-learning",
  "workflow-optimization-proposal",
];

const PROHIBITED_AUTOMATIC: LearningAction[] = [
  "permission-change",
  "authority-widening",
  "policy-rewrite",
  "evidence-threshold-change",
  "approval-requirement-change",
  "financial-limit-change",
  "connector-scope-creation",
];

export interface LearningProposal {
  proposalId: string;
  action: LearningAction;
  description: string;
  evidence: string[];
  confidence: number;
  autoApplicable: boolean;
  requiresHumanReview: boolean;
  tenantId: string;
  proposedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: "proposed" | "approved" | "rejected" | "auto-applied";
}

export function validateLearningAction(action: LearningAction): {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
} {
  if (ALLOWED_AUTOMATIC.includes(action)) {
    return { allowed: true, requiresApproval: false, reason: "Safe learning action — auto-applicable" };
  }
  if (PROHIBITED_AUTOMATIC.includes(action)) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: `${action} cannot be applied automatically — requires human review and approval`,
    };
  }
  return { allowed: false, requiresApproval: true, reason: "Unknown action — defaults to human review" };
}

export function createLearningProposal(
  action: LearningAction,
  description: string,
  evidence: string[],
  confidence: number,
  tenantId: string,
): LearningProposal {
  const validation = validateLearningAction(action);
  return {
    proposalId: crypto.randomUUID(),
    action,
    description,
    evidence,
    confidence,
    autoApplicable: validation.allowed && !validation.requiresApproval,
    requiresHumanReview: validation.requiresApproval,
    tenantId,
    proposedAt: new Date().toISOString(),
    status: validation.allowed && !validation.requiresApproval ? "auto-applied" : "proposed",
  };
}
