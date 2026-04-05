// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Revenue Ops — Invoice Record
// ═══════════════════════════════════════════════════════════════

export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "disputed" | "void" | "written-off";

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  accountId: string;
  contactId: string;
  quoteId?: string;
  estimateId?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
    taxRate: number;
  }>;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  agingDays: number;
  paymentTerms: string;
  paymentMethod?: string;
  recurringScheduleId?: string;
  lateFeeApplied: boolean;
  lateFeeCents: number;
  remindersSent: number;
  lastReminderAt?: string;
  notes?: string;
  pdfStoragePath?: string;
  proofOfPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}
