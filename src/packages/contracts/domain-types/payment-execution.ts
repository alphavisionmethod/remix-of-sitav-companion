// ═══════════════════════════════════════════════════════════════
// SITA OS — Payment Execution Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped, CorrelationContext } from "../_contract-scaffold";

export type PaymentMethod = "bank-transfer" | "card" | "direct-debit" | "crypto" | "invoice" | "wallet";

export type PaymentStatus = "draft" | "pending-approval" | "approved" | "processing" | "completed" | "failed" | "refunded" | "cancelled";

export type PaymentDirection = "inbound" | "outbound";

export interface PaymentIntent extends Timestamped, TenantScoped {
  amount: number;
  currency: string;
  method: PaymentMethod;
  direction: PaymentDirection;
  status: PaymentStatus;
  recipientId: string;
  recipientName: string;
  recipientAccount?: string;
  description: string;
  reference: string;
  dueDate?: string;
  scheduledDate?: string;
  processedAt?: string;
  failureReason?: string;
  retryCount: number;
  approvalId?: string;
  receiptId?: string;
  correlation: CorrelationContext;
  metadata: Record<string, unknown>;
  fees: { amount: number; currency: string; type: string }[];
  taxAmount?: number;
  taxRate?: number;
}

export interface PaymentResult extends BaseContract {
  intentId: string;
  success: boolean;
  transactionId?: string;
  providerReference?: string;
  settledAmount: number;
  settledCurrency: string;
  settledAt?: string;
  providerResponse?: Record<string, unknown>;
  receiptHash?: string;
}

export interface PaymentReconciliation extends BaseContract, TenantScoped {
  period: string;
  totalInbound: number;
  totalOutbound: number;
  netPosition: number;
  currency: string;
  matchedCount: number;
  unmatchedCount: number;
  discrepancies: PaymentDiscrepancy[];
  reconciledAt: string;
}

export interface PaymentDiscrepancy {
  intentId: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  reason: string;
  resolved: boolean;
}
