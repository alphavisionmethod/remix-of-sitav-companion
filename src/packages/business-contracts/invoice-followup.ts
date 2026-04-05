// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Invoice Follow-Up & Collections
// ═══════════════════════════════════════════════════════════════

export type InvoiceAgingBucket = "current" | "1-30" | "31-60" | "61-90" | "90-plus";

export interface InvoiceFollowUpPlan {
  id: string;
  invoiceId: string;
  accountId: string;
  amountOwedCents: number;
  agingDays: number;
  agingBucket: InvoiceAgingBucket;
  steps: FollowUpStep[];
  currentStep: number;
  status: "pending" | "active" | "paused" | "paid" | "escalated" | "written-off";
  startedAt?: string;
  paidAt?: string;
  escalatedAt?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface FollowUpStep {
  order: number;
  action: "friendly-reminder" | "formal-notice" | "phone-call" | "payment-plan-offer" | "final-notice" | "escalation";
  channel: "email" | "phone" | "sms" | "letter";
  scheduledAt: string;
  executedAt?: string;
  result?: "sent" | "responded" | "promised-payment" | "disputed" | "no-response" | "paid";
  template?: string;
  notes?: string;
}

export interface CollectionsMetrics {
  period: string;
  totalOutstandingCents: number;
  byAgingBucket: Record<InvoiceAgingBucket, { count: number; totalCents: number }>;
  avgDaysToPayment: number;
  collectionRate: number;
  writtenOffCents: number;
  disputedCents: number;
  paymentPlansCents: number;
  escalatedCount: number;
}

export interface PaymentPlanProposal {
  id: string;
  invoiceIds: string[];
  accountId: string;
  totalOwedCents: number;
  installments: Array<{ number: number; amountCents: number; dueDate: string; status: "pending" | "paid" | "missed" }>;
  interestRate: number;
  status: "proposed" | "accepted" | "active" | "completed" | "defaulted";
  proposedAt: string;
  acceptedAt?: string;
  approvedBy?: string;
}
