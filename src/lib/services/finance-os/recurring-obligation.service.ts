// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Recurring Obligation Service
// Tracks and manages recurring payment patterns
// ═══════════════════════════════════════════════════════════════

import type { ObligationRecord } from "@/packages/finance-contracts";

import type { RecurringObligationSummary } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { RecurringObligationSummary };

function toMonthlyCents(obl: ObligationRecord): number {
  switch (obl.frequency) {
    case "weekly": return obl.amountCents * 4.33;
    case "biweekly": return obl.amountCents * 2.17;
    case "monthly": return obl.amountCents;
    case "quarterly": return obl.amountCents / 3;
    case "annually": return obl.amountCents / 12;
    case "one-time": return 0;
    default: return obl.amountCents;
  }
}

export function summarizeRecurringObligations(obligations: ObligationRecord[]): RecurringObligationSummary {
  const recurring = obligations.filter(o => o.frequency !== "one-time");
  const freqMap = new Map<string, { count: number; monthlyCents: number }>();
  const catMap = new Map<string, { count: number; monthlyCents: number }>();

  for (const o of recurring) {
    const monthly = Math.round(toMonthlyCents(o));
    const fEntry = freqMap.get(o.frequency) || { count: 0, monthlyCents: 0 };
    fEntry.count++; fEntry.monthlyCents += monthly;
    freqMap.set(o.frequency, fEntry);

    const cEntry = catMap.get(o.category) || { count: 0, monthlyCents: 0 };
    cEntry.count++; cEntry.monthlyCents += monthly;
    catMap.set(o.category, cEntry);
  }

  const totalMonthly = recurring.reduce((s, o) => s + Math.round(toMonthlyCents(o)), 0);

  return {
    totalMonthlyCommitmentCents: totalMonthly,
    totalAnnualCommitmentCents: totalMonthly * 12,
    obligationCount: recurring.length,
    byFrequency: Array.from(freqMap.entries()).map(([frequency, d]) => ({ frequency, ...d })),
    byCategory: Array.from(catMap.entries()).map(([category, d]) => ({ category, ...d })).sort((a, b) => b.monthlyCents - a.monthlyCents),
    autoPayCount: recurring.filter(o => o.autoPay).length,
    manualPayCount: recurring.filter(o => !o.autoPay).length,
    generatedAt: new Date().toISOString(),
  };
}

