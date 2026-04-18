// ═══════════════════════════════════════════════════════════════
// SITA OS — Background Job Engine
// Unified queue, retry backoff, dead-letter, dependency ordering
// ═══════════════════════════════════════════════════════════════

export type JobType = "upload" | "download" | "hydration" | "conflict" | "reindex" | "key-rotation" | "re-auth" | "cleanup" | "export" | "deletion";
export type JobStatus = "queued" | "active" | "completed" | "failed" | "retrying" | "dead-letter" | "cancelled" | "blocked";

export interface SyncJobEntry {
  id: string; type: JobType; status: JobStatus; priority: number;
  payload: Record<string, unknown>; createdAt: string; startedAt?: string;
  completedAt?: string; attempts: number; maxAttempts: number;
  nextRetryAt?: string; error?: string; dependsOn?: string[];
  cancellable: boolean; networkRequired: boolean; powerRequired: boolean;
}

export interface JobEngineStats {
  queued: number; active: number; completed: number; failed: number;
  deadLetter: number; totalProcessed: number; avgDurationMs: number;
  byType: Record<string, number>;
}

class JobEngine {
  private jobs = new Map<string, SyncJobEntry>();
  private completedCount = 0;
  private totalDurationMs = 0;

  enqueue(type: JobType, payload: Record<string, unknown>, opts: { priority?: number; dependsOn?: string[]; networkRequired?: boolean; powerRequired?: boolean; maxAttempts?: number } = {}): SyncJobEntry {
    const job: SyncJobEntry = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type, status: "queued", priority: opts.priority ?? 5,
      payload, createdAt: new Date().toISOString(),
      attempts: 0, maxAttempts: opts.maxAttempts ?? 5,
      dependsOn: opts.dependsOn, cancellable: true,
      networkRequired: opts.networkRequired ?? true,
      powerRequired: opts.powerRequired ?? false,
    };
    // Check dependencies
    if (job.dependsOn?.length) {
      const blocked = job.dependsOn.some(id => {
        const dep = this.jobs.get(id);
        return dep && dep.status !== "completed";
      });
      if (blocked) job.status = "blocked";
    }
    this.jobs.set(job.id, job);
    return job;
  }

  dequeue(networkAvailable = true, powerAvailable = true): SyncJobEntry | null {
    const candidates = Array.from(this.jobs.values())
      .filter(j => j.status === "queued" || j.status === "retrying")
      .filter(j => !j.networkRequired || networkAvailable)
      .filter(j => !j.powerRequired || powerAvailable)
      .filter(j => !j.nextRetryAt || new Date(j.nextRetryAt).getTime() <= Date.now())
      .sort((a, b) => a.priority - b.priority);
    const job = candidates[0];
    if (job) { job.status = "active"; job.startedAt = new Date().toISOString(); job.attempts++; }
    return job ?? null;
  }

  complete(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "completed";
      job.completedAt = new Date().toISOString();
      if (job.startedAt) this.totalDurationMs += Date.now() - new Date(job.startedAt).getTime();
      this.completedCount++;
      this.unblockDependents(jobId);
    }
  }

  fail(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.error = error;
    if (job.attempts >= job.maxAttempts) {
      job.status = "dead-letter";
    } else {
      job.status = "retrying";
      const delay = Math.min(300000, 1000 * Math.pow(2, job.attempts));
      job.nextRetryAt = new Date(Date.now() + delay).toISOString();
    }
  }

  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.cancellable && job.status !== "completed") { job.status = "cancelled"; return true; }
    return false;
  }

  retryDeadLetter(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === "dead-letter") { job.status = "queued"; job.attempts = 0; job.error = undefined; return true; }
    return false;
  }

  getJobs(status?: JobStatus, type?: JobType): SyncJobEntry[] {
    let results = Array.from(this.jobs.values());
    if (status) results = results.filter(j => j.status === status);
    if (type) results = results.filter(j => j.type === type);
    return results.sort((a, b) => a.priority - b.priority);
  }

  getDeadLetterJobs(): SyncJobEntry[] { return this.getJobs("dead-letter"); }

  detectStuck(thresholdMs = 300000): SyncJobEntry[] {
    return Array.from(this.jobs.values()).filter(j =>
      j.status === "active" && j.startedAt && Date.now() - new Date(j.startedAt).getTime() > thresholdMs
    );
  }

  cleanup(olderThanMs = 86400000): number {
    let count = 0;
    for (const [id, job] of this.jobs) {
      if ((job.status === "completed" || job.status === "cancelled") && job.completedAt && Date.now() - new Date(job.completedAt).getTime() > olderThanMs) {
        this.jobs.delete(id); count++;
      }
    }
    return count;
  }

  getStats(): JobEngineStats {
    const byType: Record<string, number> = {};
    let queued = 0, active = 0, completed = 0, failed = 0, deadLetter = 0;
    for (const j of this.jobs.values()) {
      byType[j.type] = (byType[j.type] ?? 0) + 1;
      if (j.status === "queued") queued++;
      else if (j.status === "active") active++;
      else if (j.status === "completed") completed++;
      else if (j.status === "failed") failed++;
      else if (j.status === "dead-letter") deadLetter++;
    }
    return { queued, active, completed, failed, deadLetter, totalProcessed: this.completedCount, avgDurationMs: this.completedCount > 0 ? Math.round(this.totalDurationMs / this.completedCount) : 0, byType };
  }

  private unblockDependents(completedJobId: string): void {
    for (const job of this.jobs.values()) {
      if (job.status === "blocked" && job.dependsOn) {
        const allDone = job.dependsOn.every(id => { const d = this.jobs.get(id); return !d || d.status === "completed"; });
        if (allDone) job.status = "queued";
      }
    }
  }
}

export const jobEngine = new JobEngine();
