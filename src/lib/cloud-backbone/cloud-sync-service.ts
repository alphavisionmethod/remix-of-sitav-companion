// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Sync Service
// Sync health, queue management, conflict tracking, repair jobs
// ═══════════════════════════════════════════════════════════════

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
    await new Promise(r => setTimeout(r, 800));
    return {
      id: crypto.randomUUID(),
      jobType,
      targetUserId,
      status: "running",
      progressPct: 0,
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
