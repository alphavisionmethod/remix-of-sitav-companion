// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Conflict Detector Service
// Domain types imported from `@/domains/concierge` (canonical).
//
// Note: `ConflictResolution` here is the lightweight overlap
// resolution suggestion produced by this service. To avoid a
// name clash with cross-cutting `ConflictResolution` shapes used
// elsewhere (sync engine, advisor policies), the canonical name
// in the domain layer is `OverlapResolutionSuggestion`. The
// legacy `ConflictResolution` alias is preserved for
// backwards compatibility.
// ═══════════════════════════════════════════════════════════════

import type {
  LocalCalendarEvent,
  CalendarOverlapPair,
  OverlapResolutionSuggestion,
} from "@/domains/concierge";

export type { OverlapResolutionSuggestion };
/** @deprecated Use `OverlapResolutionSuggestion` from `@/domains/concierge`. */
export type ConflictResolution = OverlapResolutionSuggestion;

export function detectConflicts(events: LocalCalendarEvent[]): CalendarOverlapPair[] {
  const sorted = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const conflicts: CalendarOverlapPair[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const endA = new Date(sorted[i].end).getTime();
      const startB = new Date(sorted[j].start).getTime();
      if (endA <= startB) break;
      conflicts.push({ eventA: sorted[i], eventB: sorted[j], overlapMinutes: Math.round((endA - startB) / 60000) });
    }
  }
  return conflicts;
}

export function suggestResolutions(conflicts: CalendarOverlapPair[]): OverlapResolutionSuggestion[] {
  return conflicts.map(c => ({
    conflict: c,
    suggestion: c.overlapMinutes < 15 ? "Adjust start time by 15 min" : `Reschedule "${c.eventB.title}" to next available slot`,
    autoResolvable: c.overlapMinutes < 15,
  }));
}

