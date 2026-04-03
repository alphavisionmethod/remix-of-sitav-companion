export interface OpportunityRankResult {
  opportunityId: string;
  rank: number;
  compositeScore: number; // 0-100
  factors: {
    valueWeight: number;
    probabilityWeight: number;
    recencyWeight: number;
    strategicFitWeight: number;
    urgencyWeight: number;
  };
  tier: "top" | "strong" | "moderate" | "weak";
  recommendedAction: string;
  rankedAt: string;
}
