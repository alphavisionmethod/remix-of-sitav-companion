// ═══════════════════════════════════════════════════════════════
// SITA OS — Offline Database (IndexedDB Persistence Layer)
// Cache-first strategy with sync queue for offline mutations
// ═══════════════════════════════════════════════════════════════

const DB_NAME = 'sita-offline';
const DB_VERSION = 1;

interface OfflineAction {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

interface CachedData {
  key: string;
  data: unknown;
  cachedAt: string;
  expiresAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pending-actions')) {
        const store = db.createObjectStore('pending-actions', { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('table', 'table', { unique: false });
      }
      if (!db.objectStoreNames.contains('cached-data')) {
        const store = db.createObjectStore('cached-data', { keyPath: 'key' });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('user-preferences')) {
        db.createObjectStore('user-preferences', { keyPath: 'key' });
      }
    };
  });
}

function tx(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Public API ──────────────────────────────────────────────────

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const store = tx(db, 'cached-data', 'readonly');
    const result = await reqToPromise<CachedData | undefined>(store.get(key));
    db.close();
    if (!result) return null;
    if (new Date(result.expiresAt) < new Date()) {
      await cacheDelete(key);
      return null;
    }
    return result.data as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  data: unknown,
  ttlMs = 5 * 60 * 1000
): Promise<void> {
  try {
    const db = await openDB();
    const store = tx(db, 'cached-data', 'readwrite');
    await reqToPromise(
      store.put({
        key,
        data,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      })
    );
    db.close();
  } catch {
    // Silently fail — offline cache is best-effort
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const db = await openDB();
    const store = tx(db, 'cached-data', 'readwrite');
    await reqToPromise(store.delete(key));
    db.close();
  } catch {}
}

export async function cacheClear(): Promise<void> {
  try {
    const db = await openDB();
    const store = tx(db, 'cached-data', 'readwrite');
    await reqToPromise(store.clear());
    db.close();
  } catch {}
}

// ── Offline Action Queue ────────────────────────────────────────

export async function queueAction(
  table: string,
  operation: OfflineAction['operation'],
  payload: Record<string, unknown>
): Promise<string> {
  const id = crypto.randomUUID();
  const db = await openDB();
  const store = tx(db, 'pending-actions', 'readwrite');
  await reqToPromise(
    store.add({
      id,
      table,
      operation,
      payload,
      createdAt: new Date().toISOString(),
      synced: false,
    })
  );
  db.close();
  return id;
}

export async function getPendingActions(): Promise<OfflineAction[]> {
  const db = await openDB();
  const store = tx(db, 'pending-actions', 'readonly');
  const index = store.index('synced');
  const result = await reqToPromise<OfflineAction[]>(index.getAll(IDBKeyRange.only(0)));
  db.close();
  return result;
}

export async function markActionSynced(id: string): Promise<void> {
  const db = await openDB();
  const store = tx(db, 'pending-actions', 'readwrite');
  const action = await reqToPromise<OfflineAction | undefined>(store.get(id));
  if (action) {
    action.synced = true;
    await reqToPromise(store.put(action));
  }
  db.close();
}

export async function clearSyncedActions(): Promise<void> {
  const db = await openDB();
  const store = tx(db, 'pending-actions', 'readwrite');
  const index = store.index('synced');
  const synced = await reqToPromise<OfflineAction[]>(index.getAll(true));
  for (const a of synced) {
    store.delete(a.id);
  }
  db.close();
}

// ── User Preferences (Offline) ──────────────────────────────────

export async function setPref(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    const store = tx(db, 'user-preferences', 'readwrite');
    await reqToPromise(store.put({ key, value }));
    db.close();
  } catch {}
}

export async function getPref<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const store = tx(db, 'user-preferences', 'readonly');
    const result = await reqToPromise<{ key: string; value: T } | undefined>(
      store.get(key)
    );
    db.close();
    return result?.value ?? null;
  } catch {
    return null;
  }
}

// ── Sync Manager ────────────────────────────────────────────────

type SyncHandler = (action: OfflineAction) => Promise<boolean>;

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startSyncManager(handler: SyncHandler, intervalMs = 30000): void {
  stopSyncManager();

  const runSync = async () => {
    if (!navigator.onLine) return;
    const pending = await getPendingActions();
    for (const action of pending) {
      try {
        const success = await handler(action);
        if (success) {
          await markActionSynced(action.id);
        }
      } catch {
        // Will retry next cycle
      }
    }
    await clearSyncedActions();
  };

  // Run immediately, then on interval
  runSync();
  syncInterval = setInterval(runSync, intervalMs);

  // Also sync when coming back online
  window.addEventListener('online', runSync);
}

export function stopSyncManager(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
