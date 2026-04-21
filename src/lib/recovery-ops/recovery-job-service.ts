// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Job Service
// Manages background job lifecycle with polling support
// ═══════════════════════════════════════════════════════════════

import type { RecoveryJob, RecoveryActionType, RecoveryJobStatus } from "./types";

// In-memory job store (production would use DB table)
const jobStore = new Map<string, RecoveryJob>();

let nextId = 1;

export function createRecoveryJob(
  actionType: RecoveryActionType,
  label: string,
  operatorId: string,
  isDryRun: boolean,
  parameters: Record<string, unknown> = {}
): RecoveryJob {
  const id = `RJ-${String(nextId++).padStart(4, "0")}`;
  const job: RecoveryJob = {
    id,
    actionType,
    label,
    status: "pending",
    progress: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    error: null,
    operatorId,
    isDryRun,
    parameters,
    result: null,
  };
  jobStore.set(id, job);

  // Simulate async execution
  simulateJobExecution(id);
  return job;
}

function simulateJobExecution(jobId: string) {
  const job = jobStore.get(jobId);
  if (!job) return;

  job.status = "running";
  const totalSteps = 5 + Math.floor(Math.random() * 5);
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const j = jobStore.get(jobId);
    if (!j || j.status === "cancelled") {
      clearInterval(interval);
      return;
    }
    j.progress = Math.min(Math.round((step / totalSteps) * 100), 100);

    if (step >= totalSteps) {
      clearInterval(interval);
      // 90% success rate for simulation
      const success = Math.random() > 0.1;
      j.status = success ? "completed" : "failed";
      j.progress = success ? 100 : j.progress;
      j.completedAt = new Date().toISOString();
      j.error = success ? null : "Simulated failure: downstream service timeout";
      j.result = success
        ? { itemsProcessed: Math.floor(Math.random() * 50) + 1, dryRun: j.isDryRun }
        : null;
    }
  }, 800);
}

export function getJob(jobId: string): RecoveryJob | undefined {
  return jobStore.get(jobId);
}

export function getAllJobs(): RecoveryJob[] {
  return Array.from(jobStore.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export function cancelJob(jobId: string): boolean {
  const job = jobStore.get(jobId);
  if (!job || job.status !== "running") return false;
  job.status = "cancelled";
  job.completedAt = new Date().toISOString();
  return true;
}