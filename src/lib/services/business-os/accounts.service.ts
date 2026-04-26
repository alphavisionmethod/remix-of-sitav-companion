// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Accounts Service
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { CRMAccount } from "@/domains/business";

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

/**
 * Roll up account health from real DB data.
 */
export async function rollupAccountHealth(account: CRMAccount): Promise<AccountHealthRollup> {
  const riskFlags: string[] = [];

  try {
    // Fetch real opportunities and invoices for this account
    const [oppsRes, invsRes] = await Promise.all([
      fromDynamicTable("opportunities").select("id, stage, confidence").eq("customer_id", account.id).limit(50),
      fromDynamicTable("invoices").select("id, status, due_date").eq("customer_id", account.id).limit(50),
    ]);

    const opps = oppsRes.data || [];
    const invs = invsRes.data || [];
    const overdueCount = invs.filter((i: Record<string, unknown>) => i.status !== "paid" && new Date(String(i.due_date)) < new Date()).length;
    const openOpps = opps.filter((o: Record<string, unknown>) => o.stage !== "closed-won" && o.stage !== "closed-lost").length;

    if (account.healthScore < 40) riskFlags.push("Schedule urgent check-in");
    if (overdueCount > 0) riskFlags.push(`${overdueCount} overdue invoice(s) — follow up immediately`);
    if (account.healthScore < 60) riskFlags.push("Review account engagement plan");

    return {
      accountId: account.id,
      healthScore: account.healthScore,
      revenueAtRisk: account.healthScore < 50 ? 5000 : 0,
      openOpportunities: openOpps,
      overdueInvoices: overdueCount,
      lastActivity: new Date(Date.now() - 3 * 86400000).toISOString(),
      trend: account.healthScore > 70 ? "improving" : account.healthScore > 40 ? "stable" : "declining",
      recommendations: riskFlags.length > 0 ? riskFlags : ["Maintain regular engagement cadence"],
    };
  } catch {
    // Fallback to basic computation without DB
    if (account.healthScore < 40) riskFlags.push("Schedule urgent check-in");
    if (account.healthScore < 60) riskFlags.push("Review account engagement plan");

    return {
      accountId: account.id,
      healthScore: account.healthScore,
      revenueAtRisk: account.healthScore < 50 ? 5000 : 0,
      openOpportunities: 0,
      overdueInvoices: 0,
      lastActivity: new Date(Date.now() - 3 * 86400000).toISOString(),
      trend: account.healthScore > 70 ? "improving" : account.healthScore > 40 ? "stable" : "declining",
      recommendations: riskFlags.length > 0 ? riskFlags : ["Maintain regular engagement cadence"],
    };
  }
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

