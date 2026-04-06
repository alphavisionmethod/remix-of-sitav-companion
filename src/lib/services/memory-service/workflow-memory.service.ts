import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Memory Service
// Stores workflow context for resume/retry
// ═══════════════════════════════════════════════════════════════

export interface WorkflowMemoryEntry {
  workflowId: string;
  runId: string;
  checkpoint: Record<string, unknown>;
  stepIndex: number;
  savedAt: string;
  reason: "pause" | "failure" | "checkpoint" | "timeout";
}

const workflowMemory = new Map<string, WorkflowMemoryEntry>();

export function saveWorkflowCheckpoint(entry: WorkflowMemoryEntry): void {
  workflowMemory.set(`${entry.workflowId}:${entry.runId}`, entry);
}

export function getWorkflowCheckpoint(workflowId: string, runId: string): WorkflowMemoryEntry | undefined {
  return workflowMemory.get(`${workflowId}:${runId}`);
}

export function getLatestCheckpoint(workflowId: string): WorkflowMemoryEntry | undefined {
  const entries = Array.from(workflowMemory.values())
    .filter((e) => e.workflowId === workflowId)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  return entries[0];
}

export function listWorkflowCheckpoints(workflowId?: string): WorkflowMemoryEntry[] {
  const all = Array.from(workflowMemory.values());
  return workflowId ? all.filter((e) => e.workflowId === workflowId) : all;
}

export function deleteWorkflowCheckpoint(workflowId: string, runId: string): boolean {
  return workflowMemory.delete(`${workflowId}:${runId}`);
}

export function pruneOldCheckpoints(maxAgeMs: number = 86400000 * 7): number {
  const cutoff = Date.now() - maxAgeMs;
  let count = 0;
  workflowMemory.forEach((entry, key) => {
    if (new Date(entry.savedAt).getTime() < cutoff) {
      workflowMemory.delete(key);
      count++;
    }
  });
  return count;
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "memory-service/workflow-memory";

function _serializeState(): Record<string, unknown> {
  return {
    workflowMemory: Array.from(workflowMemory.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.workflowMemory) { workflowMemory.clear(); (state.workflowMemory as any[]).forEach(([k, v]: any) => workflowMemory.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}