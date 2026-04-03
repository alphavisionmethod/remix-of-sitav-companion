export interface CollectionsEscalationPacket {
  id: string;
  invoiceId: string;
  accountId: string;
  accountName: string;
  outstandingCents: number;
  agingDays: number;
  agingBucket: "30-day" | "60-day" | "90-plus";
  previousAttempts: number;
  escalationLevel: 1 | 2 | 3;
  recommendedAction: "final-notice" | "payment-plan" | "collections-agency" | "legal-review";
  approvalRequired: boolean;
  approvalId?: string;
  createdAt: string;
  status: "pending" | "approved" | "executed" | "resolved";
}
