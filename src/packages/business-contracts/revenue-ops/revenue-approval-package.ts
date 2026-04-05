// SITA OS — Revenue Ops: Revenue Approval Package
export interface RevenueApprovalPackage {
  id: string;
  entityType: "quote" | "invoice" | "credit-note" | "refund" | "discount" | "write-off";
  entityId: string;
  amountCents: number;
  requestedBy: string;
  approverChain: Array<{ userId: string; role: string; status: "pending" | "approved" | "rejected"; decidedAt?: string; notes?: string }>;
  currentApproverIndex: number;
  status: "pending" | "approved" | "rejected" | "expired";
  justification: string;
  proofId?: string;
  createdAt: string;
  completedAt?: string;
}
