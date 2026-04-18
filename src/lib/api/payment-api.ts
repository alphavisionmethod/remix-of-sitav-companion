// ═══════════════════════════════════════════════════════════════
// SITA OS — Payment Process API Client
// Typed wrapper around the payment-process edge function
// ═══════════════════════════════════════════════════════════════

import { callEdge } from "./edge-client";
import type { PaymentProcessRequest, PaymentProcessResponse } from "@/packages/contracts/api-schemas";

export async function initiatePayment(params: {
  amount_cents: number;
  account_id: string;
  description: string;
  currency?: string;
  recipient?: string;
  category?: string;
}) {
  return callEdge("payment-process", {
    action: "initiate",
    amount_cents: params.amount_cents,
    currency: params.currency ?? "USD",
    account_id: params.account_id,
    description: params.description,
    recipient: params.recipient,
    category: params.category,
  });
}

export async function verifyPayment(approval_id: string) {
  return callEdge("payment-process", {
    action: "verify",
    approval_id,
  });
}

export async function listPendingPayments(limit = 25) {
  return callEdge("payment-process", {
    action: "list-pending",
    limit,
  });
}

export async function cancelPayment(approval_id: string, reason?: string) {
  return callEdge("payment-process", {
    action: "cancel",
    approval_id,
    reason,
  });
}
