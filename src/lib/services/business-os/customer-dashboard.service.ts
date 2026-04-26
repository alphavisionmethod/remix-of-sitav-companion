// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Customer Dashboard Service
// ═══════════════════════════════════════════════════════════════

import type { CRMAccount, CRMContact } from "@/domains/business";

export interface CustomerHealthResult {
  accountId: string;
  healthScore: number;
  trend: "improving" | "stable" | "declining";
  riskFlags: string[];
  recommendations: string[];
  lastUpdated: string;
}

export interface CustomerDashboard {
  account: CRMAccount;
  contacts: CRMContact[];
  health: CustomerHealthResult;
}

export function computeCustomerHealth(account: CRMAccount): CustomerHealthResult {
  const healthScore = account.healthScore;
  const riskFlags: string[] = [];
  if (healthScore < 40) riskFlags.push("Low health score");
  const trend = healthScore > 70 ? "improving" : healthScore > 40 ? "stable" : "declining";

  return {
    accountId: account.id,
    healthScore,
    trend,
    riskFlags,
    recommendations: riskFlags.length > 0 ? ["Schedule check-in call"] : ["Maintain engagement"],
    lastUpdated: new Date().toISOString(),
  };
}

export function buildDashboard(account: CRMAccount, contacts: CRMContact[]): CustomerDashboard {
  return { account, contacts, health: computeCustomerHealth(account) };
}

