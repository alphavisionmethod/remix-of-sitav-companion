// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: School Items Service
// Domain types imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { SchoolItem } from "@/domains/concierge";

export type { SchoolItem };

export function getUpcomingSchoolItems(items: SchoolItem[], daysAhead: number = 7): SchoolItem[] {
  const cutoff = Date.now() + daysAhead * 86400000;
  return items.filter(i => !i.completed && new Date(i.dueDate).getTime() <= cutoff).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function groupByChild(items: SchoolItem[]): Record<string, SchoolItem[]> {
  return items.reduce((acc, i) => { (acc[i.childId] = acc[i.childId] || []).push(i); return acc; }, {} as Record<string, SchoolItem[]>);
}

