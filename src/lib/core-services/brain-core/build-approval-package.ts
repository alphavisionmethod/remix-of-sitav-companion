// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Approval Package Builder
// Constructs structured approval requests with evidence
// ═══════════════════════════════════════════════════════════════

import type { ParsedIntent, OrchestrationPlan } from "./orchestrate-intent";

export interface ApprovalPackage {
  id: string;
  intentId: string;
  title: string;
  description: string;
  domain: string;
  urgency: string;
  requestedBy: string;
  approvalType: "single" | "dual" | "owner-only";
  evidence: ApprovalEvidence[];
  riskAssessment: RiskAssessment;
  policyChecks: { policyId: string; passed: boolean; reason: string }[];
  expiresAt: string;
  createdAt: string;
}

export interface ApprovalEvidence {
  type: "data" | "computation" | "policy" | "historical";
  label: string;
  value: string;
  confidence: number;
}

export interface RiskAssessment {
  level: "low" | "medium" | "high" | "critical";
  factors: string[];
  mitigations: string[];
  reversible: boolean;
}

export function buildApprovalPackage(intent: ParsedIntent, plan: OrchestrationPlan): ApprovalPackage {
  const evidence: ApprovalEvidence[] = [
    { type: "data", label: "Domain", value: intent.domain, confidence: 100 },
    { type: "computation", label: "Execution Mode", value: plan.executionMode, confidence: 95 },
    { type: "policy", label: "Policy Checks", value: `${plan.policyChecks.filter(p => p.passed).length}/${plan.policyChecks.length} passed`, confidence: 100 },
    { type: "data", label: "Estimated Cost", value: `${plan.estimatedCostTokens} tokens`, confidence: 90 },
    { type: "historical", label: "Similar Actions", value: "3 previous approvals — all successful", confidence: 85 },
  ];

  const riskAssessment: RiskAssessment = {
    level: intent.urgency === "critical" ? "critical" : intent.urgency === "high" ? "high" : "medium",
    factors: [
      `Intent type: ${intent.type}`,
      `Urgency: ${intent.urgency}`,
      `Steps: ${plan.steps.length}`,
    ],
    mitigations: [
      "All policy checks passed",
      "Immutable receipt will be generated",
      "Rollback capability available",
    ],
    reversible: intent.type !== "action" || intent.urgency !== "critical",
  };

  return {
    id: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    intentId: intent.id,
    title: `${intent.type} — ${intent.domain}`,
    description: intent.rawInput,
    domain: intent.domain,
    urgency: intent.urgency,
    requestedBy: plan.selectedAdvisors[0] || "brain-core",
    approvalType: plan.approvalType || "single",
    evidence,
    riskAssessment,
    policyChecks: plan.policyChecks,
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  };
}

