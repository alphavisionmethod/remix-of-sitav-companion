// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Accounts Service
// ═══════════════════════════════════════════════════════════════

import type { CRMAccount } from "@/packages/business-contracts";

export interface AccountHealthRollup {
  accountId: string;
  healthScore: number;
  revenueAtRisk: number;
  openOpportunities: number;
  overdueInvoices: number;
  lastActivity: string;
  trend: "improving" | "stable" | "declining";
  recommendations: string[];
}

export function rollupAccountHealth(account: CRMAccount): AccountHealthRollup {
  const riskFlags: string[] = [];
  if (account.healthScore < 40) riskFlags.push("Schedule urgent check-in");
  if (account.healthScore < 60) riskFlags.push("Review account engagement plan");

  return {
    accountId: account.id,
    healthScore: account.healthScore,
    revenueAtRisk: account.healthScore < 50 ? 5000 : 0,
    openOpportunities: 2,
    overdueInvoices: account.healthScore < 40 ? 1 : 0,
    lastActivity: new Date(Date.now() - 3 * 86400000).toISOString(),
    trend: account.healthScore > 70 ? "improving" : account.healthScore > 40 ? "stable" : "declining",
    recommendations: riskFlags.length > 0 ? riskFlags : ["Maintain regular engagement cadence"],
  };
}

export function segmentAccounts(accounts: CRMAccount[]): Record<string, CRMAccount[]> {
  const segments: Record<string, CRMAccount[]> = { healthy: [], at_risk: [], critical: [] };
  for (const a of accounts) {
    if (a.healthScore > 70) segments.healthy.push(a);
    else if (a.healthScore > 40) segments.at_risk.push(a);
    else segments.critical.push(a);
  }
  return segments;
}
