// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Quotes Service
// ═══════════════════════════════════════════════════════════════

export interface Quote {
  id: string;
  proposalId: string;
  accountId: string;
  totalCents: number;
  discountPercent: number;
  validUntil: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdAt: string;
  version: number;
}

export function createQuote(proposalId: string, accountId: string, totalCents: number, discountPercent: number = 0): Quote {
  const discountedTotal = Math.round(totalCents * (1 - discountPercent / 100));
  return {
    id: `quote-${Date.now()}`,
    proposalId,
    accountId,
    totalCents: discountedTotal,
    discountPercent,
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "draft",
    createdAt: new Date().toISOString(),
    version: 1,
  };
}

export function isQuoteExpired(quote: Quote): boolean {
  return new Date(quote.validUntil).getTime() < Date.now() && quote.status !== "accepted";
}

export function reviseQuote(quote: Quote, newTotalCents: number, newDiscount: number): Quote {
  return { ...quote, id: `quote-${Date.now()}`, totalCents: Math.round(newTotalCents * (1 - newDiscount / 100)), discountPercent: newDiscount, version: quote.version + 1, createdAt: new Date().toISOString(), status: "draft" };
}
