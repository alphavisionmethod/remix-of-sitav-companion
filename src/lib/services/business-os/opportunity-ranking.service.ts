// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Opportunity Ranking Service
// Weighted multi-factor ranking algorithm
// ═══════════════════════════════════════════════════════════════

import type { Opportunity } from "./opportunity-engine.service";

export interface RankingConfig {
  valueCentsWeight: number;
  probabilityWeight: number;
  urgencyWeight: number;
  accountHealthWeight: number;
}

export interface RankedOpportunity {
  opportunity: Opportunity;
  rank: number;
  compositeScore: number;
  breakdown: { factor: string; raw: number; weighted: number }[];
}

const DEFAULT_CONFIG: RankingConfig = { valueCentsWeight: 0.35, probabilityWeight: 0.30, urgencyWeight: 0.20, accountHealthWeight: 0.15 };

export function rankOpportunitiesWeighted(opportunities: Opportunity[], config: RankingConfig = DEFAULT_CONFIG): RankedOpportunity[] {
  const maxValue = Math.max(...opportunities.map(o => o.valueCents), 1);

  return opportunities
    .map(opp => {
      const valueNorm = (opp.valueCents / maxValue) * 100;
      const probNorm = opp.probability * 100;
      const daysToClose = Math.max(0, (new Date(opp.expectedCloseDate).getTime() - Date.now()) / 86400000);
      const urgencyNorm = Math.max(0, 100 - daysToClose);
      const healthNorm = 70; // mock — would come from account health service

      const breakdown = [
        { factor: "Value", raw: valueNorm, weighted: valueNorm * config.valueCentsWeight },
        { factor: "Probability", raw: probNorm, weighted: probNorm * config.probabilityWeight },
        { factor: "Urgency", raw: urgencyNorm, weighted: urgencyNorm * config.urgencyWeight },
        { factor: "Account Health", raw: healthNorm, weighted: healthNorm * config.accountHealthWeight },
      ];

      return {
        opportunity: opp,
        rank: 0,
        compositeScore: Math.round(breakdown.reduce((s, b) => s + b.weighted, 0)),
        breakdown,
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((ro, i) => ({ ...ro, rank: i + 1 }));
}

