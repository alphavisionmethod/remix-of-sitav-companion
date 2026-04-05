// SITA OS — Revenue Ops: Quote Record
export interface QuoteRecord {
  id: string;
  quoteNumber: string;
  accountId: string;
  contactId: string;
  opportunityId?: string;
  lineItems: Array<{ description: string; quantity: number; unitPriceCents: number; totalCents: number; discountPct: number }>;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  status: "draft" | "pending-approval" | "approved" | "sent" | "accepted" | "rejected" | "expired" | "revised";
  validUntil: string;
  revisionNumber: number;
  previousVersionId?: string;
  notes?: string;
  terms: string;
  preparedBy: string;
  approvedBy?: string;
  sentAt?: string;
  respondedAt?: string;
  convertedToInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}
