// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Models: Receipt Summary
// UI-facing summary of receipts — NEVER a source of truth
// ═══════════════════════════════════════════════════════════════

import type { ReceiptType, DomainId } from "../_contract-scaffold";

/** @layer read-model — derived from proof-pack, not authoritative */
export interface ReceiptSummaryItem {
  id: string;
  type: ReceiptType;
  domain: DomainId;
  description: string;
  timestamp: string;
  status: "verified" | "pending" | "failed";
  valueCents?: number;
}

export interface ReceiptSummary {
  userId: string;
  generatedAt: string;
  totalReceipts: number;
  recentReceipts: ReceiptSummaryItem[];
  byType: Record<string, number>;
  byDomain: Record<string, number>;
}
