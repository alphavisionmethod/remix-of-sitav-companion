// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Quote (Expanded Canonical)
// ═══════════════════════════════════════════════════════════════

import type { MonetaryAmount, CurrencyCode } from "./_contract-scaffold";

export type QuoteStatus = "draft" | "pending-review" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "revised";

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  discountPct: number;
  taxRate: number;
  totalCents: number;
  category?: string;
  sku?: string;
  recurring: boolean;
  recurringInterval?: "monthly" | "quarterly" | "annually";
}

export interface QuoteExpanded {
  id: string;
  quoteNumber: string;
  opportunityId: string;
  accountId: string;
  accountName: string;
  contactId: string;
  lineItems: QuoteLineItem[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: CurrencyCode;
  status: QuoteStatus;
  validUntil: string;
  revisionNumber: number;
  previousVersionId?: string;
  terms: string;
  notes?: string;
  preparedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  signatureUrl?: string;
  pdfStoragePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteComparisonResult {
  quoteId: string;
  competitorQuotes: Array<{ competitor: string; estimatedTotal: number; comparison: "cheaper" | "similar" | "more-expensive" }>;
  winProbability: number;
  suggestedAdjustments: Array<{ lineItemId: string; suggestion: string; impactCents: number }>;
  analyzedAt: string;
}
