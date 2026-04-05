// SITA OS — Revenue Ops: Proposal Record
export interface ProposalRecord {
  id: string;
  accountId: string;
  opportunityId?: string;
  title: string;
  sections: Array<{ heading: string; body: string; order: number }>;
  pricingSummary: { totalCents: number; currency: string; paymentTerms: string };
  status: "draft" | "internal-review" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  version: number;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  pdfStoragePath?: string;
  preparedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}
