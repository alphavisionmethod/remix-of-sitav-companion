// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Cache Database
// Enhanced IndexedDB-based local sync store with crash-safe queues
// ═══════════════════════════════════════════════════════════════

import type { SyncObject, SyncCheckpoint, SyncChangeEvent } from "../sync-object-model";
import type { HydrationState } from "./file-watch-adapter";

const DB_NAME = "sita-sync-cache";
const DB_VERSION = 2;

/** Store names in the local sync database */
const STORES = {
  LOCAL_OBJECTS: "local_objects",
  PENDING_CHANGES: "pending_changes",
  SYNC_CHECKPOINTS: "sync_checkpoints",
  DOWNLOAD_JOBS: "download_jobs",
  UPLOAD_JOBS: "upload_jobs",
  CONFLICTS: "conflicts",
  HYDRATION_STATE: "hydration_state",
  DEVICE_SYNC_PREFS: "device_sync_prefs",
} as const;

/** A pending change waiting to be pushed */
export interface PendingChange {
  id: string;
  objectId: string;
  changeType: "create" | "update" | "delete";
  payload: unknown;
  namespace: string;
  createdAt: string;
  attemptCount: number;
  lastAttemptAt?: string;
  error?: string;
}

/** Download/upload job */
export interface TransferJob {
  id: string;
  objectId: string;
  direction: "download" | "upload";
  status: "queued" | "active" | "paused" | "completed" | "failed";
  totalBytes: number;
  transferredBytes: number;
  resumeToken?: string;
  chunkIndex: number;
  totalChunks: number;
  checksum: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

/** Hydration state record */
export interface HydrationRecord {
  objectId: string;
  path: string;
  state: HydrationState;
  localSize: number;
  remoteSize: number;
  lastAccess: string;
  pinnedAt?: string;
}

/** Device sync preferences */
export interface DeviceSyncPrefs {
  deviceId: string;
  enabledNamespaces: string[];
  disabledNamespaces: string[];
  syncOnMetered: boolean;
  syncOnBattery: boolean;
  maxBandwidthKbps: number;
  backgroundSyncEnabled: boolean;
  realtimeSyncEnabled: boolean;
}

// ─── Database Manager ─────────────────────────────────────────

class SyncCacheDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /** Initialize the database */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (typeof indexedDB === "undefined") {
        console.warn("[SyncCacheDB] IndexedDB not available");
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores with indexes
        if (!db.objectStoreNames.contains(STORES.LOCAL_OBJECTS)) {
          const store = db.createObjectStore(STORES.LOCAL_OBJECTS, { keyPath: "id" });
          store.createIndex("namespace", "namespace", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("userId", "userId", { unique: false });
          store.createIndex("state", "state", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_CHANGES)) {
          const store = db.createObjectStore(STORES.PENDING_CHANGES, { keyPath: "id" });
          store.createIndex("objectId", "objectId", { unique: false });
          store.createIndex("namespace", "namespace", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_CHECKPOINTS)) {
          db.createObjectStore(STORES.SYNC_CHECKPOINTS, { keyPath: ["userId", "deviceId", "namespace"] });
        }

        if (!db.objectStoreNames.contains(STORES.DOWNLOAD_JOBS)) {
          const store = db.createObjectStore(STORES.DOWNLOAD_JOBS, { keyPath: "id" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("objectId", "objectId", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.UPLOAD_JOBS)) {
          const store = db.createObjectStore(STORES.UPLOAD_JOBS, { keyPath: "id" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("objectId", "objectId", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CONFLICTS)) {
          const store = db.createObjectStore(STORES.CONFLICTS, { keyPath: "id" });
          store.createIndex("objectId", "objectId", { unique: false });
          store.createIndex("status", "status", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.HYDRATION_STATE)) {
          const store = db.createObjectStore(STORES.HYDRATION_STATE, { keyPath: "objectId" });
          store.createIndex("state", "state", { unique: false });
          store.createIndex("path", "path", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.DEVICE_SYNC_PREFS)) {
          db.createObjectStore(STORES.DEVICE_SYNC_PREFS, { keyPath: "deviceId" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("[SyncCacheDB] Initialized");
        resolve();
      };

      request.onerror = () => {
        console.error("[SyncCacheDB] Failed to open database");
        reject(new Error("Failed to open sync cache database"));
      };
    });

    return this.initPromise;
  }

  // ─── Local Objects ──────────────────────────

  async putObject(obj: SyncObject): Promise<void> {
    await this.put(STORES.LOCAL_OBJECTS, obj);
  }

  async getObject(id: string): Promise<SyncObject | undefined> {
    return this.get(STORES.LOCAL_OBJECTS, id);
  }

  async getObjectsByNamespace(namespace: string): Promise<SyncObject[]> {
    return this.getByIndex(STORES.LOCAL_OBJECTS, "namespace", namespace);
  }

  async deleteObject(id: string): Promise<void> {
    await this.delete(STORES.LOCAL_OBJECTS, id);
  }

  async getAllObjects(): Promise<SyncObject[]> {
    return this.getAll(STORES.LOCAL_OBJECTS);
  }

  // ─── Pending Changes ───────────────────────

  async addPendingChange(change: PendingChange): Promise<void> {
    await this.put(STORES.PENDING_CHANGES, change);
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    return this.getAll(STORES.PENDING_CHANGES);
  }

  async removePendingChange(id: string): Promise<void> {
    await this.delete(STORES.PENDING_CHANGES, id);
  }

  async getPendingChangeCount(): Promise<number> {
    return this.count(STORES.PENDING_CHANGES);
  }

  // ─── Transfer Jobs ─────────────────────────

  async addTransferJob(job: TransferJob, direction: "download" | "upload"): Promise<void> {
    const store = direction === "download" ? STORES.DOWNLOAD_JOBS : STORES.UPLOAD_JOBS;
    await this.put(store, job);
  }

  async getTransferJobs(direction: "download" | "upload", status?: string): Promise<TransferJob[]> {
    const store = direction === "download" ? STORES.DOWNLOAD_JOBS : STORES.UPLOAD_JOBS;
    if (status) {
      return this.getByIndex(store, "status", status);
    }
    return this.getAll(store);
  }

  async updateTransferJob(job: TransferJob, direction: "download" | "upload"): Promise<void> {
    const store = direction === "download" ? STORES.DOWNLOAD_JOBS : STORES.UPLOAD_JOBS;
    await this.put(store, job);
  }

  // ─── Checkpoints ───────────────────────────

  async putCheckpoint(checkpoint: SyncCheckpoint): Promise<void> {
    await this.put(STORES.SYNC_CHECKPOINTS, checkpoint);
  }

  async getCheckpoints(): Promise<SyncCheckpoint[]> {
    return this.getAll(STORES.SYNC_CHECKPOINTS);
  }

  // ─── Hydration ─────────────────────────────

  async putHydration(record: HydrationRecord): Promise<void> {
    await this.put(STORES.HYDRATION_STATE, record);
  }

  async getHydration(objectId: string): Promise<HydrationRecord | undefined> {
    return this.get(STORES.HYDRATION_STATE, objectId);
  }

  async getHydrationByState(state: HydrationState): Promise<HydrationRecord[]> {
    return this.getByIndex(STORES.HYDRATION_STATE, "state", state);
  }

  // ─── Device Prefs ─────────────────────────

  async putDevicePrefs(prefs: DeviceSyncPrefs): Promise<void> {
    await this.put(STORES.DEVICE_SYNC_PREFS, prefs);
  }

  async getDevicePrefs(deviceId: string): Promise<DeviceSyncPrefs | undefined> {
    return this.get(STORES.DEVICE_SYNC_PREFS, deviceId);
  }

  // ─── Maintenance ──────────────────────────

  /** Clear all data (for full resync) */
  async clearAll(): Promise<void> {
    for (const storeName of Object.values(STORES)) {
      await this.clear(storeName);
    }
  }

  /** Get database stats */
  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    for (const storeName of Object.values(STORES)) {
      stats[storeName] = await this.count(storeName);
    }
    return stats;
  }

  // ─── Generic CRUD Helpers ─────────────────

  private async put(storeName: string, value: unknown): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    if (!this.db) return undefined;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  private async getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const index = tx.objectStore(storeName).index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  private async delete(storeName: string, key: IDBValidKey): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async clear(storeName: string): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async count(storeName: string): Promise<number> {
    if (!this.db) return 0;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}

/** Singleton sync cache database */
export const syncCacheDB = new SyncCacheDB();
