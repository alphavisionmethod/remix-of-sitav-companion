// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Sync Queue · localStorage Persistence
// Durable persistence for the mobile mutation queue.
// In a Capacitor build this can be swapped for SQLite/Filesystem.
// ═══════════════════════════════════════════════════════════════

import type { OfflineMutation } from "../contracts/offline-sync-contract";
import type { QueuePersistence } from "./sync-queue-manager";

const STORAGE_KEY = "sita.mobile.syncQueue.v1";

export class LocalStorageQueuePersistence implements QueuePersistence {
  async load(): Promise<OfflineMutation[]> {
    if (typeof window === "undefined" || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as OfflineMutation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async save(mutations: OfflineMutation[]): Promise<void> {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mutations));
    } catch {
      // quota exceeded — drop oldest succeeded
      try {
        const trimmed = mutations.filter((m) => m.status !== "succeeded").slice(-200);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        /* swallow */
      }
    }
  }
}

export const localStorageQueuePersistence = new LocalStorageQueuePersistence();
