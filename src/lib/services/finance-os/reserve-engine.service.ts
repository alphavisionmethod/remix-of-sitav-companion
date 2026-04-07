// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Reserve Engine Service
// Deterministic — no LLM, no hallucination
// ═══════════════════════════════════════════════════════════════

import type { ReserveModel, SafeToSpendResult, ObligationRecord, FinancialAccount } from "@/packages/finance-contracts";
import type { SinkingFund, ReserveHealth } from "@/packages/finance-contracts/reserves";

export function computeSafeToSpend(
  accounts: FinancialAccount[],
  obligations: ObligationRecord[],
  reserves: ReserveModel[]
): SafeToSpendResult {
  const totalBalance = accounts.filter(a => a.type === "checking" || a.type === "savings").reduce((sum, a) => sum + a.availableCents, 0);
  const upcomingObligations = obligations
    .filter(o => o.status === "upcoming" || o.status === "due")
    .reduce((sum, o) => sum + o.amountCents, 0);
  const reserveAllocation = reserves.reduce((sum, r) => sum + r.monthlyContributionCents, 0);
  const safeToSpend = Math.max(0, totalBalance - upcomingObligations - reserveAllocation);

  const warnings: string[] = [];
  if (safeToSpend < 10000) warnings.push("Safe-to-spend is below $100");
  if (upcomingObligations > totalBalance * 0.8) warnings.push("Obligations exceed 80% of balance");

  return {
    balanceCents: totalBalance,
    upcomingObligationsCents: upcomingObligations,
    reserveAllocationCents: reserveAllocation,
    pendingIncomeCents: 0,
    safeToSpendCents: safeToSpend,
    calculatedAt: new Date().toISOString(),
    confidence: 1.0,
    warnings,
  };
}

export function assessReserveHealth(reserves: ReserveModel[], sinkingFunds: SinkingFund[]): ReserveHealth {
  const totalCurrent = reserves.reduce((sum, r) => sum + r.currentCents, 0);
  const totalTarget = reserves.reduce((sum, r) => sum + r.targetCents, 0);
  const percentFunded = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 100;

  let riskLevel: ReserveHealth["riskLevel"] = "healthy";
  if (percentFunded < 25) riskLevel = "critical";
  else if (percentFunded < 50) riskLevel = "low";
  else if (percentFunded < 75) riskLevel = "adequate";

  const recommendations: string[] = [];
  if (riskLevel === "critical") recommendations.push("Urgently fund emergency reserve");
  if (riskLevel === "low") recommendations.push("Increase monthly reserve contributions");
  const underfundedSinking = sinkingFunds.filter(s => !s.onTrack);
  if (underfundedSinking.length > 0) recommendations.push(`${underfundedSinking.length} sinking fund(s) off track`);

  return {
    totalReservesCents: totalCurrent,
    totalTargetCents: totalTarget,
    percentFunded,
    monthsOfExpensesCovered: 3,
    riskLevel,
    recommendations,
    sinkingFunds,
    lastAssessedAt: new Date().toISOString(),
  };
}

