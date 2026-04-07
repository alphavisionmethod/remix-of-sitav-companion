// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Device Runtime Service
// Manages edge agents: heartbeat, local execution, sync state
// Distinct from TrustedDeviceService (trust/attestation)
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type EdgeCapability = "compute" | "storage" | "gpu" | "sensor" | "camera" | "biometric" | "secure-enclave" | "offline-exec";
export type EdgeRuntimeStatus = "online" | "offline" | "degraded" | "syncing" | "updating";
export type EdgeTaskStatus = "queued" | "assigned" | "running" | "completed" | "failed" | "cancelled";

export interface EdgeRuntime {
  readonly id: string;
  readonly deviceId: string;
  capabilities: EdgeCapability[];
  status: EdgeRuntimeStatus;
  lastHeartbeat: number;
  heartbeatIntervalMs: number;
  osVersion: string;
  runtimeVersion: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  taskQueue: EdgeTask[];
  registeredAt: number;
}

export interface EdgeTask {
  readonly id: string;
  readonly deviceId: string;
  readonly label: string;
  readonly type: "sync" | "compute" | "collect" | "update" | "backup";
  payload: Record<string, unknown>;
  status: EdgeTaskStatus;
  progress: number;
  assignedAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: EdgeTaskResult;
  retries: number;
  maxRetries: number;
}

export interface EdgeTaskResult {
  readonly taskId: string;
  readonly success: boolean;
  readonly output: Record<string, unknown>;
  readonly durationMs: number;
  readonly error?: string;
}

export interface SyncState {
  readonly deviceId: string;
  lastSyncedAt: number;
  pendingChanges: number;
  conflictCount: number;
  syncVersion: number;
  bytesTransferred: number;
  status: "synced" | "pending" | "syncing" | "conflict" | "stale";
}

export interface FleetSummary {
  total: number;
  online: number;
  offline: number;
  degraded: number;
  syncing: number;
  updating: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  pendingTasks: number;
  completedTasksToday: number;
}

export class EdgeDeviceRuntimeService {
  private runtimes = new Map<string, EdgeRuntime>();
  private syncStates = new Map<string, SyncState>();
  private taskResults: EdgeTaskResult[] = [];

  registerRuntime(deviceId: string, capabilities: EdgeCapability[], meta?: { osVersion?: string; runtimeVersion?: string }): EdgeRuntime {
    const runtime: EdgeRuntime = {
      id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      deviceId,
      capabilities,
      status: "online",
      lastHeartbeat: Date.now(),
      heartbeatIntervalMs: 30_000,
      osVersion: meta?.osVersion ?? "1.0.0",
      runtimeVersion: meta?.runtimeVersion ?? "1.0.0",
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      taskQueue: [],
      registeredAt: Date.now(),
    };
    this.runtimes.set(deviceId, runtime);
    this.syncStates.set(deviceId, {
      deviceId,
      lastSyncedAt: Date.now(),
      pendingChanges: 0,
      conflictCount: 0,
      syncVersion: 1,
      bytesTransferred: 0,
      status: "synced",
    });
    return runtime;
  }

  heartbeat(deviceId: string, metrics?: { cpu?: number; memory?: number; disk?: number }): EdgeRuntime | null {
    const rt = this.runtimes.get(deviceId);
    if (!rt) return null;
    rt.lastHeartbeat = Date.now();
    rt.status = "online";
    if (metrics) {
      if (metrics.cpu !== undefined) rt.cpuUsage = metrics.cpu;
      if (metrics.memory !== undefined) rt.memoryUsage = metrics.memory;
      if (metrics.disk !== undefined) rt.diskUsage = metrics.disk;
    }
    // auto-degrade if resource pressure
    if (rt.cpuUsage > 90 || rt.memoryUsage > 90 || rt.diskUsage > 95) {
      rt.status = "degraded";
    }
    return rt;
  }

  getRuntime(deviceId: string): EdgeRuntime | undefined {
    return this.runtimes.get(deviceId);
  }

  listRuntimes(filter?: { status?: EdgeRuntimeStatus; capability?: EdgeCapability }): EdgeRuntime[] {
    let results = Array.from(this.runtimes.values());
    if (filter?.status) results = results.filter(r => r.status === filter.status);
    if (filter?.capability) results = results.filter(r => r.capabilities.includes(filter.capability!));
    return results;
  }

  assignTask(deviceId: string, task: Omit<EdgeTask, "id" | "deviceId" | "status" | "progress" | "assignedAt" | "retries" | "maxRetries"> & { maxRetries?: number }): EdgeTask | null {
    const rt = this.runtimes.get(deviceId);
    if (!rt || rt.status === "offline") return null;

    const edgeTask: EdgeTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      deviceId,
      status: "queued",
      progress: 0,
      assignedAt: Date.now(),
      retries: 0,
      maxRetries: task.maxRetries ?? 3,
    };
    rt.taskQueue.push(edgeTask);

    // auto-start if device is online
    if (rt.status === "online") {
      edgeTask.status = "assigned";
    }

    return edgeTask;
  }

  reportTaskResult(deviceId: string, taskId: string, result: Omit<EdgeTaskResult, "taskId">): boolean {
    const rt = this.runtimes.get(deviceId);
    if (!rt) return false;

    const taskIdx = rt.taskQueue.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return false;

    const task = rt.taskQueue[taskIdx];
    task.completedAt = Date.now();
    task.progress = 100;
    task.result = { ...result, taskId };

    if (result.success) {
      task.status = "completed";
    } else {
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = "queued";
        task.progress = 0;
      } else {
        task.status = "failed";
      }
    }

    this.taskResults.push({ ...result, taskId });
    return true;
  }

  getSyncState(deviceId: string): SyncState | undefined {
    return this.syncStates.get(deviceId);
  }

  markSynced(deviceId: string, bytesTransferred = 0): boolean {
    const state = this.syncStates.get(deviceId);
    if (!state) return false;
    state.lastSyncedAt = Date.now();
    state.pendingChanges = 0;
    state.conflictCount = 0;
    state.syncVersion++;
    state.bytesTransferred += bytesTransferred;
    state.status = "synced";
    return true;
  }

  getOfflineDevices(thresholdMinutes = 5): EdgeRuntime[] {
    const cutoff = Date.now() - thresholdMinutes * 60_000;
    return Array.from(this.runtimes.values()).filter(rt => {
      if (rt.lastHeartbeat < cutoff) {
        rt.status = "offline";
        return true;
      }
      return false;
    });
  }

  getFleetSummary(): FleetSummary {
    const all = Array.from(this.runtimes.values());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const byStatus = (s: EdgeRuntimeStatus) => all.filter(r => r.status === s).length;
    const allTasks = all.flatMap(r => r.taskQueue);

    return {
      total: all.length,
      online: byStatus("online"),
      offline: byStatus("offline"),
      degraded: byStatus("degraded"),
      syncing: byStatus("syncing"),
      updating: byStatus("updating"),
      avgCpuUsage: all.length > 0 ? Math.round(all.reduce((s, r) => s + r.cpuUsage, 0) / all.length) : 0,
      avgMemoryUsage: all.length > 0 ? Math.round(all.reduce((s, r) => s + r.memoryUsage, 0) / all.length) : 0,
      pendingTasks: allTasks.filter(t => ["queued", "assigned", "running"].includes(t.status)).length,
      completedTasksToday: allTasks.filter(t => t.status === "completed" && (t.completedAt ?? 0) >= todayMs).length,
    };
  }

  getDemoRuntimes(): EdgeRuntime[] {
    return [
      { id: "edge_1", deviceId: "dev-hq-001", capabilities: ["compute", "storage", "secure-enclave"], status: "online", lastHeartbeat: Date.now() - 5000, heartbeatIntervalMs: 30000, osVersion: "ubuntu-22.04", runtimeVersion: "2.1.0", cpuUsage: 34, memoryUsage: 62, diskUsage: 45, taskQueue: [], registeredAt: Date.now() - 86400000 * 60 },
      { id: "edge_2", deviceId: "dev-remote-002", capabilities: ["compute", "sensor", "camera"], status: "online", lastHeartbeat: Date.now() - 15000, heartbeatIntervalMs: 30000, osVersion: "raspbian-12", runtimeVersion: "2.0.3", cpuUsage: 78, memoryUsage: 41, diskUsage: 33, taskQueue: [], registeredAt: Date.now() - 86400000 * 30 },
      { id: "edge_3", deviceId: "dev-mobile-003", capabilities: ["compute", "biometric", "offline-exec"], status: "degraded", lastHeartbeat: Date.now() - 120000, heartbeatIntervalMs: 30000, osVersion: "android-14", runtimeVersion: "1.9.1", cpuUsage: 92, memoryUsage: 88, diskUsage: 71, taskQueue: [], registeredAt: Date.now() - 86400000 * 14 },
    ];
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("edge-device-runtime", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      runtimes: Array.from(this.runtimes.entries()),
      syncStates: Array.from(this.syncStates.entries()),
      taskResults: this.taskResults,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.runtimes) this.runtimes = new Map(state.runtimes as Iterable<[string, never]>) as typeof this.runtimes;
    if (state.syncStates) this.syncStates = new Map(state.syncStates as Iterable<[string, never]>) as typeof this.syncStates;
    if (state.taskResults) this.taskResults = state.taskResults as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("edge-device-runtime");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createEdgeDeviceRuntime(): EdgeDeviceRuntimeService {
  return new EdgeDeviceRuntimeService();
}

