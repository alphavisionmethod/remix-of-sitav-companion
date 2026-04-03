// ═══════════════════════════════════════════════════════════════
// SITA OS — Escalation Rules Service
// Time-based escalation, auto-escalate after timeout
// ═══════════════════════════════════════════════════════════════

import type { MultiStepApproval, MultiStepApprovalStep } from "@/packages/policy-contracts/approvals/types";

export interface EscalationConfig {
  domain: string;
  riskLevel: string;
  initialTimeoutMinutes: number;
  escalationSteps: { role: string; timeoutMinutes: number }[];
  maxEscalations: number;
  finalAction: "auto-reject" | "owner-notify" | "system-hold";
}

const ESCALATION_CONFIGS: EscalationConfig[] = [
  { domain: "finance", riskLevel: "critical", initialTimeoutMinutes: 15, escalationSteps: [{ role: "admin", timeoutMinutes: 10 }, { role: "owner", timeoutMinutes: 5 }], maxEscalations: 2, finalAction: "system-hold" },
  { domain: "finance", riskLevel: "high", initialTimeoutMinutes: 30, escalationSteps: [{ role: "owner", timeoutMinutes: 30 }], maxEscalations: 1, finalAction: "auto-reject" },
  { domain: "business", riskLevel: "high", initialTimeoutMinutes: 60, escalationSteps: [{ role: "owner", timeoutMinutes: 30 }], maxEscalations: 1, finalAction: "auto-reject" },
  { domain: "concierge", riskLevel: "medium", initialTimeoutMinutes: 120, escalationSteps: [{ role: "admin", timeoutMinutes: 60 }], maxEscalations: 1, finalAction: "owner-notify" },
];

export function getEscalationConfig(domain: string, riskLevel: string): EscalationConfig | undefined {
  return ESCALATION_CONFIGS.find((c) => c.domain === domain && c.riskLevel === riskLevel);
}

export function shouldEscalate(createdAt: string, config: EscalationConfig, currentEscalationLevel: number): boolean {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 60000;
  let totalTimeout = config.initialTimeoutMinutes;
  for (let i = 0; i < currentEscalationLevel && i < config.escalationSteps.length; i++) {
    totalTimeout += config.escalationSteps[i].timeoutMinutes;
  }
  return elapsed >= totalTimeout && currentEscalationLevel < config.maxEscalations;
}

export function getNextEscalationTarget(config: EscalationConfig, currentLevel: number): string | null {
  if (currentLevel >= config.escalationSteps.length) return null;
  return config.escalationSteps[currentLevel].role;
}

export function createMultiStepApproval(actionId: string, steps: { role: string; timeoutMinutes: number }[]): MultiStepApproval {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    actionId,
    currentStep: 0,
    status: "in-progress",
    createdAt: now.toISOString(),
    steps: steps.map((s, i): MultiStepApprovalStep => ({
      order: i,
      approverRole: s.role,
      status: i === 0 ? "pending" : "pending",
      expiresAt: new Date(now.getTime() + s.timeoutMinutes * 60000).toISOString(),
    })),
  };
}

export function advanceMultiStep(approval: MultiStepApproval, decision: "approved" | "rejected", reason?: string): MultiStepApproval {
  const step = approval.steps[approval.currentStep];
  if (!step || step.status !== "pending") return approval;

  step.status = decision === "approved" ? "approved" : "rejected";
  step.decidedAt = new Date().toISOString();
  step.reason = reason;

  if (decision === "rejected") {
    approval.status = "rejected";
  } else if (approval.currentStep >= approval.steps.length - 1) {
    approval.status = "approved";
    approval.completedAt = new Date().toISOString();
  } else {
    approval.currentStep++;
  }

  return approval;
}
