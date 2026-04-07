import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Offline Mode with Sync Engine
// Full IndexedDB cache + background sync when reconnected
// ═══════════════════════════════════════════════════════════════

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, any>;
  timestamp: number;
  retries: number;
  synced: boolean;
}

export interface OfflineState {
  isOnline: boolean;
  queueLength: number;
  lastSyncAt: Date | null;
  syncInProgress: boolean;
  cachedTables: string[];
}

const DB_NAME = 'sita-os-offline';
const DB_VERSION = 1;
const SYNC_QUEUE_STORE = 'sync_queue';
const CACHE_STORE = 'cache';

class OfflineSyncEngine {
  private db: IDBDatabase | null = null;
  private listeners: Set<(state: OfflineState) => void> = new Set();
  private state: OfflineState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    queueLength: 0,
    lastSyncAt: null,
    syncInProgress: false,
    cachedTables: [],
  };

  async initialize(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const store = db.createObjectStore(CACHE_STORE, { keyPath: 'cacheKey' });
          store.createIndex('table', 'table', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.setupNetworkListeners();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(table: string, data: any[]): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);

    for (const item of data) {
      store.put({
        cacheKey: `${table}_${item.id}`,
        table,
        data: item,
        timestamp: Date.now(),
      });
    }

    if (!this.state.cachedTables.includes(table)) {
      this.state.cachedTables.push(table);
      this.notify();
    }
  }

  async getCachedData(table: string): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db!.transaction(CACHE_STORE, 'readonly');
      const store = tx.objectStore(CACHE_STORE);
      const index = store.index('table');
      const request = index.getAll(table);

      request.onsuccess = () => {
        resolve((request.result || []).map((r: any) => r.data));
      };
      request.onerror = () => resolve([]);
    });
  }

  async queueOperation(table: string, operation: 'insert' | 'update' | 'delete', data: Record<string, any>): Promise<void> {
    if (!this.db) return;

    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0,
      synced: false,
    };

    const tx = this.db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    tx.objectStore(SYNC_QUEUE_STORE).put(item);

    this.state.queueLength++;
    this.notify();

    // Attempt immediate sync if online
    if (this.state.isOnline) {
      this.syncQueue();
    }
  }

  async syncQueue(): Promise<{ synced: number; failed: number }> {
    if (!this.db || this.state.syncInProgress || !this.state.isOnline) {
      return { synced: 0, failed: 0 };
    }

    this.state.syncInProgress = true;
    this.notify();

    let synced = 0;
    let failed = 0;

    try {
      const items = await this.getPendingItems();
      const { supabase } = await import('@/integrations/supabase/client');

      for (const item of items) {
        try {
          let error;
          switch (item.operation) {
            case 'insert':
              ({ error } = await fromTable(item.table as any).insert(item.data as any));
              break;
            case 'update':
              ({ error } = await fromTable(item.table as any).update(item.data as any).eq('id', item.data.id));
              break;
            case 'delete':
              ({ error } = await fromTable(item.table as any).delete().eq('id', item.data.id));
              break;
          }

          if (!error) {
            item.synced = true;
            await this.updateQueueItem(item);
            synced++;
          } else {
            item.retries++;
            await this.updateQueueItem(item);
            failed++;
          }
        } catch {
          item.retries++;
          await this.updateQueueItem(item);
          failed++;
        }
      }

      this.state.lastSyncAt = new Date();
      this.state.queueLength = Math.max(0, this.state.queueLength - synced);
    } finally {
      this.state.syncInProgress = false;
      this.notify();
    }

    return { synced, failed };
  }

  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): OfflineState {
    return { ...this.state };
  }

  private async getPendingItems(): Promise<SyncQueueItem[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db!.transaction(SYNC_QUEUE_STORE, 'readonly');
      const request = tx.objectStore(SYNC_QUEUE_STORE).getAll();
      request.onsuccess = () => {
        resolve((request.result || []).filter((i: SyncQueueItem) => !i.synced && i.retries < 5));
      };
      request.onerror = () => resolve([]);
    });
  }

  private async updateQueueItem(item: SyncQueueItem): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    tx.objectStore(SYNC_QUEUE_STORE).put(item);
  }

  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.notify();
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.notify();
    });
  }

  private notify(): void {
    this.listeners.forEach((l) => l({ ...this.state }));
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
