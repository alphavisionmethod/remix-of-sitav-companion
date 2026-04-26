// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Calendar Reconciliation Service
//
// Lightweight pair-overlap detection. Domain types imported from
// `@/domains/concierge` (canonical). The persistent richer
// `CalendarConflict` entity from `@/packages/concierge-contracts`
// is intentionally distinct from these derived view types.
//
// Legacy aliases (`CalendarEvent`, `CalendarConflict`,
// `ReconciliationResult`) are preserved as re-exports for
// backwards compatibility but new code SHOULD use the canonical
// names from `@/domains/concierge`:
//   - LocalCalendarEvent
//   - CalendarOverlapPair
//   - CalendarReconciliationReport
// ═══════════════════════════════════════════════════════════════

import type {
  LocalCalendarEvent,
  CalendarOverlapPair,
  CalendarReconciliationReport,
} from "@/domains/concierge";

export type {
  LocalCalendarEvent,
  CalendarOverlapPair,
  CalendarReconciliationReport,
};

/** @deprecated Use `LocalCalendarEvent` from `@/domains/concierge`. */
export type CalendarEvent = LocalCalendarEvent;
/** @deprecated Use `CalendarOverlapPair` from `@/domains/concierge`. */
export type CalendarConflict = CalendarOverlapPair;
/** @deprecated Use `CalendarReconciliationReport` from `@/domains/concierge`. */
export type ReconciliationResult = CalendarReconciliationReport;

export function reconcileCalendars(events: LocalCalendarEvent[]): CalendarReconciliationReport {
  const sorted = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const conflicts: CalendarOverlapPair[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const endA = new Date(sorted[i].end).getTime();
    const startB = new Date(sorted[i + 1].start).getTime();
    if (endA > startB) {
      conflicts.push({ eventA: sorted[i], eventB: sorted[i + 1], overlapMinutes: Math.round((endA - startB) / 60000) });
    }
  }
  return { totalEvents: events.length, conflicts, gaps: [] };
}

