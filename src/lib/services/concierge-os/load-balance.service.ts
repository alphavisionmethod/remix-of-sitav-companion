// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Load Balance Service
// Domain types imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { HouseholdTask, LoadReport } from "@/domains/concierge";
import type { HouseholdMember } from "@/packages/concierge-contracts/household";

export type { LoadReport };

export function analyzeLoad(members: HouseholdMember[], tasks: HouseholdTask[]): LoadReport[] {
  const active = tasks.filter(t => t.status !== "completed");
  return members.map(m => {
    const mine = active.filter(t => t.assignedTo === m.id);
    const hours = mine.reduce((s, t) => s + (t.estimatedMinutes || 30), 0) / 60;
    return { memberId: m.id, name: `${m.firstName} ${m.lastName}`, taskCount: mine.length, hours: Math.round(hours * 10) / 10, overloaded: hours > 8 };
  });
}

export function suggestRebalance(reports: LoadReport[]): { from: string; to: string; reason: string }[] {
  const sorted = reports.sort((a, b) => b.hours - a.hours);
  if (sorted.length < 2) return [];
  const most = sorted[0], least = sorted[sorted.length - 1];
  if (most.hours - least.hours < 2) return [];
  return [{ from: most.name, to: least.name, reason: `${most.name} has ${most.hours}h vs ${least.name}'s ${least.hours}h` }];
}

