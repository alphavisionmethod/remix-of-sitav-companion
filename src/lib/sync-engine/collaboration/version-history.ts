// ═══════════════════════════════════════════════════════════════
// SITA OS — Version History & Data Retention Engine
// Per-object versions, restore, tombstone lifecycle, undelete
// ═══════════════════════════════════════════════════════════════

import type { SyncObject } from "../sync-object-model";

// ─── Types ────────────────────────────────────────────────────

export interface VersionSnapshot {
  id: string;
  objectId: string;
  version: number;
  snapshotData: unknown;
  contentHash: string;
  sizeBytes: number;
  createdAt: string;
  originDeviceId: string;
  changeDescription?: string;
  isAutoSave: boolean;
}

export interface RestorePoint {
  id: string;
  label: string;
  type: "manual" | "auto" | "pre-delete" | "pre-conflict" | "session" | "settings";
  objectIds: string[];
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  metadata: Record<string, unknown>;
}

export interface TombstoneRecord {
  objectId: string;
  deletedAt: string;
  deletedBy: string;
  deletedOnDevice: string;
  softDeleteExpiresAt: string;
  hardDeleteScheduledAt?: string;
  propagatedToDevices: string[];
  recoverable: boolean;
  legalHold: boolean;
  objectSnapshot?: unknown;
}

export interface RetentionPolicy {
  namespace: string;
  softDeleteTTLDays: number;
  hardDeleteTTLDays: number;
  maxVersionsPerObject: number;
  maxVersionAgeDays: number;
  legalHoldEnabled: boolean;
  autoCleanup: boolean;
}

export interface VersionComparison {
  objectId: string;
  versionA: number;
  versionB: number;
  addedFields: string[];
  removedFields: string[];
  changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  sizeChange: number;
}

export interface DeletionWorkflow {
  id: string;
  type: "soft" | "hard" | "legal" | "account-closure";
  status: "pending" | "propagating" | "completed" | "cancelled" | "held";
  objectIds: string[];
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
  affectedDevices: string[];
  confirmationRequired: boolean;
}

// ─── Version History Engine ───────────────────────────────────

class VersionHistoryEngine {
  private versions = new Map<string, VersionSnapshot[]>(); // objectId -> snapshots
  private restorePoints: RestorePoint[] = [];
  private tombstones = new Map<string, TombstoneRecord>();
  private deletionWorkflows = new Map<string, DeletionWorkflow>();
  private policies = new Map<string, RetentionPolicy>();

  constructor() {
    this.initDefaultPolicies();
  }

  // ─── Version Snapshots ─────────────────────────────

  recordVersion(obj: SyncObject, changeDescription?: string): VersionSnapshot {
    const snap: VersionSnapshot = {
      id: `vs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      objectId: obj.id,
      version: obj.version,
      snapshotData: obj.payload ?? obj.contentRef?.inlineData,
      contentHash: obj.objectHash,
      sizeBytes: obj.contentRef?.sizeBytes ?? 0,
      createdAt: new Date().toISOString(),
      originDeviceId: obj.originDeviceId,
      changeDescription,
      isAutoSave: !changeDescription,
    };

    const list = this.versions.get(obj.id) ?? [];
    list.push(snap);

    // Enforce max versions
    const policy = this.getObjectPolicy(obj.namespace);
    if (list.length > policy.maxVersionsPerObject) {
      list.splice(0, list.length - policy.maxVersionsPerObject);
    }

    this.versions.set(obj.id, list);
    return snap;
  }

  getVersionHistory(objectId: string): VersionSnapshot[] {
    return [...(this.versions.get(objectId) ?? [])].reverse();
  }

  getVersion(objectId: string, version: number): VersionSnapshot | null {
    const list = this.versions.get(objectId) ?? [];
    return list.find(v => v.version === version) ?? null;
  }

  compareVersions(objectId: string, vA: number, vB: number): VersionComparison | null {
    const a = this.getVersion(objectId, vA);
    const b = this.getVersion(objectId, vB);
    if (!a || !b) return null;

    const aData = (a.snapshotData ?? {}) as Record<string, unknown>;
    const bData = (b.snapshotData ?? {}) as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(aData), ...Object.keys(bData)]);
    const added: string[] = [];
    const removed: string[] = [];
    const changed: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

    for (const key of allKeys) {
      if (!(key in aData)) added.push(key);
      else if (!(key in bData)) removed.push(key);
      else if (JSON.stringify(aData[key]) !== JSON.stringify(bData[key])) {
        changed.push({ field: key, oldValue: aData[key], newValue: bData[key] });
      }
    }

    return {
      objectId, versionA: vA, versionB: vB,
      addedFields: added, removedFields: removed, changedFields: changed,
      sizeChange: b.sizeBytes - a.sizeBytes,
    };
  }

  // ─── Restore Points ────────────────────────────────

  createRestorePoint(label: string, objectIds: string[], type: RestorePoint["type"], createdBy: string): RestorePoint {
    const rp: RestorePoint = {
      id: `rp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      label,
      type,
      objectIds,
      createdAt: new Date().toISOString(),
      createdBy,
      metadata: {},
    };
    this.restorePoints.push(rp);
    if (this.restorePoints.length > 500) this.restorePoints = this.restorePoints.slice(-400);
    return rp;
  }

  getRestorePoints(limit = 20): RestorePoint[] {
    return this.restorePoints.slice(-limit).reverse();
  }

  restoreToPoint(restorePointId: string): { objectId: string; restoredVersion: number }[] {
    const rp = this.restorePoints.find(r => r.id === restorePointId);
    if (!rp) return [];
    const results: { objectId: string; restoredVersion: number }[] = [];
    for (const oid of rp.objectIds) {
      const versions = this.versions.get(oid) ?? [];
      const target = versions.find(v => new Date(v.createdAt).getTime() <= new Date(rp.createdAt).getTime());
      if (target) results.push({ objectId: oid, restoredVersion: target.version });
    }
    return results;
  }

  // ─── Tombstone & Deletion ──────────────────────────

  softDelete(objectId: string, userId: string, deviceId: string, namespace: string, snapshot?: unknown): TombstoneRecord {
    const policy = this.getObjectPolicy(namespace);
    const record: TombstoneRecord = {
      objectId,
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
      deletedOnDevice: deviceId,
      softDeleteExpiresAt: new Date(Date.now() + policy.softDeleteTTLDays * 86400000).toISOString(),
      hardDeleteScheduledAt: new Date(Date.now() + policy.hardDeleteTTLDays * 86400000).toISOString(),
      propagatedToDevices: [deviceId],
      recoverable: true,
      legalHold: false,
      objectSnapshot: snapshot,
    };
    this.tombstones.set(objectId, record);
    return record;
  }

  undelete(objectId: string): TombstoneRecord | null {
    const record = this.tombstones.get(objectId);
    if (!record || !record.recoverable) return null;
    if (new Date(record.softDeleteExpiresAt).getTime() < Date.now()) return null;
    this.tombstones.delete(objectId);
    return record;
  }

  hardDelete(objectId: string): boolean {
    const record = this.tombstones.get(objectId);
    if (record?.legalHold) return false;
    this.tombstones.delete(objectId);
    this.versions.delete(objectId);
    return true;
  }

  setLegalHold(objectId: string, hold: boolean): void {
    const record = this.tombstones.get(objectId);
    if (record) {
      record.legalHold = hold;
      if (hold) record.recoverable = true; // legal hold prevents hard delete
    }
  }

  getDeletedObjects(limit = 50): TombstoneRecord[] {
    return Array.from(this.tombstones.values())
      .filter(t => t.recoverable && new Date(t.softDeleteExpiresAt).getTime() > Date.now())
      .slice(0, limit);
  }

  markPropagated(objectId: string, deviceId: string): void {
    const record = this.tombstones.get(objectId);
    if (record && !record.propagatedToDevices.includes(deviceId)) {
      record.propagatedToDevices.push(deviceId);
    }
  }

  // ─── Deletion Workflows ────────────────────────────

  initiateDeletion(type: DeletionWorkflow["type"], objectIds: string[], initiatedBy: string): DeletionWorkflow {
    const wf: DeletionWorkflow = {
      id: `dw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      status: type === "account-closure" ? "pending" : "propagating",
      objectIds,
      initiatedBy,
      initiatedAt: new Date().toISOString(),
      affectedDevices: [],
      confirmationRequired: type === "hard" || type === "account-closure",
    };
    this.deletionWorkflows.set(wf.id, wf);
    return wf;
  }

  completeDeletion(workflowId: string): boolean {
    const wf = this.deletionWorkflows.get(workflowId);
    if (!wf) return false;
    wf.status = "completed";
    wf.completedAt = new Date().toISOString();
    return true;
  }

  getDeletionWorkflows(): DeletionWorkflow[] {
    return Array.from(this.deletionWorkflows.values());
  }

  // ─── Retention Policies ────────────────────────────

  setRetentionPolicy(policy: RetentionPolicy): void {
    this.policies.set(policy.namespace, policy);
  }

  getRetentionPolicies(): RetentionPolicy[] {
    return Array.from(this.policies.values());
  }

  // ─── Cleanup ───────────────────────────────────────

  runCleanup(): { expiredTombstones: number; prunedVersions: number } {
    let expiredTombstones = 0;
    let prunedVersions = 0;

    for (const [id, record] of this.tombstones) {
      if (!record.legalHold && new Date(record.softDeleteExpiresAt).getTime() < Date.now()) {
        record.recoverable = false;
        expiredTombstones++;
      }
      if (record.hardDeleteScheduledAt && !record.legalHold &&
          new Date(record.hardDeleteScheduledAt).getTime() < Date.now()) {
        this.tombstones.delete(id);
        this.versions.delete(id);
      }
    }

    for (const [objectId, list] of this.versions) {
      const policy = this.getObjectPolicyForVersions(objectId);
      const cutoff = Date.now() - policy.maxVersionAgeDays * 86400000;
      const before = list.length;
      const filtered = list.filter(v => new Date(v.createdAt).getTime() > cutoff);
      if (filtered.length < before) {
        this.versions.set(objectId, filtered);
        prunedVersions += before - filtered.length;
      }
    }

    return { expiredTombstones, prunedVersions };
  }

  // ─── Stats ─────────────────────────────────────────

  getStats() {
    let totalVersions = 0;
    for (const list of this.versions.values()) totalVersions += list.length;
    return {
      totalVersionedObjects: this.versions.size,
      totalVersions,
      restorePoints: this.restorePoints.length,
      tombstones: this.tombstones.size,
      recoverableDeletes: this.getDeletedObjects().length,
      activeDeletionWorkflows: Array.from(this.deletionWorkflows.values()).filter(w => w.status !== "completed").length,
      retentionPolicies: this.policies.size,
    };
  }

  // ─── Internal ──────────────────────────────────────

  private getObjectPolicy(namespace: string): RetentionPolicy {
    return this.policies.get(namespace) ?? this.policies.get("default")!;
  }

  private getObjectPolicyForVersions(objectId: string): RetentionPolicy {
    // Simple fallback — in production would look up namespace from objectId
    return this.policies.get("default")!;
  }

  private initDefaultPolicies(): void {
    const defaults: RetentionPolicy[] = [
      { namespace: "default", softDeleteTTLDays: 30, hardDeleteTTLDays: 90, maxVersionsPerObject: 50, maxVersionAgeDays: 365, legalHoldEnabled: false, autoCleanup: true },
      { namespace: "files.documents", softDeleteTTLDays: 60, hardDeleteTTLDays: 180, maxVersionsPerObject: 100, maxVersionAgeDays: 730, legalHoldEnabled: true, autoCleanup: true },
      { namespace: "files.photos", softDeleteTTLDays: 30, hardDeleteTTLDays: 90, maxVersionsPerObject: 10, maxVersionAgeDays: 365, legalHoldEnabled: false, autoCleanup: true },
      { namespace: "settings.all", softDeleteTTLDays: 90, hardDeleteTTLDays: 365, maxVersionsPerObject: 200, maxVersionAgeDays: 730, legalHoldEnabled: false, autoCleanup: true },
      { namespace: "session.desktop", softDeleteTTLDays: 7, hardDeleteTTLDays: 30, maxVersionsPerObject: 20, maxVersionAgeDays: 30, legalHoldEnabled: false, autoCleanup: true },
    ];
    defaults.forEach(p => this.policies.set(p.namespace, p));
  }
}

export const versionHistory = new VersionHistoryEngine();
