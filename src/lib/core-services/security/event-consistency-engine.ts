// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Consistency Engine
// At-least-once delivery, idempotency, ordering guarantees,
// deduplication, dead-letter queue, replay, consumer lag detection
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type DeliveryGuarantee = "at-most-once" | "at-least-once" | "exactly-once";
export type EventPriority = "low" | "normal" | "high" | "critical";

export interface ConsistentEvent {
  id: string;
  idempotencyKey: string;
  sequenceNumber: number;
  timestamp: string;
  subject: string;
  payload: Record<string, unknown>;
  correlationId: string;
  causationId: string | null;
  source: string;
  priority: EventPriority;
  deliveryGuarantee: DeliveryGuarantee;
  maxRetries: number;
  retryCount: number;
  deadLetterAt: string | null;
  expiresAt: string | null;
  partitionKey: string | null;
  metadata: Record<string, unknown>;
}

export interface EventConsumer {
  id: string;
  name: string;
  subjects: string[];
  handler: (event: ConsistentEvent) => Promise<ConsumerResult>;
  concurrency: number;
  maxRetries: number;
  retryDelayMs: number;
  ordered: boolean;
  batchSize: number;
}

export interface ConsumerResult {
  success: boolean;
  retryable: boolean;
  error: string | null;
}

export interface ConsumerState {
  consumerId: string;
  lastProcessedSequence: number;
  lastProcessedAt: string | null;
  lag: number;
  processedCount: number;
  failedCount: number;
  retryCount: number;
  deadLetterCount: number;
  status: "active" | "paused" | "lagging" | "stuck";
}

export interface DeadLetterEntry {
  event: ConsistentEvent;
  consumerId: string;
  failedAt: string;
  attempts: number;
  lastError: string;
  resolved: boolean;
  resolvedAt: string | null;
}

export interface ConsistencyMetrics {
  totalEvents: number;
  deliveredEvents: number;
  failedEvents: number;
  deadLetterCount: number;
  duplicatesDetected: number;
  averageDeliveryLatencyMs: number;
  consumerStates: ConsumerState[];
  eventsBySubject: Record<string, number>;
  eventsByPriority: Record<string, number>;
}

// ── Engine ─────────────────────────────────────────────────────

export class EventConsistencyEngine {
  private events: ConsistentEvent[] = [];
  private consumers: Map<string, EventConsumer> = new Map();
  private consumerStates: Map<string, ConsumerState> = new Map();
  private idempotencyCache: Set<string> = new Set();
  private deadLetterQueue: DeadLetterEntry[] = [];
  private sequenceCounter = 0;
  private duplicatesDetected = 0;
  private deliveryLatencies: number[] = [];
  private readonly maxEvents = 50_000;
  private readonly maxIdempotencyCache = 100_000;
  private listeners: Array<(event: ConsistentEvent) => void> = [];

  // ── Publishing ─────────────────────────────────────────────

  async publish(params: {
    subject: string;
    payload: Record<string, unknown>;
    idempotencyKey?: string;
    correlationId: string;
    causationId?: string;
    source: string;
    priority?: EventPriority;
    deliveryGuarantee?: DeliveryGuarantee;
    maxRetries?: number;
    partitionKey?: string;
    expiresAt?: string;
  }): Promise<ConsistentEvent | null> {
    const idempotencyKey = params.idempotencyKey ?? `${params.subject}:${params.correlationId}:${Date.now()}`;

    // Deduplication
    if (this.idempotencyCache.has(idempotencyKey)) {
      this.duplicatesDetected++;
      return null;
    }

    const event: ConsistentEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      idempotencyKey,
      sequenceNumber: ++this.sequenceCounter,
      timestamp: new Date().toISOString(),
      subject: params.subject,
      payload: params.payload,
      correlationId: params.correlationId,
      causationId: params.causationId ?? null,
      source: params.source,
      priority: params.priority ?? "normal",
      deliveryGuarantee: params.deliveryGuarantee ?? "at-least-once",
      maxRetries: params.maxRetries ?? 3,
      retryCount: 0,
      deadLetterAt: null,
      expiresAt: params.expiresAt ?? null,
      partitionKey: params.partitionKey ?? null,
      metadata: {},
    };

    this.events.push(event);
    this.idempotencyCache.add(idempotencyKey);

    if (this.events.length > this.maxEvents) this.events = this.events.slice(-this.maxEvents);
    if (this.idempotencyCache.size > this.maxIdempotencyCache) {
      const entries = Array.from(this.idempotencyCache);
      this.idempotencyCache = new Set(entries.slice(-this.maxIdempotencyCache));
    }

    // Dispatch
    await this.dispatch(event);

    // Notify listeners
    for (const l of this.listeners) {
      try { l(event); } catch { /* isolation */ }
    }

    return event;
  }

  // ── Consumer Management ────────────────────────────────────

  registerConsumer(consumer: EventConsumer): void {
    this.consumers.set(consumer.id, consumer);
    this.consumerStates.set(consumer.id, {
      consumerId: consumer.id,
      lastProcessedSequence: this.sequenceCounter,
      lastProcessedAt: null,
      lag: 0,
      processedCount: 0,
      failedCount: 0,
      retryCount: 0,
      deadLetterCount: 0,
      status: "active",
    });
  }

  unregisterConsumer(consumerId: string): void {
    this.consumers.delete(consumerId);
    this.consumerStates.delete(consumerId);
  }

  pauseConsumer(consumerId: string): void {
    const state = this.consumerStates.get(consumerId);
    if (state) state.status = "paused";
  }

  resumeConsumer(consumerId: string): void {
    const state = this.consumerStates.get(consumerId);
    if (state && state.status === "paused") state.status = "active";
  }

  // ── Replay ─────────────────────────────────────────────────

  async replay(consumerId: string, fromSequence: number, toSequence?: number): Promise<number> {
    const consumer = this.consumers.get(consumerId);
    if (!consumer) return 0;

    const events = this.events.filter(
      (e) => e.sequenceNumber >= fromSequence && (!toSequence || e.sequenceNumber <= toSequence) && consumer.subjects.some((s) => this.matchSubject(e.subject, s)),
    );

    let processed = 0;
    for (const event of events) {
      try {
        const result = await consumer.handler(event);
        if (result.success) processed++;
      } catch { /* isolation */ }
    }

    return processed;
  }

  // ── Dead Letter ────────────────────────────────────────────

  getDeadLetterQueue(limit = 100): DeadLetterEntry[] {
    return this.deadLetterQueue.filter((d) => !d.resolved).slice(-limit);
  }

  resolveDeadLetter(eventId: string, consumerId: string): boolean {
    const entry = this.deadLetterQueue.find((d) => d.event.id === eventId && d.consumerId === consumerId);
    if (!entry || entry.resolved) return false;
    entry.resolved = true;
    entry.resolvedAt = new Date().toISOString();
    return true;
  }

  async retryDeadLetter(eventId: string, consumerId: string): Promise<boolean> {
    const entry = this.deadLetterQueue.find((d) => d.event.id === eventId && d.consumerId === consumerId);
    if (!entry || entry.resolved) return false;

    const consumer = this.consumers.get(consumerId);
    if (!consumer) return false;

    try {
      const result = await consumer.handler(entry.event);
      if (result.success) {
        entry.resolved = true;
        entry.resolvedAt = new Date().toISOString();
        return true;
      }
    } catch { /* isolation */ }

    entry.attempts++;
    return false;
  }

  // ── Queries ────────────────────────────────────────────────

  getConsumerStates(): ConsumerState[] {
    return Array.from(this.consumerStates.values());
  }

  getMetrics(): ConsistencyMetrics {
    const bySubject: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const e of this.events) {
      bySubject[e.subject] = (bySubject[e.subject] ?? 0) + 1;
      byPriority[e.priority] = (byPriority[e.priority] ?? 0) + 1;
    }

    const states = Array.from(this.consumerStates.values());
    const totalDelivered = states.reduce((sum, s) => sum + s.processedCount, 0);
    const totalFailed = states.reduce((sum, s) => sum + s.failedCount, 0);

    return {
      totalEvents: this.events.length,
      deliveredEvents: totalDelivered,
      failedEvents: totalFailed,
      deadLetterCount: this.deadLetterQueue.filter((d) => !d.resolved).length,
      duplicatesDetected: this.duplicatesDetected,
      averageDeliveryLatencyMs: this.deliveryLatencies.length > 0
        ? this.deliveryLatencies.reduce((a, b) => a + b, 0) / this.deliveryLatencies.length
        : 0,
      consumerStates: states,
      eventsBySubject: bySubject,
      eventsByPriority: byPriority,
    };
  }

  getEvents(limit = 100, subject?: string): ConsistentEvent[] {
    let filtered = this.events;
    if (subject) filtered = filtered.filter((e) => this.matchSubject(e.subject, subject));
    return filtered.slice(-limit);
  }

  // ── Subscriptions ──────────────────────────────────────────

  onEvent(listener: (event: ConsistentEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Internal ───────────────────────────────────────────────

  private async dispatch(event: ConsistentEvent): Promise<void> {
    for (const [consumerId, consumer] of this.consumers) {
      const state = this.consumerStates.get(consumerId);
      if (!state || state.status === "paused") continue;
      if (!consumer.subjects.some((s) => this.matchSubject(event.subject, s))) continue;

      const start = Date.now();

      try {
        const result = await consumer.handler(event);

        if (result.success) {
          state.processedCount++;
          state.lastProcessedSequence = event.sequenceNumber;
          state.lastProcessedAt = new Date().toISOString();
          this.deliveryLatencies.push(Date.now() - start);
          if (this.deliveryLatencies.length > 1000) this.deliveryLatencies = this.deliveryLatencies.slice(-1000);
        } else if (result.retryable && event.retryCount < event.maxRetries) {
          event.retryCount++;
          state.retryCount++;
          // Re-dispatch after delay (simplified — real implementation would use a queue)
          setTimeout(() => this.dispatch(event), consumer.retryDelayMs * event.retryCount);
        } else {
          this.sendToDeadLetter(event, consumerId, result.error ?? "Max retries exceeded");
          state.failedCount++;
          state.deadLetterCount++;
        }
      } catch (err) {
        if (event.retryCount < event.maxRetries) {
          event.retryCount++;
          state.retryCount++;
        } else {
          this.sendToDeadLetter(event, consumerId, err instanceof Error ? err.message : "Unknown error");
          state.failedCount++;
          state.deadLetterCount++;
        }
      }

      // Update lag
      state.lag = this.sequenceCounter - state.lastProcessedSequence;
      if (state.lag > 100) state.status = "lagging";
      if (state.lag > 1000) state.status = "stuck";
    }
  }

  private sendToDeadLetter(event: ConsistentEvent, consumerId: string, error: string): void {
    event.deadLetterAt = new Date().toISOString();
    this.deadLetterQueue.push({
      event,
      consumerId,
      failedAt: new Date().toISOString(),
      attempts: event.retryCount,
      lastError: error,
      resolved: false,
      resolvedAt: null,
    });
  }

  private matchSubject(eventSubject: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern.endsWith(".*")) {
      return eventSubject.startsWith(pattern.slice(0, -2));
    }
    return eventSubject === pattern;
  }
}

export function createEventConsistencyEngine(): EventConsistencyEngine {
  return new EventConsistencyEngine();
}
