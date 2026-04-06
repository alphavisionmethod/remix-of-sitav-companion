// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Responsibilities Service
// ═══════════════════════════════════════════════════════════════

import type { HouseholdTask } from "@/packages/concierge-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface ResponsibilityAssignment { memberId: string; memberName: string; tasks: HouseholdTask[]; totalMinutes: number; }

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


// ── Persistence ──────────────────────────────────────────
const _serviceId = "concierge-os/responsibilities";

function _serializeState(): Record<string, unknown> {
  return {
    assignments: Array.from(assignments.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.assignments) { assignments.clear(); (state.assignments as any[]).forEach(([k, v]: any) => assignments.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}