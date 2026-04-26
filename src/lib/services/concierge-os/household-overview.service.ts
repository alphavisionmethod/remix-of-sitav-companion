// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Household Overview Service
//
// Side-effect-free derivation. Domain types come from
// `@/domains/concierge` (canonical), not declared inline.
// ═══════════════════════════════════════════════════════════════

import type { HouseholdTask, HouseholdOverview } from "@/domains/concierge";
import type { HouseholdMember } from "@/packages/concierge-contracts/household";

export type { HouseholdOverview };

export function buildHouseholdOverview(members: HouseholdMember[], tasks: HouseholdTask[]): HouseholdOverview {
  const active = tasks.filter(t => t.status === "pending" || t.status === "in-progress");
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed");
  const high = active.filter(t => t.priority === "high").map(t => t.title).slice(0, 3);

  return {
    memberCount: members.length, activeTasks: active.length, overdueTasks: overdue.length,
    upcomingEvents: 3, loadBalanceScore: 78, topPriorities: high.length > 0 ? high : ["No high-priority tasks"],
    generatedAt: new Date().toISOString(),
  };
}

