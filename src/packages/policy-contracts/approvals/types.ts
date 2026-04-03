export interface ApprovalThreshold {
  domain: string;
  actionType: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  amountThresholdCents?: number;
  requiresApproval: boolean;
  requiresDualApproval: boolean;
  autoApproveBelow?: number;
  escalationTimeoutMinutes: number;
  description: string;
}

export interface MultiStepApproval {
  id: string;
  actionId: string;
  steps: MultiStepApprovalStep[];
  currentStep: number;
  status: "in-progress" | "approved" | "rejected" | "expired";
  createdAt: string;
  completedAt?: string;
}

export interface MultiStepApprovalStep {
  order: number;
  approverRole: string;
  approverId?: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  decidedAt?: string;
  reason?: string;
  expiresAt: string;
}
