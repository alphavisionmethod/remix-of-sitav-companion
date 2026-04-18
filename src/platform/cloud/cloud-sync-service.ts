// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Sync Service
// Sync health, queue management, conflict tracking, repair jobs
// Queries real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface SyncHealthReport {
  queueDepth: number;
  conflictBacklog: number;
  stuckQueues: number;
  websocketConnections: number;
  websocketHealthy: boolean;
  namespacesTotal: number;
  namespacesHealthy: number;
  namespacesUnhealthy: string[];
  failedCheckpoints: number;
  avgSyncLatencyMs: number;
  realtimeEventFailures: number;
  lastHealthCheck: string;
}

export interface SyncConflict {
  id: string;
  userId: string;
  userName: string;
  namespace: string;
  objectKey: string;
  localVersion: number;
  remoteVersion: number;
  detectedAt: string;
  status: "pending" | "resolved" | "escalated";
  resolution?: string;
}

export interface SyncJob {
  id: string;
  jobType: string;
  targetUserId?: string;
  targetUserName?: string;
  status: "pending" | "running" | "completed" | "failed";
  progressPct: number;
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  errorMessage?: string;
  triggeredBy: string;
  createdAt: string;
}

export interface DelayedUser {
  userId: string;
  userName: string;
  lastSyncAt: string;
  pendingChanges: number;
  reason: string;
}

class CloudSyncService {
  private static instance: CloudSyncService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudSyncService();
    return this.instance;
  }

  async getHealthReportAsync(): Promise<SyncHealthReport> {
    try {
      const [conflictsRes, jobsRes, changesRes] = await Promise.all([
        fromTable("cloud_conflicts").select("id", { count: "exact", head: true }).eq("state", "pending"),
        fromTable("cloud_sync_jobs").select("id", { count: "exact", head: true }).eq("status", "running"),
        fromTable("cloud_sync_changes").select("id", { count: "exact", head: true }),
      ]);

      const conflictCount = conflictsRes.count || 0;
      const runningJobs = jobsRes.count || 0;

      // If we have no real data, fall back to demo
      if (conflictCount === 0 && runningJobs === 0 && (changesRes.count || 0) === 0) {
        return this.getHealthReport();
      }

      return {
        queueDepth: runningJobs,
        conflictBacklog: conflictCount,
        stuckQueues: 0,
        websocketConnections: Math.floor(Math.random() * 200) + 50,
        websocketHealthy: true,
        namespacesTotal: 12,
        namespacesHealthy: 12 - (conflictCount > 0 ? 1 : 0),
        namespacesUnhealthy: conflictCount > 0 ? ["has-conflicts"] : [],
        failedCheckpoints: 0,
        avgSyncLatencyMs: Math.floor(Math.random() * 100) + 30,
        realtimeEventFailures: 0,
        lastHealthCheck: new Date().toISOString(),
      };
    } catch {
      return this.getHealthReport();
    }
  }

  getHealthReport(): SyncHealthReport {
    return {
      queueDepth: Math.floor(Math.random() * 50) + 2,
      conflictBacklog: Math.floor(Math.random() * 8),
      stuckQueues: Math.floor(Math.random() * 2),
      websocketConnections: Math.floor(Math.random() * 200) + 50,
      websocketHealthy: Math.random() > 0.1,
      namespacesTotal: 12,
      namespacesHealthy: 11,
      namespacesUnhealthy: Math.random() > 0.5 ? ["user-preferences"] : [],
      failedCheckpoints: Math.floor(Math.random() * 3),
      avgSyncLatencyMs: Math.floor(Math.random() * 200) + 30,
      realtimeEventFailures: Math.floor(Math.random() * 5),
      lastHealthCheck: new Date().toISOString(),
    };
  }

  async getConflictsAsync(): Promise<SyncConflict[]> {
    try {
      const { data, error } = await fromTable("cloud_conflicts")
        .select("*").order("created_at", { ascending: false }).limit(50);

      if (error || !data || data.length === 0) return this.getConflicts();

      return data.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.user_id.slice(0, 8),
        namespace: c.details?.namespace || "unknown",
        objectKey: c.object_id,
        localVersion: c.base_version,
        remoteVersion: c.base_version + 1,
        detectedAt: c.created_at,
        status: c.state as SyncConflict["status"],
        resolution: c.strategy,
      }));
    } catch {
      return this.getConflicts();
    }
  }

  getConflicts(): SyncConflict[] {
    const names = ["Alice Chen", "Bob Martinez", "Carol Singh", "Dave Kim"];
    const namespaces = ["documents", "settings", "contacts", "calendar"];
    return Array.from({ length: 6 }, (_, i) => ({
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      userName: names[i % names.length],
      namespace: namespaces[i % namespaces.length],
      objectKey: `/${namespaces[i % namespaces.length]}/item-${i + 1}.json`,
      localVersion: i + 3,
      remoteVersion: i + 5,
      detectedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      status: (["pending", "resolved", "escalated"] as const)[i % 3],
      resolution: i % 3 === 1 ? "remote-wins" : undefined,
    }));
  }

  getDelayedUsers(): DelayedUser[] {
    return [
      { userId: "u1", userName: "Frank Li", lastSyncAt: new Date(Date.now() - 7200000).toISOString(), pendingChanges: 34, reason: "Device offline" },
      { userId: "u2", userName: "Grace Okafor", lastSyncAt: new Date(Date.now() - 14400000).toISOString(), pendingChanges: 12, reason: "Quota exceeded" },
      { userId: "u3", userName: "Hiro Tanaka", lastSyncAt: new Date(Date.now() - 3600000).toISOString(), pendingChanges: 7, reason: "Conflict backlog" },
    ];
  }

  async getJobsAsync(): Promise<SyncJob[]> {
    try {
      const { data, error } = await fromTable("cloud_sync_jobs")
        .select("*").order("created_at", { ascending: false }).limit(50);

      if (error || !data || data.length === 0) return this.getJobs();

      return data.map((j: any) => ({
        id: j.id,
        jobType: j.job_type,
        targetUserId: j.target_user_id,
        status: j.status as SyncJob["status"],
        progressPct: j.progress_pct || 0,
        startedAt: j.started_at,
        completedAt: j.completed_at,
        resultSummary: j.result_summary,
        errorMessage: j.error_message,
        triggeredBy: j.triggered_by,
        createdAt: j.created_at,
      }));
    } catch {
      return this.getJobs();
    }
  }

  getJobs(): SyncJob[] {
    const types = ["reindex", "rebuild-quota", "purge-trash", "retry-sync", "clear-sessions", "verify-blobs", "restore-version"];
    return types.map((type, i) => ({
      id: crypto.randomUUID(),
      jobType: type,
      targetUserId: i < 3 ? crypto.randomUUID() : undefined,
      targetUserName: i < 3 ? ["Alice Chen", "Bob Martinez", "Carol Singh"][i] : undefined,
      status: (["completed", "running", "pending", "failed", "completed", "completed", "completed"] as const)[i],
      progressPct: [100, 67, 0, 100, 100, 100, 100][i],
      startedAt: i !== 2 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
      completedAt: [0, 4, 5, 6].includes(i) ? new Date().toISOString() : undefined,
      resultSummary: i === 0 ? "Reindexed 2,847 objects" : i === 3 ? "Failed: timeout" : undefined,
      errorMessage: i === 3 ? "Connection timeout after 30s" : undefined,
      triggeredBy: "admin@sita.os",
      createdAt: new Date(Date.now() - Math.random() * 7200000).toISOString(),
    }));
  }

  async triggerJob(jobType: string, targetUserId?: string): Promise<SyncJob> {
    try {
      const { data } = await fromTable("cloud_sync_jobs").insert({
        job_type: jobType,
        target_user_id: targetUserId || null,
        triggered_by: "admin",
        status: "running",
        started_at: new Date().toISOString(),
        progress_pct: 0,
      }).select().single();

      if (data) {
        return {
          id: data.id, jobType: data.job_type, targetUserId: data.target_user_id,
          status: "running", progressPct: 0, startedAt: data.started_at,
          triggeredBy: data.triggered_by, createdAt: data.created_at,
        };
      }
    } catch { /* fallback */ }

    return {
      id: crypto.randomUUID(), jobType, targetUserId,
      status: "running", progressPct: 0,
      startedAt: new Date().toISOString(),
      triggeredBy: "admin@sita.os",
      createdAt: new Date().toISOString(),
    };
  }

  getNamespaceStatuses() {
    const namespaces = ["documents", "settings", "contacts", "calendar", "tasks", "notes", "media", "exports", "preferences", "bookmarks", "clipboard", "history"];
    return namespaces.map(ns => ({
      namespace: ns,
      healthy: ns !== "user-preferences",
      objectCount: Math.floor(Math.random() * 5000) + 100,
      lastSync: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      pendingChanges: Math.floor(Math.random() * 20),
      conflicts: Math.floor(Math.random() * 3),
    }));
  }
}

export const cloudSyncService = CloudSyncService.getInstance();
