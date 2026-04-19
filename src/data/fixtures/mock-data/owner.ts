// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Owner Pages (Approvals, Pricing)
// ═══════════════════════════════════════════════════════════════

export interface OwnerApprovalItem {
  id: string;
  title: string;
  domain: string;
  requestedBy: string;
  riskTier: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "delegated";
  requestedAt: string;
  amount?: number;
  reason?: string;
}

export const MOCK_OWNER_APPROVALS: OwnerApprovalItem[] = [
  { id: "oa-1", title: "Wire transfer — Atlas Corp", domain: "finance", requestedBy: "Money Advisor", riskTier: "high", status: "pending", requestedAt: new Date(Date.now() - 3600000).toISOString(), amount: 12500 },
  { id: "oa-2", title: "Cancel Notion Teams subscription", domain: "finance", requestedBy: "Money Advisor", riskTier: "low", status: "pending", requestedAt: new Date(Date.now() - 7200000).toISOString(), amount: 240 },
  { id: "oa-3", title: "Lead reassignment batch", domain: "business", requestedBy: "Business Advisor", riskTier: "medium", status: "pending", requestedAt: new Date(Date.now() - 14400000).toISOString() },
  { id: "oa-4", title: "Collections escalation — INV-892", domain: "business", requestedBy: "Business Advisor", riskTier: "critical", status: "pending", requestedAt: new Date(Date.now() - 1800000).toISOString(), amount: 8400, reason: "92 days overdue. Recommend payment plan offer." },
];

export interface OwnerPricingItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  cycle: string;
  status: "active" | "draft" | "archived";
  lastChanged?: string;
}

export const MOCK_PRICING_ITEMS: OwnerPricingItem[] = [
  { id: "pr-1", name: "Strategic Advisory", price: 3500, currency: "USD", cycle: "monthly", status: "active", lastChanged: "2d ago" },
  { id: "pr-2", name: "Process Audit", price: 2000, currency: "USD", cycle: "one-time", status: "active", lastChanged: "1w ago" },
  { id: "pr-3", name: "Financial Modeling", price: 1500, currency: "USD", cycle: "monthly", status: "active", lastChanged: "3d ago" },
  { id: "pr-4", name: "Full-Service Package", price: 7000, currency: "USD", cycle: "monthly", status: "active", lastChanged: "1d ago" },
  { id: "pr-5", name: "Rush Delivery", price: 500, currency: "USD", cycle: "one-time", status: "active", lastChanged: "1w ago" },
];
