// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Projection Service
// Pipeline + revenue + customer health rollup
// ═══════════════════════════════════════════════════════════════

export interface BusinessProjection {
  timestamp: string;
  pipeline: { totalValueCents: number; dealCount: number; weightedValueCents: number; avgDealSizeCents: number };
  revenue: { mtdCents: number; projectedMonthCents: number; yoyGrowthPct: number; arrCents: number };
  customerHealth: { avgScore: number; atRiskCount: number; healthyCount: number; churnRiskRevenueCents: number };
  topOpportunities: { id: string; name: string; valueCents: number; probability: number; stage: string }[];
  staleLeads: number;
  pendingFollowUps: number;
}

export function generateBusinessProjection(): BusinessProjection {
  return {
    timestamp: new Date().toISOString(),
    pipeline: { totalValueCents: 124500000, dealCount: 23, weightedValueCents: 68200000, avgDealSizeCents: 5413043 },
    revenue: { mtdCents: 87300000, projectedMonthCents: 112000000, yoyGrowthPct: 18.5, arrCents: 1344000000 },
    customerHealth: { avgScore: 74, atRiskCount: 5, healthyCount: 42, churnRiskRevenueCents: 23400000 },
    topOpportunities: [
      { id: "opp-1", name: "Enterprise License Renewal", valueCents: 24000000, probability: 0.85, stage: "negotiation" },
      { id: "opp-2", name: "New Market Expansion", valueCents: 18000000, probability: 0.6, stage: "proposal" },
      { id: "opp-3", name: "Upsell Analytics Pack", valueCents: 8500000, probability: 0.75, stage: "demo" },
    ],
    staleLeads: 12,
    pendingFollowUps: 8,
  };
}
