// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Boardroom Inputs Service
// Aggregates business data for boardroom sessions
// ═══════════════════════════════════════════════════════════════

export interface BusinessBoardroomPacket {
  period: string;
  pipelineValueCents: number;
  activeDeals: number;
  winRate: number;
  revenueGrowthPct: number;
  churnRiskAccounts: number;
  staleLeads: number;
  recoveredRevenueCents: number;
  topOpportunities: { name: string; valueCents: number; stage: string }[];
  actionItems: string[];
  generatedAt: string;
}

export function buildBusinessBoardroomPacket(): BusinessBoardroomPacket {
  return {
    period: new Date().toISOString().slice(0, 7),
    pipelineValueCents: 14200000,
    activeDeals: 12,
    winRate: 34,
    revenueGrowthPct: 12,
    churnRiskAccounts: 2,
    staleLeads: 8,
    recoveredRevenueCents: 420000,
    topOpportunities: [
      { name: "Atlas Corp — Platform License", valueCents: 2800000, stage: "negotiation" },
      { name: "Beacon Health — Annual Contract", valueCents: 1500000, stage: "closing" },
      { name: "Coral Dynamics — Expansion", valueCents: 850000, stage: "proposal" },
    ],
    actionItems: [
      "Close Atlas Corp deal this week — contract ready",
      "Re-engage 8 stale leads or reassign",
      "Schedule check-in with 2 churn-risk accounts",
    ],
    generatedAt: new Date().toISOString(),
  };
}
