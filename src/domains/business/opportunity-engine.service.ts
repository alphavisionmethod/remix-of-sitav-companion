// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Opportunity Engine Service
// ═══════════════════════════════════════════════════════════════

export interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  valueCents: number;
  stage: "discovery" | "qualification" | "proposal" | "negotiation" | "closing" | "won" | "lost";
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  createdAt: string;
}

export interface OpportunityScore {
  opportunityId: string;
  score: number;
  factors: { name: string; score: number; weight: number }[];
  recommendation: string;
}

export function scoreOpportunity(opp: Opportunity): OpportunityScore {
  const stageScores: Record<string, number> = { discovery: 20, qualification: 35, proposal: 55, negotiation: 70, closing: 90, won: 100, lost: 0 };
  const stageScore = stageScores[opp.stage] || 0;
  const valueScore = Math.min(100, Math.round(opp.valueCents / 10000));
  const timeScore = Math.max(0, 100 - Math.floor((new Date(opp.expectedCloseDate).getTime() - Date.now()) / 86400000));

  const factors = [
    { name: "Stage", score: stageScore, weight: 0.4 },
    { name: "Deal Value", score: valueScore, weight: 0.35 },
    { name: "Time Pressure", score: timeScore, weight: 0.25 },
  ];

  const total = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
  const recommendation = total > 75 ? "Focus — high close probability" : total > 50 ? "Nurture — needs attention" : "Monitor — early stage";

  return { opportunityId: opp.id, score: total, factors, recommendation };
}

export function rankOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.sort((a, b) => {
    const aScore = scoreOpportunity(a).score;
    const bScore = scoreOpportunity(b).score;
    return bScore - aScore;
  });
}

