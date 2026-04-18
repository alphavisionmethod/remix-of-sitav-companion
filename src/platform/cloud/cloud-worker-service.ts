// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Worker Service
// Worker queue management, dead-letter, stats — real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface WorkerJob {
  id: string;
  job_type: string;
  status: string;
  priority: number;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error_message: string | null;
  attempts: number;
  max_attempts: number;
  dead_letter: boolean;
  user_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface WorkerQueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead_letter: number;
  throughput_per_hour: number;
}

class CloudWorkerService {
  private static instance: CloudWorkerService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudWorkerService();
    return this.instance;
  }

  async getQueueStats(): Promise<WorkerQueueStats> {
    try {
      const statuses = ["pending", "processing", "completed", "failed"];
      const results = await Promise.all(
        statuses.map(s => fromTable("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", s))
      );
      const { data: dl } = await fromTable("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("dead_letter", true);
      return {
        pending: results[0]?.count || 0,
        processing: results[1]?.count || 0,
        completed: results[2]?.count || 0,
        failed: results[3]?.count || 0,
        dead_letter: dl?.count || 0,
        throughput_per_hour: 0,
      };
    } catch {}
    return { pending: 12, processing: 3, completed: 847, failed: 5, dead_letter: 2, throughput_per_hour: 142 };
  }

  async getRecentJobs(limit = 20): Promise<WorkerJob[]> {
    try {
      const { data } = await fromTable("cloud_worker_jobs").select("*").order("created_at", { ascending: false }).limit(limit);
      if (data?.length) return data;
    } catch {}
    return this.getDemoJobs();
  }

  async getDeadLetterJobs(): Promise<WorkerJob[]> {
    try {
      const { data } = await fromTable("cloud_worker_jobs").select("*").eq("dead_letter", true).order("created_at", { ascending: false });
      if (data?.length) return data;
    } catch {}
    return [];
  }

  getDemoJobs(): WorkerJob[] {
    const types = ["preview_gen", "reconciliation", "archive_migration", "checksum_verify", "quota_reconcile", "search_index"];
    return types.map((t, i) => ({
      id: `demo-wj-${i}`, job_type: t, status: i < 2 ? "processing" : "completed",
      priority: 5 - i, payload: {}, result: null, error_message: null,
      attempts: 1, max_attempts: 3, dead_letter: false, user_id: null,
      created_at: new Date(Date.now() - i * 60000).toISOString(),
      started_at: new Date(Date.now() - i * 50000).toISOString(),
      completed_at: i >= 2 ? new Date(Date.now() - i * 30000).toISOString() : null,
    }));
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: "text-amber-400", processing: "text-blue-400",
      completed: "text-emerald-400", failed: "text-red-400", dead_letter: "text-red-500",
    };
    return map[status] || "text-muted-foreground";
  }
}

export const cloudWorkerService = CloudWorkerService.getInstance();
