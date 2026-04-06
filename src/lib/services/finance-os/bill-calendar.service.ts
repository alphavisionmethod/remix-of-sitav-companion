// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Bill Calendar Service
// ═══════════════════════════════════════════════════════════════

import type { ObligationRecord } from "@/packages/finance-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface BillCalendarDay {
  date: string;
  obligations: ObligationRecord[];
  totalDueCents: number;
}

export interface BillCalendarMonth {
  month: string;
  days: BillCalendarDay[];
  totalDueCents: number;
  obligationCount: number;
}

export function buildBillCalendar(obligations: ObligationRecord[], monthsAhead: number = 3): BillCalendarMonth[] {
  const months: BillCalendarMonth[] = [];
  const now = new Date();

  for (let m = 0; m < monthsAhead; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const monthStr = monthDate.toISOString().slice(0, 7);
    const daysMap = new Map<string, ObligationRecord[]>();

    for (const obl of obligations) {
      const dueDate = new Date(obl.nextDueDate);
      if (dueDate.toISOString().slice(0, 7) === monthStr) {
        const dayStr = dueDate.toISOString().slice(0, 10);
        const list = daysMap.get(dayStr) || [];
        list.push(obl);
        daysMap.set(dayStr, list);
      }
    }

    const days = Array.from(daysMap.entries()).map(([date, obls]) => ({
      date,
      obligations: obls,
      totalDueCents: obls.reduce((s, o) => s + o.amountCents, 0),
    })).sort((a, b) => a.date.localeCompare(b.date));

    months.push({
      month: monthStr,
      days,
      totalDueCents: days.reduce((s, d) => s + d.totalDueCents, 0),
      obligationCount: days.reduce((s, d) => s + d.obligations.length, 0),
    });
  }

  return months;
}

export function getNextDueBills(obligations: ObligationRecord[], count: number = 5): ObligationRecord[] {
  const now = Date.now();
  return obligations
    .filter(o => o.status === "upcoming" || o.status === "due")
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, count);
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "finance-os/bill-calendar";

function _serializeState(): Record<string, unknown> {
  return {
    daysMap: Array.from(daysMap.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.daysMap) { daysMap.clear(); (state.daysMap as any[]).forEach(([k, v]: any) => daysMap.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}