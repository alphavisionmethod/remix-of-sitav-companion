// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Prep Derivation Service
// Auto-derive prep tasks from calendar events
// ═══════════════════════════════════════════════════════════════

import type { HouseholdTask } from "@/packages/concierge-contracts";
import type { CalendarEvent } from "./reconciliation.service";

export function derivePrepTasks(events: CalendarEvent[]): HouseholdTask[] {
  return events.map((e, i) => ({
    id: `prep-${e.id}`, title: `Prepare for: ${e.title}`, description: `Prep task auto-derived from calendar event`,
    category: "admin" as const, assignedTo: e.attendees[0], dueDate: new Date(new Date(e.start).getTime() - 3600000).toISOString(),
    priority: "medium" as const, status: "pending" as const, estimatedMinutes: 15, dependencies: [], tags: ["auto-derived"],
  }));
}
