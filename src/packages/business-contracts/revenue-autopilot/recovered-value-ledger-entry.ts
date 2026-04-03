export interface RecoveredValueLedgerEntry {
  id: string;
  leakId: string;
  recoveryPlanId: string;
  amountCents: number;
  recoveredAt: string;
  method: "payment-received" | "credit-applied" | "discount-accepted" | "renegotiated";
  entityId: string;
  entityType: string;
  verifiedByReceiptId?: string;
  notes: string;
}
