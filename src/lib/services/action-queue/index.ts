// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Queue Service
// Merge target: workflow-engine
// Priority-ordered queue for deferred and scheduled actions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type ActionPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';
export type ActionStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'dead-lettered';

export interface QueuedAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  priority: ActionPriority;
  status: ActionStatus;
  scheduledAt?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  retries: number;
  maxRetries: number;
  error?: string;
  correlationId?: string;
  domain: string;
  userId: string;
  approvalRequired: boolean;
  approvalId?: string;
  deadlineAt?: string;
  metadata: Record<string, unknown>;
}

export interface QueueStats {
  total: number;
  byStatus: Record<ActionStatus, number>;
  byPriority: Record<ActionPriority, number>;
  avgWaitMs: number;
  avgProcessMs: number;
  deadLetterCount: number;
  oldestQueuedAt?: string;
}

const PRIORITY_ORDER: Record<ActionPriority, number> = { critical: 0, high: 1, normal: 2, low: 3, background: 4 };

export class ActionQueueService {
  private queue: QueuedAction[] = [];
  private idCounter = 0;

  enqueue(action: Omit<QueuedAction, 'id' | 'status' | 'createdAt' | 'retries'>): QueuedAction {
    const item: QueuedAction = {
      ...action, id: `aq-${++this.idCounter}-${Date.now()}`,
      status: 'queued', createdAt: new Date().toISOString(), retries: 0,
    };
    this.queue.push(item);
    this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return item;
  }

  dequeue(): QueuedAction | null {
    const now = new Date().toISOString();
    const idx = this.queue.findIndex(a => a.status === 'queued' && (!a.scheduledAt || a.scheduledAt <= now));
    if (idx === -1) return null;
    this.queue[idx].status = 'processing';
    this.queue[idx].startedAt = now;
    return this.queue[idx];
  }

  complete(id: string, result?: Record<string, unknown>): boolean {
    const a = this.queue.find(x => x.id === id);
    if (!a || a.status !== 'processing') return false;
    a.status = 'completed';
    a.completedAt = new Date().toISOString();
    if (result) a.metadata = { ...a.metadata, result };
    return true;
  }

  fail(id: string, error: string): boolean {
    const a = this.queue.find(x => x.id === id);
    if (!a) return false;
    a.retries++;
    if (a.retries >= a.maxRetries) { a.status = 'dead-lettered'; a.error = error; }
    else { a.status = 'queued'; a.error = error; }
    return true;
  }

  cancel(id: string): boolean {
    const a = this.queue.find(x => x.id === id && x.status === 'queued');
    if (!a) return false;
    a.status = 'cancelled';
    return true;
  }

  getById(id: string): QueuedAction | undefined { return this.queue.find(x => x.id === id); }
  getPending(): QueuedAction[] { return this.queue.filter(a => a.status === 'queued'); }
  getDeadLetter(): QueuedAction[] { return this.queue.filter(a => a.status === 'dead-lettered'); }

  getStats(): QueueStats {
    const byStatus = {} as Record<ActionStatus, number>;
    const byPriority = {} as Record<ActionPriority, number>;
    this.queue.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; byPriority[a.priority] = (byPriority[a.priority] || 0) + 1; });
    return {
      total: this.queue.length, byStatus, byPriority,
      avgWaitMs: 0, avgProcessMs: 0,
      deadLetterCount: this.queue.filter(a => a.status === 'dead-lettered').length,
      oldestQueuedAt: this.queue.find(a => a.status === 'queued')?.createdAt,
    };
  }

  purgeCompleted(olderThanMs: number = 86400000): number {
    const cutoff = new Date(Date.now() - olderThanMs).toISOString();
    const before = this.queue.length;
    this.queue = this.queue.filter(a => a.status !== 'completed' || !a.completedAt || a.completedAt > cutoff);
    return before - this.queue.length;
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("action-queue", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      queue: this.queue,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.queue) this.queue = state.queue as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("action-queue");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createActionQueue = () => new ActionQueueService();

