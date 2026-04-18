// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Sync Manager
// State synchronization, version vectors, conflict resolution,
// and update propagation for distributed instances
// ═══════════════════════════════════════════════════════════════

import { EventBus } from "./event-bus";

// ── Types ───────────────────────────────────────────────────────

export interface VersionVector {
  nodeId: string;
  version: number;
  timestamp: number;
  checksum: string;
}

export interface SyncPatch {
  id: string;
  source: string;
  target: string;
  patchType: "agent-config" | "policy-update" | "feature-flag" | "preference" | "manifest" | "learning";
  payload: Record<string, unknown>;
  version: number;
  createdAt: number;
  appliedAt?: number;
  status: "pending" | "applied" | "conflict" | "rejected";
}

export interface ConflictRecord {
  id: string;
  patchId: string;
  localVersion: number;
  remoteVersion: number;
  resolution: "local-wins" | "remote-wins" | "merged" | "unresolved";
  resolvedAt?: number;
  details: string;
}

export interface SyncStatus {
  nodeId: string;
  connected: boolean;
  lastSyncAt: number;
  pendingOutbound: number;
  pendingInbound: number;
  conflictCount: number;
  syncLagMs: number;
  version: number;
  totalSyncs: number;
  failedSyncs: number;
}

export type SyncTarget = "cloud" | "edge" | "peer";

// ── Cloud Sync Manager ──────────────────────────────────────────

export class CloudSyncManager {
  private nodeId: string;
  private version = 1;
  private lastSyncAt = 0;
  private outboundQueue: SyncPatch[] = [];
  private inboundQueue: SyncPatch[] = [];
  private appliedPatches: SyncPatch[] = [];
  private conflicts: ConflictRecord[] = [];
  private state: Record<string, unknown> = {};
  private eventBus: EventBus;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private totalSyncs = 0;
  private failedSyncs = 0;

  constructor(options?: { eventBus?: EventBus; nodeId?: string }) {
    this.eventBus = options?.eventBus ?? new EventBus();
    this.nodeId = options?.nodeId ?? `node-${crypto.randomUUID().slice(0, 8)}`;
  }

  // ── Start/Stop ──────────────────────────────────────────────

  start(intervalMs = 60_000): void {
    this.syncInterval = setInterval(() => this.syncState(), intervalMs);
    this.syncState(); // Initial sync
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ── State Sync ──────────────────────────────────────────────

  syncState(): void {
    this.lastSyncAt = Date.now();
    this.totalSyncs++;

    // Process inbound patches
    for (const patch of this.inboundQueue) {
      this.applyPatch(patch);
    }
    this.inboundQueue = [];

    // "Send" outbound patches (simulated — in real implementation would use Supabase Realtime)
    for (const patch of this.outboundQueue) {
      patch.status = "applied";
      patch.appliedAt = Date.now();
      this.appliedPatches.push(patch);
    }
    this.outboundQueue = [];

    this.version++;

    this.eventBus.publish("cloud-sync.completed.v1", {
      nodeId: this.nodeId,
      version: this.version,
      patchesApplied: this.appliedPatches.length,
    }, { source: "cloud-sync-manager" });
  }

  // ── Patch Management ────────────────────────────────────────

  applyUpdate(patch: Omit<SyncPatch, "id" | "createdAt" | "status">): void {
    const fullPatch: SyncPatch = {
      ...patch,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: "pending",
    };

    // Conflict detection
    if (patch.version <= this.version) {
      const conflict: ConflictRecord = {
        id: crypto.randomUUID(),
        patchId: fullPatch.id,
        localVersion: this.version,
        remoteVersion: patch.version,
        resolution: "local-wins",
        resolvedAt: Date.now(),
        details: `Local version ${this.version} ahead of patch version ${patch.version}`,
      };
      this.conflicts.push(conflict);
      fullPatch.status = "conflict";

      // Last-writer-wins for non-critical patches
      if (patch.patchType !== "policy-update") {
        conflict.resolution = "remote-wins";
        this.applyPatch(fullPatch);
      }
      return;
    }

    this.applyPatch(fullPatch);
  }

  private applyPatch(patch: SyncPatch): void {
    // Apply to local state
    const key = `${patch.patchType}:${patch.source}`;
    this.state[key] = patch.payload;
    patch.status = "applied";
    patch.appliedAt = Date.now();
    this.appliedPatches.push(patch);

    this.eventBus.publish("cloud-sync.patch.applied.v1", {
      patchId: patch.id,
      patchType: patch.patchType,
      source: patch.source,
    }, { source: "cloud-sync-manager" });
  }

  pushUpdate(target: SyncTarget, patchType: SyncPatch["patchType"], payload: Record<string, unknown>): void {
    this.outboundQueue.push({
      id: crypto.randomUUID(),
      source: this.nodeId,
      target,
      patchType,
      payload,
      version: this.version,
      createdAt: Date.now(),
      status: "pending",
    });
  }

  // ── Reconciliation ──────────────────────────────────────────

  reconcile(remoteState: Record<string, unknown>, localState: Record<string, unknown>): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...localState };

    for (const [key, value] of Object.entries(remoteState)) {
      if (!(key in localState)) {
        merged[key] = value;
      } else {
        // Last-writer-wins (simplified)
        const conflict: ConflictRecord = {
          id: crypto.randomUUID(),
          patchId: "reconciliation",
          localVersion: this.version,
          remoteVersion: this.version,
          resolution: "merged",
          resolvedAt: Date.now(),
          details: `Key "${key}" merged — remote value accepted`,
        };
        this.conflicts.push(conflict);
        merged[key] = value;
      }
    }

    return merged;
  }

  // ── High-level sync methods ─────────────────────────────────

  syncSettings(settings: Record<string, unknown>): void {
    this.pushUpdate("cloud", "preference", settings);
  }

  syncSession(session: Record<string, unknown>): void {
    this.pushUpdate("cloud", "manifest", session);
  }

  restoreFromCloud(): Record<string, unknown> {
    return { ...this.state };
  }

  // ── Queries ─────────────────────────────────────────────────

  getVersionVector(): VersionVector {
    return {
      nodeId: this.nodeId,
      version: this.version,
      timestamp: this.lastSyncAt,
      checksum: this.computeChecksum(),
    };
  }

  getSyncStatus(): SyncStatus {
    return {
      nodeId: this.nodeId,
      connected: true, // Simulated — always connected in client-side
      lastSyncAt: this.lastSyncAt,
      pendingOutbound: this.outboundQueue.length,
      pendingInbound: this.inboundQueue.length,
      conflictCount: this.conflicts.filter(c => c.resolution === "unresolved").length,
      syncLagMs: Date.now() - this.lastSyncAt,
      version: this.version,
      totalSyncs: this.totalSyncs,
      failedSyncs: this.failedSyncs,
    };
  }

  getConflicts(): ConflictRecord[] {
    return [...this.conflicts];
  }

  getAppliedPatches(limit = 50): SyncPatch[] {
    return this.appliedPatches.slice(-limit);
  }

  // ── Utilities ───────────────────────────────────────────────

  private computeChecksum(): string {
    const data = JSON.stringify(this.state);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createCloudSyncManager(options?: {
  eventBus?: EventBus;
  nodeId?: string;
}): CloudSyncManager {
  const manager = new CloudSyncManager(options);
  manager.start();
  return manager;
}
