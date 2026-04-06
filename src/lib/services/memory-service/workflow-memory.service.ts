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
