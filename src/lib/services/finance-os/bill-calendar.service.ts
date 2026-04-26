// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Bill Calendar Service
// ═══════════════════════════════════════════════════════════════

import type { ObligationRecord } from "@/packages/finance-contracts";

import type { BillCalendarDay, BillCalendarMonth } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { BillCalendarDay, BillCalendarMonth };

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

