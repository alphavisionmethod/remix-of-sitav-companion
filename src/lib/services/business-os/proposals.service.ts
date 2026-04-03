// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Proposals Service
// ═══════════════════════════════════════════════════════════════

export interface Proposal {
  id: string;
  accountId: string;
  title: string;
  totalCents: number;
  lineItems: ProposalLineItem[];
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  validUntil: string;
  createdAt: string;
  sentAt?: string;
}

export interface ProposalLineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export function createProposal(accountId: string, title: string, items: Omit<ProposalLineItem, "totalCents">[]): Proposal {
  const lineItems = items.map(i => ({ ...i, totalCents: i.quantity * i.unitPriceCents }));
  return {
    id: `prop-${Date.now()}`,
    accountId,
    title,
    totalCents: lineItems.reduce((s, i) => s + i.totalCents, 0),
    lineItems,
    status: "draft",
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export function computeWinRate(proposals: Proposal[]): number {
  const decided = proposals.filter(p => p.status === "accepted" || p.status === "rejected");
  if (decided.length === 0) return 0;
  return Math.round((decided.filter(p => p.status === "accepted").length / decided.length) * 100);
}
