// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Council Orchestration
// Business / Finance / Concierge / Meta councils
// ═══════════════════════════════════════════════════════════════

export interface CouncilVote {
  advisorId: string;
  domain: string;
  recommendation: string;
  confidence: number;
  supportingData: string[];
  dissent?: string;
}

export interface CouncilDecision {
  councilType: "business" | "finance" | "concierge" | "meta";
  votes: CouncilVote[];
  consensus: boolean;
  consensusThreshold: number;
  finalRecommendation: string;
  confidence: number;
  dissents: string[];
  decidedAt: string;
}

export function runBusinessCouncil(topic: string): CouncilDecision {
  const votes: CouncilVote[] = [
    { advisorId: "biz-advisor", domain: "business", recommendation: `Address ${topic} through CRM optimization`, confidence: 82, supportingData: ["customer-health-data", "pipeline-metrics"] },
    { advisorId: "revenue-advisor", domain: "business", recommendation: `Revenue impact analysis for ${topic}`, confidence: 78, supportingData: ["revenue-trends", "churn-data"] },
  ];
  return buildDecision("business", votes, 60);
}

export function runFinanceCouncil(topic: string): CouncilDecision {
  const votes: CouncilVote[] = [
    { advisorId: "fin-advisor", domain: "finance", recommendation: `Financial assessment of ${topic}`, confidence: 88, supportingData: ["cash-position", "reserve-health"] },
    { advisorId: "investment-advisor", domain: "finance", recommendation: `Investment perspective on ${topic}`, confidence: 75, supportingData: ["portfolio-exposure", "risk-budget"] },
  ];
  return buildDecision("finance", votes, 60);
}

export function runConciergeCouncil(topic: string): CouncilDecision {
  const votes: CouncilVote[] = [
    { advisorId: "concierge-advisor", domain: "concierge", recommendation: `Household impact of ${topic}`, confidence: 80, supportingData: ["task-load", "calendar-conflicts"] },
  ];
  return buildDecision("concierge", votes, 50);
}

export function runMetaCouncil(topic: string, subCouncilDecisions: CouncilDecision[]): CouncilDecision {
  const votes: CouncilVote[] = subCouncilDecisions.map(d => ({
    advisorId: `${d.councilType}-council`,
    domain: d.councilType,
    recommendation: d.finalRecommendation,
    confidence: d.confidence,
    supportingData: [],
  }));
  return buildDecision("meta", votes, 50);
}

function buildDecision(type: CouncilDecision["councilType"], votes: CouncilVote[], threshold: number): CouncilDecision {
  const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
  const consensus = avgConfidence >= threshold;
  return {
    councilType: type,
    votes,
    consensus,
    consensusThreshold: threshold,
    finalRecommendation: votes[0]?.recommendation || "No recommendation",
    confidence: Math.round(avgConfidence),
    dissents: votes.filter(v => v.dissent).map(v => v.dissent!),
    decidedAt: new Date().toISOString(),
  };
}

