// ═══════════════════════════════════════════════════════════════
// SITA OS — Offline Mutation Queue
// Queues mutations when offline, replays when back online
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface QueuedMutation {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  queuedAt: string;
  retries: number;
  lastError?: string;
}

const STORAGE_KEY = "sita-offline-queue";

export class OfflineQueueService {
  private queue: QueuedMutation[] = [];
  private isReplaying = false;
  private replayFn: ((mutation: QueuedMutation) => Promise<boolean>) | null = null;

  constructor() {
    this.loadFromStorage();
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.replay());
    }
  }

  setReplayHandler(fn: (mutation: QueuedMutation) => Promise<boolean>): void {
    this.replayFn = fn;
  }

  enqueue(table: string, operation: QueuedMutation["operation"], payload: Record<string, unknown>): void {
    const mutation: QueuedMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      table,
      operation,
      payload,
      queuedAt: new Date().toISOString(),
      retries: 0,
    };
    this.queue.push(mutation);
    this.saveToStorage();

    // If online, try to replay immediately
    if (navigator.onLine) {
      this.replay();
    }
  }

  async replay(): Promise<{ replayed: number; failed: number }> {
    if (this.isReplaying || !this.replayFn || this.queue.length === 0) {
      return { replayed: 0, failed: 0 };
    }

    this.isReplaying = true;
    let replayed = 0;
    let failed = 0;
    const remaining: QueuedMutation[] = [];

    for (const mutation of this.queue) {
      try {
        const ok = await this.replayFn(mutation);
        if (ok) {
          replayed++;
        } else {
          mutation.retries++;
          if (mutation.retries < 5) {
            remaining.push(mutation);
          }
          failed++;
        }
      } catch (err) {
        mutation.retries++;
        mutation.lastError = err instanceof Error ? err.message : String(err);
        if (mutation.retries < 5) {
          remaining.push(mutation);
        }
        failed++;
      }
    }

    this.queue = remaining;
    this.saveToStorage();
    this.isReplaying = false;

    return { replayed, failed };
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getQueue(): readonly QueuedMutation[] {
    return this.queue;
  }

  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.queue = JSON.parse(raw);
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage full — drop oldest
      if (this.queue.length > 50) {
        this.queue = this.queue.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      }
    }
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("offline-queue", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      queue: this.queue,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.queue) this.queue = state.queue as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("offline-queue");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Factory ─────────────────────────────────────────────────────

let _instance: OfflineQueueService | null = null;

export function getOfflineQueueService(): OfflineQueueService {
  if (!_instance) _instance = new OfflineQueueService();
  return _instance;
}
