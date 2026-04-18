// ═══════════════════════════════════════════════════════════════
// Nova SDK — File System API
// Permission-controlled file operations backed by IndexedDB
// ═══════════════════════════════════════════════════════════════

import type { NovaPermissionId } from "../core/manifest";

const DB_NAME = "nova-fs";
const STORE_NAME = "files";
const DB_VERSION = 1;

export class PermissionDeniedError extends Error {
  constructor(op: string) {
    super(`NovaFS: Permission denied for "${op}". Check manifest permissions.`);
    this.name = "PermissionDeniedError";
  }
}

interface FSEntry {
  path: string;
  data: string;
  type: "file" | "directory";
  createdAt: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "path" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class NovaFS {
  private permissions: Set<NovaPermissionId>;

  constructor(permissions: NovaPermissionId[]) {
    this.permissions = new Set(permissions);
  }

  private checkRead() {
    if (!this.permissions.has("files.read")) throw new PermissionDeniedError("files.read");
  }

  private checkWrite() {
    if (!this.permissions.has("files.write")) throw new PermissionDeniedError("files.write");
  }

  async readFile(path: string): Promise<string | null> {
    this.checkRead();
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(path);
      req.onsuccess = () => resolve((req.result as FSEntry)?.data ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async writeFile(path: string, data: string): Promise<void> {
    this.checkWrite();
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const now = Date.now();
      store.put({ path, data, type: "file", createdAt: now, updatedAt: now } as FSEntry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteFile(path: string): Promise<void> {
    this.checkWrite();
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(path);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listDir(dirPath: string): Promise<string[]> {
    this.checkRead();
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const entries = (req.result as FSEntry[])
          .filter(e => e.path.startsWith(dirPath) && e.path !== dirPath)
          .map(e => e.path);
        resolve(entries);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async exists(path: string): Promise<boolean> {
    this.checkRead();
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(path);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
