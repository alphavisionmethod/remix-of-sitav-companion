// SITA OS — Revenue Ops: Payment Proof Link
export interface PaymentProofLink {
  invoiceId: string;
  paymentMethod: "bank-transfer" | "card" | "check" | "cash" | "crypto" | "other";
  transactionRef: string;
  amountCents: number;
  paidAt: string;
  proofStoragePath?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: "pending-verification" | "verified" | "disputed" | "rejected";
  proofRecordId?: string;
}
