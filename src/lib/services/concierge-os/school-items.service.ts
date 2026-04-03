// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: School Items Service
// ═══════════════════════════════════════════════════════════════

export interface SchoolItem { id: string; childId: string; title: string; dueDate: string; type: "assignment" | "event" | "supply" | "form"; completed: boolean; }

export function getUpcomingSchoolItems(items: SchoolItem[], daysAhead: number = 7): SchoolItem[] {
  const cutoff = Date.now() + daysAhead * 86400000;
  return items.filter(i => !i.completed && new Date(i.dueDate).getTime() <= cutoff).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function groupByChild(items: SchoolItem[]): Record<string, SchoolItem[]> {
  return items.reduce((acc, i) => { (acc[i.childId] = acc[i.childId] || []).push(i); return acc; }, {} as Record<string, SchoolItem[]>);
}
