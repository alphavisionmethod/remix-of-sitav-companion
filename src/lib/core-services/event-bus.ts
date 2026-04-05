// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Bus (Durable)
// Client-side event log with subscriptions, dead-letter queue,
// wildcard matching, replay, tenant scoping — NOW with durable
// persistence to os_event_log via Supabase
// ═══════════════════════════════════════════════════════════════

import type { CorrelationContext } from "@/packages/contracts";
import { persistEvent, persistDeadLetter, fetchPersistedEvents } from "@/lib/persistence/event-bus-persistence";

export type { CorrelationContext };

export interface BusEvent {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  timestamp: number;
  source: string;
  correlationId?: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface DeadLetterEntry {
  event: BusEvent;
  handler: string;
  error: string;
  timestamp: number;
  retryCount: number;
}

export type EventHandler = (event: BusEvent) => void | Promise<void>;

interface Subscription {
  id: string;
  pattern: string;
  handler: EventHandler;
  handlerName: string;
}

export class EventBus {
  private log: BusEvent[] = [];
  private subscriptions: Subscription[] = [];
  private deadLetterQueue: DeadLetterEntry[] = [];
  private maxLogSize = 10000;
  private maxDLQSize = 500;
  private persistenceEnabled = true;

  /** Publish an event — appended immutably to log, persisted durably, then dispatched */
  async publish(
    topic: string,
    payload: Record<string, unknown>,
    options?: {
      source?: string;
      correlationId?: string;
      causationId?: string;
      tenantId?: string;
      metadata?: Record<string, unknown>;
      domain?: string;
      idempotencyKey?: string;
      skipPersist?: boolean;
    }
  ): Promise<BusEvent> {
    const event: BusEvent = {
      id: crypto.randomUUID(),
      topic,
      payload,
      timestamp: Date.now(),
      source: options?.source ?? "unknown",
      correlationId: options?.correlationId,
      tenantId: options?.tenantId,
      metadata: options?.metadata,
    };

    // Immutable in-memory append
    this.log = [...this.log, event];
    if (this.log.length > this.maxLogSize) {
      this.log = this.log.slice(-this.maxLogSize);
    }

    // Durable persistence (fire-and-forget, non-blocking)
    if (this.persistenceEnabled && !options?.skipPersist) {
      persistEvent(event, {
        causationId: options?.causationId,
        domain: options?.domain,
        idempotencyKey: options?.idempotencyKey,
      }).catch(() => { /* silent — in-memory log is primary */ });
    }

    await this.dispatch(event);
    return event;
  }

  /** Subscribe to a topic pattern. Use "*" for all events, "domain.*" for prefix match */
  subscribe(pattern: string, handler: EventHandler, handlerName?: string): string {
    const id = crypto.randomUUID();
    this.subscriptions.push({ id, pattern, handler, handlerName: handlerName ?? `handler-${id.slice(0, 8)}` });
    return id;
  }

  /** Unsubscribe by subscription ID */
  unsubscribe(subscriptionId: string): boolean {
    const before = this.subscriptions.length;
    this.subscriptions = this.subscriptions.filter(s => s.id !== subscriptionId);
    return this.subscriptions.length < before;
  }

  /** Replay events from the log, optionally filtered by topic or time range */
  async replay(options?: { topic?: string; since?: number; until?: number; tenantId?: string }): Promise<BusEvent[]> {
    let events = [...this.log];

    if (options?.topic) events = events.filter(e => this.matchesTopic(e.topic, options.topic!));
    if (options?.since) events = events.filter(e => e.timestamp >= options.since!);
    if (options?.until) events = events.filter(e => e.timestamp <= options.until!);
    if (options?.tenantId) events = events.filter(e => e.tenantId === options.tenantId);

    for (const event of events) {
      await this.dispatch(event);
    }

    return events;
  }

  /** Replay from durable storage (survives refresh) */
  async replayFromStorage(options?: { topic?: string; since?: string; limit?: number }): Promise<BusEvent[]> {
    const persisted = await fetchPersistedEvents({
      topic: options?.topic,
      since: options?.since,
      limit: options?.limit ?? 100,
    });

    const events: BusEvent[] = persisted.map(p => ({
      id: p.id,
      topic: p.topic,
      payload: p.payload,
      timestamp: new Date(p.created_at).getTime(),
      source: p.source,
      correlationId: p.correlation_id ?? undefined,
      tenantId: p.tenant_id ?? undefined,
      metadata: p.metadata ?? undefined,
    }));

    for (const event of events) {
      await this.dispatch(event);
    }

    return events;
  }

  /** Get the immutable event log (copy) */
  getLog(limit?: number): BusEvent[] {
    const result = [...this.log];
    return limit ? result.slice(-limit) : result;
  }

  /** Get the dead-letter queue */
  getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  /** Retry a dead-letter entry */
  async retryDeadLetter(entryIndex: number): Promise<boolean> {
    const entry = this.deadLetterQueue[entryIndex];
    if (!entry) return false;

    try {
      await this.dispatch(entry.event);
      this.deadLetterQueue = this.deadLetterQueue.filter((_, i) => i !== entryIndex);
      return true;
    } catch {
      entry.retryCount++;
      return false;
    }
  }

  /** Get event count by topic */
  getTopicCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.log) {
      counts[event.topic] = (counts[event.topic] ?? 0) + 1;
    }
    return counts;
  }

  /** Clear all subscriptions and optionally the log */
  clear(clearLog = false): void {
    this.subscriptions = [];
    if (clearLog) {
      this.log = [];
      this.deadLetterQueue = [];
    }
  }

  /** Enable/disable persistence (useful for tests) */
  setPersistence(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }

  // ── Private ───────────────────────────────────────────────────

  private async dispatch(event: BusEvent): Promise<void> {
    const matching = this.subscriptions.filter(s => this.matchesTopic(event.topic, s.pattern));

    for (const sub of matching) {
      try {
        await sub.handler(event);
      } catch (err) {
        const entry: DeadLetterEntry = {
          event,
          handler: sub.handlerName,
          error: err instanceof Error ? err.message : String(err),
          timestamp: Date.now(),
          retryCount: 0,
        };
        this.deadLetterQueue = [...this.deadLetterQueue, entry];
        if (this.deadLetterQueue.length > this.maxDLQSize) {
          this.deadLetterQueue = this.deadLetterQueue.slice(-this.maxDLQSize);
        }

        // Persist dead letter durably
        if (this.persistenceEnabled) {
          persistDeadLetter(entry).catch(() => {});
        }
      }
    }
  }

  private matchesTopic(eventTopic: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern.endsWith(".*")) {
      return eventTopic.startsWith(pattern.slice(0, -1));
    }
    return eventTopic === pattern;
  }
}

// ── Singleton factory ───────────────────────────────────────────

let globalBus: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!globalBus) globalBus = new EventBus();
  return globalBus;
}

export function createEventBus(): EventBus {
  return new EventBus();
}
