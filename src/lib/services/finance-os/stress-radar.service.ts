// ═══════════════════════════════════════════════════════════════
// SITA OS — Financial Stress Radar Engine
// Deterministic detection of financial stress signals
// ═══════════════════════════════════════════════════════════════

import type { StressSignal, StressRadarResult, StressSeverity } from "@/packages/finance-contracts/advanced-intelligence";

import type { StressRadarInput } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { StressRadarInput };

export function computeStressRadar(input: StressRadarInput): StressRadarResult {
  const signals: StressSignal[] = [];
  const now = new Date();
  let signalId = 0;
  const mkId = () => `stress-${++signalId}`;

  // Cash squeeze detection
  const runwayDays = input.monthlyBurnCents > 0
    ? Math.round((input.cashBalanceCents / input.monthlyBurnCents) * 30)
    : 999;
  if (runwayDays < 30) {
    signals.push({
      id: mkId(), category: "cash-squeeze", severity: runwayDays < 14 ? "critical" : "high",
      title: "Cash Runway Low", description: `Only ${runwayDays} days of cash remaining at current burn rate`,
      timing: `${runwayDays} days`, impactCents: input.monthlyBurnCents,
      windowStart: now.toISOString(), windowEnd: new Date(now.getTime() + runwayDays * 86400000).toISOString(),
      mitigations: ["Reduce discretionary spending", "Accelerate receivables", "Defer non-essential bills"],
    });
  }

  // Bill collision detection
  const billsByDate = new Map<string, Array<{ name: string; amountCents: number }>>();
  for (const b of input.upcomingBills) {
    const dateKey = b.dueDate.slice(0, 10);
    if (!billsByDate.has(dateKey)) billsByDate.set(dateKey, []);
    billsByDate.get(dateKey)!.push(b);
  }
  const collisions: StressRadarResult["billCollisions"] = [];
  for (const [date, bills] of billsByDate) {
    if (bills.length >= 2) {
      const total = bills.reduce((s, b) => s + b.amountCents, 0);
      collisions.push({ date, bills: bills.map(b => b.name), totalCents: total });
      if (total > input.cashBalanceCents * 0.3) {
        signals.push({
          id: mkId(), category: "bill-collision", severity: total > input.cashBalanceCents * 0.5 ? "critical" : "high",
          title: `Bill Collision on ${date}`, description: `${bills.length} bills totaling $${(total / 100).toLocaleString()} due same day`,
          timing: date, impactCents: total, windowStart: date, windowEnd: date,
          mitigations: ["Stagger payment dates", "Ensure sufficient balance", "Set up auto-pay sequencing"],
        });
      }
    }
  }

  // Reserve weakness
  if (input.reserveFundedPct < 50) {
    signals.push({
      id: mkId(), category: "reserve-weakness", severity: input.reserveFundedPct < 25 ? "critical" : "high",
      title: "Reserve Underfunded", description: `Emergency reserves only ${input.reserveFundedPct}% funded`,
      timing: "Ongoing", impactCents: input.reserveTargetCents - Math.round(input.reserveTargetCents * input.reserveFundedPct / 100),
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Increase monthly reserve contribution", "Redirect waste savings to reserves", "Set reserve auto-allocation"],
    });
  }

  // Debt pressure
  const debtToIncome = input.monthlyDebtPaymentCents / Math.max(input.monthlyIncomeCents, 1);
  if (debtToIncome > 0.36) {
    signals.push({
      id: mkId(), category: "debt-inflection", severity: debtToIncome > 0.5 ? "critical" : "high",
      title: "Debt-to-Income Pressure", description: `${(debtToIncome * 100).toFixed(0)}% of income goes to debt service`,
      timing: "Monthly", impactCents: input.monthlyDebtPaymentCents,
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Accelerate highest-interest debt", "Consider consolidation", "Review refinancing options"],
    });
  }

  // Cashflow fragility
  const netCashflow = input.monthlyIncomeCents - input.monthlyBurnCents;
  if (netCashflow < input.monthlyIncomeCents * 0.1) {
    signals.push({
      id: mkId(), category: "cashflow-fragility", severity: netCashflow <= 0 ? "critical" : "medium",
      title: "Cashflow Fragility", description: netCashflow <= 0 ? "Negative monthly cashflow" : `Only ${((netCashflow / input.monthlyIncomeCents) * 100).toFixed(0)}% margin`,
      timing: "Monthly", impactCents: Math.abs(netCashflow),
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Cut discretionary spending", "Increase income", "Eliminate waste subscriptions"],
    });
  }

  // Founder draw instability
  if (!input.founderDrawStable && input.founderDrawMonthlyCents > 0) {
    signals.push({
      id: mkId(), category: "founder-draw", severity: "medium",
      title: "Founder Draw Instability", description: "Owner draw amounts have been inconsistent — may indicate cash management risk",
      timing: "Ongoing", impactCents: input.founderDrawMonthlyCents,
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Stabilize monthly owner draw", "Build business operating reserve", "Separate personal/business cash"],
    });
  }

  // Tax shortfall
  if (input.taxReservedPct < 80) {
    signals.push({
      id: mkId(), category: "tax-shortfall", severity: input.taxReservedPct < 50 ? "high" : "medium",
      title: "Tax Reserve Gap", description: `Only ${input.taxReservedPct}% of estimated tax reserved`,
      timing: "Quarterly", impactCents: Math.round(input.taxOwedEstimateCents * (1 - input.taxReservedPct / 100)),
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Increase tax set-aside", "Review estimated payments", "Accelerate deductible expenses"],
    });
  }

  // Subscription creep
  if (input.subscriptionMonthlyCents > input.monthlyIncomeCents * 0.08) {
    signals.push({
      id: mkId(), category: "subscription-creep", severity: input.subscriptionMonthlyCents > input.monthlyIncomeCents * 0.12 ? "high" : "medium",
      title: "Subscription Creep", description: `Subscriptions are ${((input.subscriptionMonthlyCents / input.monthlyIncomeCents) * 100).toFixed(0)}% of income`,
      timing: "Monthly", impactCents: input.subscriptionMonthlyCents,
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Audit all subscriptions", "Cancel waste subscriptions", "Negotiate downgrades"],
    });
  }

  // Float reliance
  if (input.floatReliancePct > 15) {
    signals.push({
      id: mkId(), category: "float-reliance", severity: input.floatReliancePct > 30 ? "high" : "medium",
      title: "Float Reliance Risk", description: `${input.floatReliancePct}% of spending relies on timing float`,
      timing: "Ongoing", impactCents: Math.round(input.monthlyBurnCents * input.floatReliancePct / 100),
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Build cash buffer", "Align bill dates with income", "Reduce credit dependency"],
    });
  }

  // Utilization danger
  if (input.creditUtilizationPct > 30) {
    signals.push({
      id: mkId(), category: "utilization-danger", severity: input.creditUtilizationPct > 50 ? "critical" : "high",
      title: "Credit Utilization Warning", description: `${input.creditUtilizationPct}% utilization — score damage likely above 30%`,
      timing: "Now", impactCents: 0,
      windowStart: now.toISOString(), windowEnd: now.toISOString(),
      mitigations: ["Pay down card balances", "Request credit limit increase", "Redistribute spending across cards"],
    });
  }

  // Squeeze windows
  const squeezeWindows: StressRadarResult["squeezeWindows"] = [];
  let simBalance = input.cashBalanceCents;
  for (let d = 0; d < 60; d++) {
    const dayDate = new Date(now.getTime() + d * 86400000);
    const dateKey = dayDate.toISOString().slice(0, 10);
    const dayBills = input.upcomingBills.filter(b => b.dueDate.slice(0, 10) === dateKey);
    for (const bill of dayBills) simBalance -= bill.amountCents;
    if (d % 30 === 29) simBalance += input.monthlyIncomeCents;
    if (simBalance < 0) {
      squeezeWindows.push({
        start: dateKey, end: dateKey, shortfallCents: Math.abs(simBalance),
      });
    }
  }

  // Overall level
  const critCount = signals.filter(s => s.severity === "critical").length;
  const highCount = signals.filter(s => s.severity === "high").length;
  const overallStressLevel: StressSeverity =
    critCount > 0 ? "critical" : highCount >= 2 ? "high" : highCount >= 1 ? "medium" : "low";

  return { signals, overallStressLevel, squeezeWindows, billCollisions: collisions };
}
