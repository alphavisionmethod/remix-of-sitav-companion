// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Revenue Ops — Collections State
// ═══════════════════════════════════════════════════════════════

export type CollectionsStatus = "current" | "follow-up" | "escalated" | "legal" | "written-off" | "settled";

export interface CollectionsAccountState {
  accountId: string;
  accountName: string;
  totalOwedCents: number;
  oldestInvoiceAge: number;
  invoiceCount: number;
  status: CollectionsStatus;
  assignedCollector?: string;
  lastContactAt?: string;
  nextActionAt?: string;
  paymentPromiseDate?: string;
  disputeActive: boolean;
  notes: string[];
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}
