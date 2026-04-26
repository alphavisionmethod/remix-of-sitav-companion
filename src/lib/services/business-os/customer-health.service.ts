// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Customer Health Service
// Deterministic health score computation engine
// ═══════════════════════════════════════════════════════════════

import type { CRMAccount } from "@/domains/business";

export interface HealthScoreBreakdown {
  accountId: string;
  overall: number;
  engagement: number;
  revenue: number;
  satisfaction: number;
  tenure: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: HealthFactor[];
  computedAt: string;
}

export interface HealthFactor {
  name: string;
  score: number;
  weight: number;
  impact: "positive" | "neutral" | "negative";
  detail: string;
}

export function computeHealthScore(account: CRMAccount, daysSinceLastContact: number): HealthScoreBreakdown {
  const engagement = Math.max(0, 100 - daysSinceLastContact * 2);
  const revenue = 70; // mock — would come from invoice aggregation
  const satisfaction = account.healthScore;
  const tenure = 70;

  const factors: HealthFactor[] = [
    { name: "Engagement", score: engagement, weight: 0.3, impact: engagement > 60 ? "positive" : "negative", detail: `${daysSinceLastContact} days since last contact` },
    { name: "Revenue", score: revenue, weight: 0.25, impact: "positive", detail: "Based on invoice history" },
    { name: "Satisfaction", score: satisfaction, weight: 0.3, impact: satisfaction > 60 ? "positive" : "negative", detail: `Health: ${satisfaction}/100` },
    { name: "Tenure", score: tenure, weight: 0.15, impact: "positive", detail: "Active customer" },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
  const riskLevel = overall < 25 ? "critical" : overall < 50 ? "high" : overall < 70 ? "medium" : "low";

  return { accountId: account.id, overall, engagement, revenue, satisfaction, tenure, riskLevel, factors, computedAt: new Date().toISOString() };
}

export function identifyChurnRisk(accounts: CRMAccount[]): CRMAccount[] {
  return accounts.filter(a => a.healthScore < 40).sort((a, b) => a.healthScore - b.healthScore);
}

