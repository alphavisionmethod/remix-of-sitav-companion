// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Sync Queue Manager
// In-memory queue with durable persistence hook (overridable).
// ═══════════════════════════════════════════════════════════════

import type {
  OfflineMutation,
  OfflineMutationStatus,
  OfflineDomain,
  ConflictPolicy,
} from "../contracts/offline-sync-contract";
import { getOfflinePolicy } from "../contracts/offline-sync-contract";

export interface QueuePersistence {
  load(): Promise<OfflineMutation[]>;
  save(mutations: OfflineMutation[]): Promise<void>;
}

export class SyncQueueManager {
  private queue: OfflineMutation[] = [];
  private persistence: QueuePersistence | null = null;
  private subscribers = new Set<(q: ReadonlyArray<OfflineMutation>) => void>();

  attachPersistence(p: QueuePersistence) {
    this.persistence = p;
  }

  async hydrate(): Promise<void> {
    if (!this.persistence) return;
    this.queue = await this.persistence.load();
    this.broadcast();
  }

  async enqueue(input: {
    domain: OfflineDomain;
    verb: string;
    payload: Record<string, unknown>;
    optimisticSnapshot?: Record<string, unknown>;
    conflictPolicy?: ConflictPolicy;
  }): Promise<OfflineMutation> {
    const policy = getOfflinePolicy(input.domain);
    if (!policy.mutationsAllowed) {
      throw new Error(`Domain "${input.domain}" does not allow offline mutations.`);
    }
    const mutation: OfflineMutation = {
      id: `${input.domain}:${input.verb}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      domain: input.domain,
      verb: input.verb,
      payload: input.payload,
      optimisticSnapshot: input.optimisticSnapshot,
      conflictPolicy: input.conflictPolicy ?? policy.conflictPolicy,
      enqueuedAt: new Date().toISOString(),
      attempts: 0,
      status: "queued",
    };
    this.queue.push(mutation);
    await this.persist();
    this.broadcast();
    return mutation;
  }

  list(filter?: { domain?: OfflineDomain; status?: OfflineMutationStatus }): ReadonlyArray<OfflineMutation> {
    return this.queue.filter((m) =>
      (!filter?.domain || m.domain === filter.domain) &&
      (!filter?.status || m.status === filter.status),
    );
  }

  async updateStatus(id: string, status: OfflineMutationStatus, error?: string): Promise<void> {
    const m = this.queue.find((x) => x.id === id);
    if (!m) return;
    m.status = status;
    m.attempts += status === "in-flight" ? 1 : 0;
    if (error) m.lastError = error;
    await this.persist();
    this.broadcast();
  }

  async remove(id: string): Promise<void> {
    this.queue = this.queue.filter((x) => x.id !== id);
    await this.persist();
    this.broadcast();
  }

  subscribe(fn: (q: ReadonlyArray<OfflineMutation>) => void): () => void {
    this.subscribers.add(fn);
    fn(this.queue);
    return () => this.subscribers.delete(fn);
  }

  private async persist() {
    if (this.persistence) await this.persistence.save(this.queue);
  }

  private broadcast() {
    this.subscribers.forEach((fn) => fn(this.queue));
  }
}

export const mobileSyncQueue = new SyncQueueManager();
