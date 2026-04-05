// SITA OS — Business Contracts: Review Request
export type ReviewType = "quote" | "proposal" | "contract" | "pricing" | "discount" | "refund" | "credit" | "write-off";
export type ReviewUrgency = "immediate" | "same-day" | "standard" | "low";

export interface ReviewRequest {
  id: string;
  type: ReviewType;
  entityId: string;
  entityType: string;
  requestedBy: string;
  assignedTo?: string;
  urgency: ReviewUrgency;
  reason: string;
  context: Record<string, unknown>;
  dueBy?: string;
  status: "pending" | "in-review" | "approved" | "rejected" | "escalated";
  reviewNotes?: string;
  decisionAt?: string;
  decisionBy?: string;
  proofId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPolicy {
  id: string;
  type: ReviewType;
  autoApproveThresholdCents?: number;
  requiredApprovers: number;
  escalationAfterHours: number;
  notifyChannels: string[];
  active: boolean;
}
