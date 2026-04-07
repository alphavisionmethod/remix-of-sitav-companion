// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Requirements Service
// Resolves required approval level from ApprovalThreshold contracts
// ═══════════════════════════════════════════════════════════════

import type { ApprovalThreshold } from "@/packages/policy-contracts/approvals/types";

export interface ApprovalResolution {
  requiresApproval: boolean;
  requiresDualApproval: boolean;
  autoApproved: boolean;
  escalationTimeoutMinutes: number;
  matchedThreshold: ApprovalThreshold | null;
  reason: string;
}

const DEFAULT_THRESHOLDS: ApprovalThreshold[] = [
  { domain: "finance", actionType: "payment", riskLevel: "critical", amountThresholdCents: 500000, requiresApproval: true, requiresDualApproval: true, autoApproveBelow: undefined, escalationTimeoutMinutes: 15, description: "Finance payments >$5K need dual approval" },
  { domain: "finance", actionType: "payment", riskLevel: "high", amountThresholdCents: 50000, requiresApproval: true, requiresDualApproval: false, autoApproveBelow: 5000, escalationTimeoutMinutes: 30, description: "Finance payments >$500 need approval" },
  { domain: "finance", actionType: "transfer", riskLevel: "critical", amountThresholdCents: 100000, requiresApproval: true, requiresDualApproval: true, autoApproveBelow: undefined, escalationTimeoutMinutes: 10, description: "Transfers >$1K need dual approval" },
  { domain: "business", actionType: "communication", riskLevel: "medium", amountThresholdCents: undefined, requiresApproval: true, requiresDualApproval: false, autoApproveBelow: undefined, escalationTimeoutMinutes: 60, description: "Outbound comms need approval" },
  { domain: "business", actionType: "delete", riskLevel: "high", amountThresholdCents: undefined, requiresApproval: true, requiresDualApproval: true, autoApproveBelow: undefined, escalationTimeoutMinutes: 15, description: "Record deletion needs dual approval" },
  { domain: "concierge", actionType: "booking", riskLevel: "medium", amountThresholdCents: 10000, requiresApproval: true, requiresDualApproval: false, autoApproveBelow: 5000, escalationTimeoutMinutes: 120, description: "Bookings >$100 need approval" },
  { domain: "concierge", actionType: "purchase", riskLevel: "low", amountThresholdCents: 5000, requiresApproval: false, requiresDualApproval: false, autoApproveBelow: 5000, escalationTimeoutMinutes: 240, description: "Purchases <$50 auto-approved" },
];

export function resolveApprovalRequirements(
  domain: string,
  actionType: string,
  amountCents?: number,
  customThresholds?: ApprovalThreshold[]
): ApprovalResolution {
  const thresholds = [...(customThresholds || []), ...DEFAULT_THRESHOLDS];

  const candidates = thresholds.filter(
    (t) => t.domain === domain && t.actionType === actionType
  );

  if (candidates.length === 0) {
    return {
      requiresApproval: false,
      requiresDualApproval: false,
      autoApproved: true,
      escalationTimeoutMinutes: 0,
      matchedThreshold: null,
      reason: "No threshold rules matched — auto-approved",
    };
  }

  // Sort by risk level descending
  const riskOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  candidates.sort((a, b) => (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0));

  for (const threshold of candidates) {
    if (threshold.amountThresholdCents !== undefined && amountCents !== undefined) {
      if (amountCents < threshold.amountThresholdCents) continue;
    }

    if (threshold.autoApproveBelow !== undefined && amountCents !== undefined && amountCents < threshold.autoApproveBelow) {
      return {
        requiresApproval: false,
        requiresDualApproval: false,
        autoApproved: true,
        escalationTimeoutMinutes: 0,
        matchedThreshold: threshold,
        reason: `Auto-approved: amount ${amountCents}¢ below threshold ${threshold.autoApproveBelow}¢`,
      };
    }

    return {
      requiresApproval: threshold.requiresApproval,
      requiresDualApproval: threshold.requiresDualApproval,
      autoApproved: false,
      escalationTimeoutMinutes: threshold.escalationTimeoutMinutes,
      matchedThreshold: threshold,
      reason: threshold.description,
    };
  }

  return {
    requiresApproval: false,
    requiresDualApproval: false,
    autoApproved: true,
    escalationTimeoutMinutes: 0,
    matchedThreshold: null,
    reason: "No matching threshold — auto-approved",
  };
}

export function getThresholdsForDomain(domain: string): ApprovalThreshold[] {
  return DEFAULT_THRESHOLDS.filter((t) => t.domain === domain);
}

