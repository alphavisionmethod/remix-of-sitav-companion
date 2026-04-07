// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Family Office Review Service
// Generates periodic review packets
// ═══════════════════════════════════════════════════════════════

import type { FamilyOfficeReviewPacket } from "@/packages/finance-contracts";

export function buildFamilyOfficeReview(): FamilyOfficeReviewPacket {
  return {
    entities: [
      { entityId: "e-personal", name: "Personal", type: "individual", netWorth: 1080000, performancePeriod: "Q1 2026", returnPercent: 4.2 },
      { entityId: "e-business", name: "Business LLC", type: "llc", netWorth: 850000, performancePeriod: "Q1 2026", returnPercent: 8.1 },
      { entityId: "e-trust", name: "Family Trust", type: "trust", netWorth: 600000, performancePeriod: "Q1 2026", returnPercent: 3.5 },
    ],
    totalNetWorth: 2530000,
    portfolioAllocation: [
      { assetClass: "Equities", valueCents: 125000000, percentOfPortfolio: 50, targetPercent: 55, drift: -5 },
      { assetClass: "Fixed Income", valueCents: 62500000, percentOfPortfolio: 25, targetPercent: 25, drift: 0 },
      { assetClass: "Real Estate", valueCents: 37500000, percentOfPortfolio: 15, targetPercent: 12, drift: 3 },
      { assetClass: "Cash", valueCents: 25000000, percentOfPortfolio: 10, targetPercent: 8, drift: 2 },
    ],
    taxObligations: [],
    upcomingEvents: [
      "Quarterly tax estimate due April 15",
      "Trust annual review — schedule with counsel",
      "LLC operating agreement renewal",
    ],
    riskAssessment: "Moderate — portfolio within mandate bounds, minor drift in real estate and cash allocations",
    generatedAt: new Date().toISOString(),
  };
}

export function computeReviewScore(review: FamilyOfficeReviewPacket): { score: number; grade: string } {
  const driftPenalty = review.portfolioAllocation.reduce((s, a) => s + Math.abs(a.drift), 0);
  const score = Math.max(0, 100 - driftPenalty * 3 - review.taxObligations.length * 5);
  const grade = score > 85 ? "A" : score > 70 ? "B" : score > 55 ? "C" : "D";
  return { score, grade };
}

