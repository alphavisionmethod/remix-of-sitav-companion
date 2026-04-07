// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Calendar Reconciliation Service
// ═══════════════════════════════════════════════════════════════

export interface CalendarEvent { id: string; title: string; start: string; end: string; calendar: string; attendees: string[]; }
export interface ReconciliationResult { totalEvents: number; conflicts: CalendarConflict[]; gaps: { date: string; hours: number }[]; }
export interface CalendarConflict { eventA: CalendarEvent; eventB: CalendarEvent; overlapMinutes: number; }

export function reconcileCalendars(events: CalendarEvent[]): ReconciliationResult {
  const sorted = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const conflicts: CalendarConflict[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const endA = new Date(sorted[i].end).getTime();
    const startB = new Date(sorted[i + 1].start).getTime();
    if (endA > startB) {
      conflicts.push({ eventA: sorted[i], eventB: sorted[i + 1], overlapMinutes: Math.round((endA - startB) / 60000) });
    }
  }
  return { totalEvents: events.length, conflicts, gaps: [] };
}

