// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Pricing Proposal & Strategy
// ═══════════════════════════════════════════════════════════════

export type PricingModel = "fixed" | "hourly" | "per-unit" | "tiered" | "subscription" | "value-based" | "hybrid";
export type DiscountType = "percentage" | "fixed-amount" | "bundle" | "volume" | "loyalty" | "seasonal";

export interface PricingProposal {
  id: string;
  opportunityId: string;
  accountId: string;
  pricingModel: PricingModel;
  lineItems: PricingLineItem[];
  subtotalCents: number;
  discounts: AppliedDiscount[];
  totalDiscountCents: number;
  finalTotalCents: number;
  marginPct: number;
  competitivePosition: "below-market" | "at-market" | "above-market" | "premium";
  validUntil: string;
  approvalRequired: boolean;
  approvedBy?: string;
  notes?: string;
  aiRecommendation?: string;
  createdAt: string;
  version: number;
}

export interface PricingLineItem {
  id: string;
  description: string;
  unitPriceCents: number;
  quantity: number;
  costCents: number;
  marginPct: number;
  category: string;
}

export interface AppliedDiscount {
  type: DiscountType;
  description: string;
  valueCents: number;
  justification: string;
  approvalRequired: boolean;
}

export interface PricingGuidance {
  opportunityId: string;
  recommendedPriceCents: number;
  priceFloorCents: number;
  priceCeilingCents: number;
  competitorRange: { low: number; mid: number; high: number };
  customerWillingnessToPay: number;
  marginTarget: number;
  factors: Array<{ name: string; impact: "increase" | "decrease" | "neutral"; description: string }>;
  generatedAt: string;
  confidence: number;
}
