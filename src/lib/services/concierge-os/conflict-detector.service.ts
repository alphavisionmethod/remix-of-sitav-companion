// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Conflict Detector Service
// ═══════════════════════════════════════════════════════════════

import type { CalendarEvent, CalendarConflict } from "./reconciliation.service";

export interface ConflictResolution { conflict: CalendarConflict; suggestion: string; autoResolvable: boolean; }

export function detectConflicts(events: CalendarEvent[]): CalendarConflict[] {
  const sorted = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const conflicts: CalendarConflict[] = [];
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

export function suggestResolutions(conflicts: CalendarConflict[]): ConflictResolution[] {
  return conflicts.map(c => ({
    conflict: c,
    suggestion: c.overlapMinutes < 15 ? "Adjust start time by 15 min" : `Reschedule "${c.eventB.title}" to next available slot`,
    autoResolvable: c.overlapMinutes < 15,
  }));
}

