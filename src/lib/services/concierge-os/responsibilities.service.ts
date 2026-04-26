// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Responsibilities Service
// Domain types imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { HouseholdTask, ResponsibilityAssignment } from "@/domains/concierge";

export type { ResponsibilityAssignment };

export function assignResponsibilities(tasks: HouseholdTask[], memberMap: Record<string, string>): ResponsibilityAssignment[] {
  const assignments = new Map<string, HouseholdTask[]>();
  for (const t of tasks) {
    const key = t.assignedTo || "unassigned";
    const list = assignments.get(key) || [];
    list.push(t);
    assignments.set(key, list);
  }
  return Array.from(assignments.entries()).map(([id, ts]) => ({
    memberId: id, memberName: memberMap[id] || id,
    tasks: ts, totalMinutes: ts.reduce((s, t) => s + (t.estimatedMinutes || 30), 0),
  }));
}

