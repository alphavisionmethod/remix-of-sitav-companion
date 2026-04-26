// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Safe-to-Spend Service
// Enhanced safe-to-spend with forecasting
// ═══════════════════════════════════════════════════════════════

import type { FinancialAccount, ObligationRecord, ReserveModel, SafeToSpendResult } from "@/packages/finance-contracts";

import type { SafeToSpendForecast } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { SafeToSpendForecast };

export function computeSafeToSpendForecast(
  accounts: FinancialAccount[],
  obligations: ObligationRecord[],
  reserves: ReserveModel[]
): SafeToSpendForecast {
  const compute = (daysAhead: number): SafeToSpendResult => {
    const cutoff = Date.now() + daysAhead * 86400000;
    const totalBalance = accounts.filter(a => a.type === "checking" || a.type === "savings").reduce((s, a) => s + a.availableCents, 0);
    const upcomingObl = obligations
      .filter(o => (o.status === "upcoming" || o.status === "due") && new Date(o.nextDueDate).getTime() <= cutoff)
      .reduce((s, o) => s + o.amountCents, 0);
    const reserveAlloc = reserves.reduce((s, r) => s + r.monthlyContributionCents, 0) * (daysAhead / 30);
    const safe = Math.max(0, totalBalance - upcomingObl - reserveAlloc);

    const warnings: string[] = [];
    if (safe < 10000) warnings.push("Safe-to-spend below $100");
    if (upcomingObl > totalBalance * 0.8) warnings.push("Obligations exceed 80% of balance");

    return {
      balanceCents: totalBalance, upcomingObligationsCents: Math.round(upcomingObl),
      reserveAllocationCents: Math.round(reserveAlloc), pendingIncomeCents: 0,
      safeToSpendCents: Math.round(safe), calculatedAt: new Date().toISOString(),
      confidence: daysAhead <= 7 ? 0.95 : 0.80, warnings,
    };
  };

  const current = compute(0);
  const sevenDay = compute(7);
  const thirtyDay = compute(30);
  const trend = thirtyDay.safeToSpendCents > current.safeToSpendCents ? "improving" : thirtyDay.safeToSpendCents < current.safeToSpendCents * 0.8 ? "tightening" : "stable";

  const recommendations: string[] = [];
  if (trend === "tightening") recommendations.push("Cash flow tightening — review upcoming obligations");
  if (current.safeToSpendCents < 50000) recommendations.push("Consider deferring non-essential spending");

  return { current, sevenDay, thirtyDay, trend, recommendations };
}

