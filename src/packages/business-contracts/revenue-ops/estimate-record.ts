// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Revenue Ops — Estimate Record
// ═══════════════════════════════════════════════════════════════

export type EstimateStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "converted";

export interface EstimateRecord {
  id: string;
  estimateNumber: string;
  accountId: string;
  contactId: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
    category?: string;
  }>;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  status: EstimateStatus;
  validUntil: string;
  convertedToQuoteId?: string;
  convertedToInvoiceId?: string;
  notes?: string;
  preparedBy: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}
