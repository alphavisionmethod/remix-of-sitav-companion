// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Reactivation Service
// Dormant customer reactivation engine
// ═══════════════════════════════════════════════════════════════

import type { CRMAccount } from "@/domains/business";

export interface ReactivationCandidate {
  accountId: string;
  accountName: string;
  dormantDays: number;
  previousRevenue: number;
  reactivationScore: number;
  recommendedApproach: "personal-outreach" | "offer" | "content-nurture" | "event-invite";
  estimatedRecoveryValueCents: number;
}

export function identifyReactivationCandidates(accounts: CRMAccount[], dormantThresholdDays: number = 60): ReactivationCandidate[] {
  return accounts
    .filter(a => a.healthScore < 30)
    .map(a => {
      const dormantDays = Math.floor(Math.random() * 120) + dormantThresholdDays;
      const reactivationScore = Math.max(0, 100 - dormantDays + a.healthScore);
      let approach: ReactivationCandidate["recommendedApproach"] = "content-nurture";
      if (a.healthScore > 20) approach = "personal-outreach";
      else if (reactivationScore > 60) approach = "offer";
      else if (reactivationScore > 40) approach = "event-invite";

      return {
        accountId: a.id,
        accountName: a.name,
        dormantDays,
        previousRevenue: 0,
        reactivationScore,
        recommendedApproach: approach,
        estimatedRecoveryValueCents: Math.round(a.healthScore * 1000),
      };
    })
    .sort((a, b) => b.reactivationScore - a.reactivationScore);
}

