// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Recurring Obligation Service
// Tracks and manages recurring payment patterns
// ═══════════════════════════════════════════════════════════════

import type { ObligationRecord } from "@/packages/finance-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface RecurringObligationSummary {
  totalMonthlyCommitmentCents: number;
  totalAnnualCommitmentCents: number;
  obligationCount: number;
  byFrequency: { frequency: string; count: number; monthlyCents: number }[];
  byCategory: { category: string; count: number; monthlyCents: number }[];
  autoPayCount: number;
  manualPayCount: number;
  generatedAt: string;
}

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


// ── Persistence ──────────────────────────────────────────
const _serviceId = "finance-os/recurring-obligation";

function _serializeState(): Record<string, unknown> {
  return {
    freqMap: Array.from(freqMap.entries()),
    catMap: Array.from(catMap.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.freqMap) { freqMap.clear(); (state.freqMap as any[]).forEach(([k, v]: any) => freqMap.set(k, v)); }
  if (state.catMap) { catMap.clear(); (state.catMap as any[]).forEach(([k, v]: any) => catMap.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}