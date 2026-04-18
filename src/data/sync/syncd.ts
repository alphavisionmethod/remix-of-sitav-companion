// ═══════════════════════════════════════════════════════════════
// SITA OS — syncd: Core Sync Daemon
// The single choke point for all OS sync — no bypass allowed
// ═══════════════════════════════════════════════════════════════

import {
  type SyncObject,
  type SyncChangeEvent,
  type SyncCheckpoint,
  createSyncObject,
  incrementVersionVector,
  compareVersionVectors,
  generateSyncId,
  computeObjectHash,
} from "./sync-object-model";
import { namespaceRegistry, type SyncNamespace } from "./sync-namespaces";
import { conflictResolver } from "./conflict-resolver";
import { deltaEngine } from "./delta-engine";

// ─── Types ────────────────────────────────────────────────────

/** Sync daemon operational mode */
export type SyncMode =
  | "realtime"      // Active sync, WebSocket connected
  | "background"    // Periodic pull/push
  | "low-power"     // Reduced frequency, battery saver
  | "metered"       // Data-safe mode, skip large files
  | "offline"       // Queue only, no network
  | "recovery";     // Full resync from checkpoint

/** Sync job in the push/pull queues */
export interface SyncJob {
  id: string;
  objectId: string;
  namespace: string;
  direction: "push" | "pull";
  priority: number; // 0 = highest
  status: "queued" | "in-progress" | "completed" | "failed" | "retrying";
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  /** Estimated size in bytes */
  sizeEstimate: number;
}

/** Environment signals that affect sync behavior */
export interface EnvironmentSignals {
  batteryLevel: number;        // 0–100
  isCharging: boolean;
  isMetered: boolean;
  isRoaming: boolean;
  networkQuality: "excellent" | "good" | "fair" | "poor" | "offline";
  thermalPressure: "nominal" | "moderate" | "heavy" | "critical";
  isAppForeground: boolean;
  isUserIdle: boolean;
}

/** Daemon status snapshot */
export interface SyncDaemonStatus {
  mode: SyncMode;
  isRunning: boolean;
  connectedDevices: number;
  pendingPush: number;
  pendingPull: number;
  activeJobs: number;
  conflictCount: number;
  lastSyncAt: string | null;
  lastPushAt: string | null;
  lastPullAt: string | null;
  objectCount: number;
  environment: EnvironmentSignals;
  uptime: number;
  errors: string[];
}

type SyncEventHandler = (event: SyncChangeEvent) => void;

// ─── syncd Implementation ─────────────────────────────────────

class SyncDaemon {
  private running = false;
  private mode: SyncMode = "realtime";
  private startedAt: number = 0;

  // ─── Object Store ───────────────────────────
  private objects = new Map<string, SyncObject>();
  private objectsByNamespace = new Map<string, Set<string>>();

  // ─── Queues ─────────────────────────────────
  private pushQueue: SyncJob[] = [];
  private pullQueue: SyncJob[] = [];
  private activeJobs = new Set<string>();

  // ─── Checkpoints ────────────────────────────
  private checkpoints = new Map<string, SyncCheckpoint>(); // namespace -> checkpoint
  private deviceId: string = "";
  private userId: string = "";

  // ─── Change log ─────────────────────────────
  private changeLog: SyncChangeEvent[] = [];
  private changeCounter = 0;

  // ─── Environment ────────────────────────────
  private environment: EnvironmentSignals = {
    batteryLevel: 100,
    isCharging: true,
    isMetered: false,
    isRoaming: false,
    networkQuality: "good",
    thermalPressure: "nominal",
    isAppForeground: true,
    isUserIdle: false,
  };

  // ─── Intervals ──────────────────────────────
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private environmentInterval: ReturnType<typeof setInterval> | null = null;

  // ─── Event listeners ────────────────────────
  private eventHandlers: SyncEventHandler[] = [];
  private errors: string[] = [];

  // ─── Backpressure ───────────────────────────
  private readonly MAX_QUEUE_SIZE = 10000;
  private readonly MAX_CONCURRENT_JOBS = 5;
  private readonly RETRY_BACKOFF_BASE = 1000;

  // ═══════════════════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════════════════

  /** Start the sync daemon */
  start(userId: string, deviceId: string): void {
    if (this.running) return;
    this.running = true;
    this.startedAt = Date.now();
    this.userId = userId;
    this.deviceId = deviceId;
    this.errors = [];

    console.log(`[syncd] Starting sync daemon for user=${userId.slice(0, 8)} device=${deviceId.slice(0, 8)}`);

    // Start environment monitoring
    this.environmentInterval = setInterval(() => this.updateEnvironment(), 30000);
    this.updateEnvironment();

    // Start sync loop based on mode
    this.scheduleSync();
  }

  /** Stop the sync daemon */
  stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.environmentInterval) clearInterval(this.environmentInterval);
    this.syncInterval = null;
    this.environmentInterval = null;

    console.log("[syncd] Stopped");
  }

  /** Change the sync mode */
  setMode(mode: SyncMode): void {
    const prev = this.mode;
    this.mode = mode;
    console.log(`[syncd] Mode changed: ${prev} → ${mode}`);
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.scheduleSync();
  }

  // ═══════════════════════════════════════════════════════════
  // Object Operations (the single choke point)
  // ═══════════════════════════════════════════════════════════

  /** Create or update a sync object — ALL mutations go through here */
  upsertObject<T>(params: {
    type: SyncObject["type"];
    namespace: string;
    payload?: T;
    metadata?: Record<string, unknown>;
    id?: string;
    parentId?: string;
    encryptionClass?: SyncObject["encryptionClass"];
  }): SyncObject<T> {
    const ns = namespaceRegistry.get(params.namespace);
    if (ns && !ns.allowedTypes.includes(params.type)) {
      throw new Error(`[syncd] Type '${params.type}' not allowed in namespace '${params.namespace}'`);
    }

    const existingId = params.id;
    const existing = existingId ? this.objects.get(existingId) : undefined;

    if (existing) {
      // Update existing object
      const updated: SyncObject<T> = {
        ...(existing as SyncObject<T>),
        payload: params.payload ?? (existing.payload as T),
        metadata: { ...existing.metadata, ...params.metadata },
        version: existing.version + 1,
        versionVector: incrementVersionVector(existing.versionVector, this.deviceId),
        updatedAt: new Date().toISOString(),
        originDeviceId: this.deviceId,
        state: "pending-update",
        objectHash: "",
      };
      updated.objectHash = computeObjectHash(updated as unknown as Record<string, unknown>);
      this.objects.set(updated.id, updated as SyncObject);
      this.enqueuePush(updated as SyncObject);
      this.emitChange(updated as SyncObject, existing, "update");
      return updated;
    }

    // Create new object
    const obj = createSyncObject<T>({
      userId: this.userId,
      type: params.type,
      namespace: params.namespace,
      deviceId: this.deviceId,
      payload: params.payload,
      metadata: params.metadata ?? {},
      parentId: params.parentId,
      encryptionClass: params.encryptionClass ?? ns?.defaultEncryptionClass ?? "standard",
      state: "pending-create",
    });

    this.objects.set(obj.id, obj as SyncObject);
    this.indexObject(obj as SyncObject);
    this.enqueuePush(obj as SyncObject);
    this.emitChange(obj as SyncObject, undefined, "create");
    return obj;
  }

  /** Delete a sync object (tombstone) */
  deleteObject(objectId: string): boolean {
    const obj = this.objects.get(objectId);
    if (!obj || obj.deleted) return false;

    const updated: SyncObject = {
      ...obj,
      deleted: true,
      tombstonedAt: new Date().toISOString(),
      state: "pending-delete",
      version: obj.version + 1,
      versionVector: incrementVersionVector(obj.versionVector, this.deviceId),
      updatedAt: new Date().toISOString(),
      originDeviceId: this.deviceId,
    };
    updated.objectHash = computeObjectHash(updated as unknown as Record<string, unknown>);
    this.objects.set(objectId, updated);
    this.enqueuePush(updated);
    this.emitChange(updated, obj, "delete");
    return true;
  }

  /** Get a sync object by ID */
  getObject<T = unknown>(objectId: string): SyncObject<T> | undefined {
    return this.objects.get(objectId) as SyncObject<T> | undefined;
  }

  /** Get all objects in a namespace */
  getObjectsByNamespace(namespace: string): SyncObject[] {
    const ids = this.objectsByNamespace.get(namespace);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.objects.get(id)!).filter(Boolean);
  }

  /** Query objects by type and/or namespace */
  queryObjects(filter: {
    type?: SyncObject["type"];
    namespace?: string;
    namespacePrefix?: string;
    deleted?: boolean;
    state?: SyncObject["state"];
  }): SyncObject[] {
    let results = Array.from(this.objects.values());
    if (filter.type) results = results.filter((o) => o.type === filter.type);
    if (filter.namespace) results = results.filter((o) => o.namespace === filter.namespace);
    if (filter.namespacePrefix) results = results.filter((o) => o.namespace.startsWith(filter.namespacePrefix!));
    if (filter.deleted !== undefined) results = results.filter((o) => o.deleted === filter.deleted);
    if (filter.state) results = results.filter((o) => o.state === filter.state);
    return results;
  }

  // ═══════════════════════════════════════════════════════════
  // Inbound Processing (pull)
  // ═══════════════════════════════════════════════════════════

  /** Process a remote change event (from WebSocket or pull) */
  processRemoteChange(remoteObject: SyncObject): void {
    const local = this.objects.get(remoteObject.id);

    if (!local) {
      // New object from remote — accept directly
      const accepted: SyncObject = { ...remoteObject, state: "active" };
      this.objects.set(accepted.id, accepted);
      this.indexObject(accepted);
      this.emitChange(accepted, undefined, "create");
      return;
    }

    // Check for conflicts using version vectors
    const cmp = compareVersionVectors(local.versionVector, remoteObject.versionVector);

    if (cmp === 1) {
      // Local is ahead — ignore remote (it's stale)
      return;
    }

    if (cmp === -1) {
      // Remote is ahead — accept remote
      const accepted: SyncObject = { ...remoteObject, state: "active" };
      this.objects.set(accepted.id, accepted);
      this.emitChange(accepted, local, "update");
      return;
    }

    // cmp === 0: Concurrent — CONFLICT
    const conflict = conflictResolver.registerConflict(local, remoteObject);
    if (conflict.resolution && conflict.status === "auto-resolved") {
      const resolved = conflict.resolution.resolvedObject;
      this.objects.set(resolved.id, { ...resolved, state: "active" });
      this.emitChange(resolved, local, "conflict-resolved");
    }
    // If manual-required, leave the conflict pending for user resolution
  }

  // ═══════════════════════════════════════════════════════════
  // Queue Management
  // ═══════════════════════════════════════════════════════════

  private enqueuePush(obj: SyncObject): void {
    if (this.pushQueue.length >= this.MAX_QUEUE_SIZE) {
      this.errors.push("Push queue full — backpressure applied");
      return;
    }

    const ns = namespaceRegistry.get(obj.namespace);
    const priority = this.getPriorityValue(ns?.priority ?? "medium");

    // Deduplicate — update existing job for same object
    const existing = this.pushQueue.find((j) => j.objectId === obj.id && j.status === "queued");
    if (existing) {
      existing.priority = Math.min(existing.priority, priority);
      return;
    }

    this.pushQueue.push({
      id: generateSyncId(),
      objectId: obj.id,
      namespace: obj.namespace,
      direction: "push",
      priority,
      status: "queued",
      attemptCount: 0,
      maxAttempts: 5,
      createdAt: new Date().toISOString(),
      sizeEstimate: JSON.stringify(obj.payload ?? {}).length,
    });

    // Sort by priority
    this.pushQueue.sort((a, b) => a.priority - b.priority);
  }

  /** Process queued jobs */
  private async processQueues(): Promise<void> {
    if (!this.running || this.mode === "offline") return;

    // Check environment constraints
    if (!this.canSync()) return;

    // Process push queue
    const pushBatch = this.pushQueue
      .filter((j) => j.status === "queued" || j.status === "retrying")
      .filter((j) => !j.nextRetryAt || new Date(j.nextRetryAt).getTime() <= Date.now())
      .slice(0, this.MAX_CONCURRENT_JOBS - this.activeJobs.size);

    for (const job of pushBatch) {
      if (this.activeJobs.size >= this.MAX_CONCURRENT_JOBS) break;

      // Skip large files on metered
      if (this.mode === "metered" && job.sizeEstimate > 1024 * 1024) continue;

      this.activeJobs.add(job.id);
      job.status = "in-progress";
      job.attemptCount++;

      try {
        // Simulated push — in production this would call the API
        await this.simulatePush(job);
        job.status = "completed";
        job.completedAt = new Date().toISOString();

        // Update object state
        const obj = this.objects.get(job.objectId);
        if (obj && (obj.state === "pending-create" || obj.state === "pending-update" || obj.state === "pending-delete")) {
          this.objects.set(obj.id, { ...obj, state: obj.deleted ? "tombstoned" : "active" });
        }
      } catch (err) {
        job.status = job.attemptCount >= job.maxAttempts ? "failed" : "retrying";
        job.error = String(err);
        if (job.status === "retrying") {
          job.nextRetryAt = new Date(
            Date.now() + this.RETRY_BACKOFF_BASE * Math.pow(2, job.attemptCount)
          ).toISOString();
        } else {
          this.errors.push(`Push failed for ${job.objectId}: ${job.error}`);
        }
      } finally {
        this.activeJobs.delete(job.id);
      }
    }

    // Clean completed jobs
    this.pushQueue = this.pushQueue.filter((j) => j.status !== "completed");
    this.pullQueue = this.pullQueue.filter((j) => j.status !== "completed");
  }

  // ═══════════════════════════════════════════════════════════
  // Scheduling
  // ═══════════════════════════════════════════════════════════

  private scheduleSync(): void {
    if (!this.running) return;

    const interval = this.getSyncInterval();
    this.syncInterval = setInterval(() => {
      this.processQueues().catch((err) => {
        this.errors.push(`Sync error: ${String(err)}`);
      });
    }, interval);
  }

  private getSyncInterval(): number {
    switch (this.mode) {
      case "realtime": return 2000;
      case "background": return 30000;
      case "low-power": return 120000;
      case "metered": return 60000;
      case "recovery": return 5000;
      case "offline": return 60000; // Just check if back online
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Environment & Policy
  // ═══════════════════════════════════════════════════════════

  private canSync(): boolean {
    if (this.environment.networkQuality === "offline") return false;
    if (this.environment.thermalPressure === "critical") return false;
    if (this.mode === "low-power" && this.environment.batteryLevel < 10 && !this.environment.isCharging) return false;
    return true;
  }

  /** Update environment signals from browser APIs */
  updateEnvironment(): void {
    this.environment = {
      batteryLevel: 100, // Would use Battery API
      isCharging: true,
      isMetered: (navigator as any).connection?.effectiveType === "2g" ||
                 (navigator as any).connection?.effectiveType === "slow-2g",
      isRoaming: false,
      networkQuality: navigator.onLine
        ? ((navigator as any).connection?.effectiveType === "4g" ? "excellent" : "good")
        : "offline",
      thermalPressure: "nominal",
      isAppForeground: document.visibilityState === "visible",
      isUserIdle: false,
    };

    // Auto-adjust mode based on environment
    if (!navigator.onLine && this.mode !== "offline") {
      this.setMode("offline");
    } else if (navigator.onLine && this.mode === "offline") {
      this.setMode("realtime");
    }
  }

  /** Update environment signals externally (e.g., from battery API) */
  setEnvironment(partial: Partial<EnvironmentSignals>): void {
    this.environment = { ...this.environment, ...partial };
  }

  // ═══════════════════════════════════════════════════════════
  // Status & Monitoring
  // ═══════════════════════════════════════════════════════════

  /** Get current daemon status */
  getStatus(): SyncDaemonStatus {
    return {
      mode: this.mode,
      isRunning: this.running,
      connectedDevices: 1, // Would come from WebSocket
      pendingPush: this.pushQueue.filter((j) => j.status === "queued" || j.status === "retrying").length,
      pendingPull: this.pullQueue.filter((j) => j.status === "queued" || j.status === "retrying").length,
      activeJobs: this.activeJobs.size,
      conflictCount: conflictResolver.getPendingConflicts().length,
      lastSyncAt: this.changeLog.length > 0 ? this.changeLog[this.changeLog.length - 1].timestamp : null,
      lastPushAt: this.getLastCompletedTime("push"),
      lastPullAt: this.getLastCompletedTime("pull"),
      objectCount: this.objects.size,
      environment: { ...this.environment },
      uptime: this.running ? Date.now() - this.startedAt : 0,
      errors: [...this.errors.slice(-10)],
    };
  }

  /** Get the change log */
  getChangeLog(limit: number = 100): SyncChangeEvent[] {
    return this.changeLog.slice(-limit);
  }

  /** Get checkpoint for a namespace */
  getCheckpoint(namespace: string): SyncCheckpoint | undefined {
    return this.checkpoints.get(namespace);
  }

  /** Subscribe to sync events */
  onSyncEvent(handler: SyncEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  /** Force a full resync */
  forceResync(): void {
    console.log("[syncd] Forcing full resync");
    this.checkpoints.clear();
    this.setMode("recovery");
  }

  /** Get the push queue for monitoring */
  getPushQueue(): SyncJob[] {
    return [...this.pushQueue];
  }

  /** Get the pull queue for monitoring */
  getPullQueue(): SyncJob[] {
    return [...this.pullQueue];
  }

  // ═══════════════════════════════════════════════════════════
  // Internal Helpers
  // ═══════════════════════════════════════════════════════════

  private indexObject(obj: SyncObject): void {
    if (!this.objectsByNamespace.has(obj.namespace)) {
      this.objectsByNamespace.set(obj.namespace, new Set());
    }
    this.objectsByNamespace.get(obj.namespace)!.add(obj.id);
  }

  private emitChange(obj: SyncObject, previous: SyncObject | undefined, type: SyncChangeEvent["changeType"]): void {
    this.changeCounter++;
    const event: SyncChangeEvent = {
      changeId: `chg_${this.changeCounter}`,
      objectId: obj.id,
      userId: obj.userId,
      changeType: type,
      fromVersion: previous?.version ?? 0,
      toVersion: obj.version,
      originDeviceId: obj.originDeviceId,
      namespace: obj.namespace,
      timestamp: new Date().toISOString(),
    };

    // Compute delta if applicable
    if (previous && obj.payload && previous.payload) {
      const delta = deltaEngine.computeDelta(
        previous.payload, obj.payload,
        obj.id, previous.version, obj.version
      );
      if (deltaEngine.shouldUseDelta(delta)) {
        event.deltaRef = delta.id;
      }
    }

    this.changeLog.push(event);
    // Keep change log bounded
    if (this.changeLog.length > 10000) {
      this.changeLog = this.changeLog.slice(-5000);
    }

    // Update checkpoint
    this.checkpoints.set(obj.namespace, {
      userId: this.userId,
      deviceId: this.deviceId,
      lastChangeId: event.changeId,
      lastVersion: obj.version,
      namespace: obj.namespace,
      updatedAt: event.timestamp,
    });

    for (const handler of this.eventHandlers) handler(event);
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case "critical": return 0;
      case "high": return 1;
      case "medium": return 2;
      case "low": return 3;
      case "background": return 4;
      default: return 2;
    }
  }

  private getLastCompletedTime(direction: "push" | "pull"): string | null {
    const queue = direction === "push" ? this.pushQueue : this.pullQueue;
    const completed = queue.filter((j) => j.status === "completed").sort(
      (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );
    return completed[0]?.completedAt ?? null;
  }

  private async simulatePush(job: SyncJob): Promise<void> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
    // 2% simulated failure rate
    if (Math.random() < 0.02) {
      throw new Error("Network timeout");
    }
  }
}

/** Singleton sync daemon — the one and only sync choke point */
export const syncd = new SyncDaemon();
