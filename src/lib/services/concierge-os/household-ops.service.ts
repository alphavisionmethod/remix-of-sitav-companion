// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Household Operations Service
// ═══════════════════════════════════════════════════════════════

import type { HouseholdTask } from "@/packages/concierge-contracts";
import type { HouseholdMember, HouseholdKpiSummary } from "@/packages/concierge-contracts/household";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export function computeHouseholdKpis(members: HouseholdMember[], tasks: HouseholdTask[]): HouseholdKpiSummary {
  const activeTasks = tasks.filter(t => t.status === "pending" || t.status === "in-progress");
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100;

  const memberLoads = members.map(m => {
    const memberTasks = activeTasks.filter(t => t.assignedTo === m.id);
    return {
      memberId: m.id,
      name: `${m.firstName} ${m.lastName}`,
      taskCount: memberTasks.length,
      hoursEstimated: memberTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30) / 60, 0),
    };
  });

  const avgLoad = memberLoads.length > 0 ? memberLoads.reduce((sum, m) => sum + m.taskCount, 0) / memberLoads.length : 0;
  const maxLoad = Math.max(...memberLoads.map(m => m.taskCount), 1);
  const loadBalanceScore = avgLoad > 0 ? Math.round((1 - (maxLoad - avgLoad) / maxLoad) * 100) : 100;

  const topContributor = memberLoads.sort((a, b) => b.taskCount - a.taskCount)[0]?.name || "N/A";

  return {
    totalMembers: members.length,
    activeTasks: activeTasks.length,
    overdueTaskCount: overdueTasks.length,
    taskCompletionRate: completionRate,
    loadBalanceScore,
    upcomingObligations: 0,
    weeklyBusyScore: Math.min(100, activeTasks.length * 10),
    topContributor,
    memberLoadDistribution: memberLoads,
    generatedAt: new Date().toISOString(),
  };
}

export function balanceLoad(tasks: HouseholdTask[], members: HouseholdMember[]): HouseholdTask[] {
  const unassigned = tasks.filter(t => !t.assignedTo && t.status === "pending");
  const memberTaskCounts = new Map<string, number>();
  const adultMembers = members.filter(m => !m.isMinor);

  for (const m of adultMembers) {
    memberTaskCounts.set(m.id, tasks.filter(t => t.assignedTo === m.id && t.status !== "completed").length);
  }

  for (const task of unassigned) {
    const leastBusy = adultMembers.sort((a, b) => (memberTaskCounts.get(a.id) || 0) - (memberTaskCounts.get(b.id) || 0))[0];
    if (leastBusy) {
      task.assignedTo = leastBusy.id;
      memberTaskCounts.set(leastBusy.id, (memberTaskCounts.get(leastBusy.id) || 0) + 1);
    }
  }

  return tasks;
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "concierge-os/household-ops";

function _serializeState(): Record<string, unknown> {
  return {
    memberTaskCounts: Array.from(memberTaskCounts.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.memberTaskCounts) { memberTaskCounts.clear(); (state.memberTaskCounts as any[]).forEach(([k, v]: any) => memberTaskCounts.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}