// ═══════════════════════════════════════════════════════════════
// SITA OS — Publish Event Service
// In-memory pub/sub publisher with durable persistence wiring
// ═══════════════════════════════════════════════════════════════

import type { SitaEvent } from "@/packages/event-types";
import type { EventEnvelope } from "./event-envelope";
import { persistEvent, persistDeadLetter as persistDeadLetterEntry } from "@/lib/persistence/event-bus-persistence";

type EventHandler = (event: SitaEvent, envelope: EventEnvelope) => void;

interface Subscription {
  id: string;
  eventType: string | "*";
  domain?: string;
  handler: EventHandler;
}

const subscriptions: Subscription[] = [];
const eventLog: EventEnvelope[] = [];

export function publish(envelope: EventEnvelope): { delivered: number; errors: string[] } {
  eventLog.push(envelope);
  const event = envelope.event as unknown as SitaEvent;
  let delivered = 0;
  const errors: string[] = [];

  const matching = subscriptions.filter((sub) => {
    if (sub.eventType !== "*" && sub.eventType !== event.type) return false;
    if (sub.domain && sub.domain !== event.domain) return false;
    return true;
  });

  for (const sub of matching) {
    try {
      sub.handler(event, envelope);
      delivered++;
    } catch (err) {
      errors.push(`Handler ${sub.id} failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  // Fire-and-forget persistence — don't block the publish path
  persistEvent({
    id: envelope.id ?? crypto.randomUUID(),
    topic: event.type ?? "unknown",
    payload: event as unknown as Record<string, unknown>,
    source: (event as any).source ?? "event-bus",
    correlationId: envelope.correlationId,
    tenantId: envelope.tenantId,
    metadata: envelope.metadata as Record<string, unknown> | undefined,
    timestamp: envelope.timestamp ?? new Date().toISOString(),
  } as any, { domain: event.domain }).catch(() => {});

  // Persist dead letters on handler errors
  if (errors.length > 0 && delivered === 0) {
    persistDeadLetterEntry({
      event: {
        id: envelope.id ?? crypto.randomUUID(),
        topic: event.type ?? "unknown",
        payload: event as unknown as Record<string, unknown>,
        source: "event-bus",
        correlationId: envelope.correlationId,
        timestamp: envelope.timestamp ?? new Date().toISOString(),
      } as any,
      error: errors.join("; "),
      handler: "aggregate",
      failedAt: new Date().toISOString(),
      retryCount: 0,
    }).catch(() => {});
  }

  return { delivered, errors };
}

export function publishBatch(envelopes: EventEnvelope[]): { totalDelivered: number; totalErrors: number } {
  let totalDelivered = 0;
  let totalErrors = 0;
  for (const env of envelopes) {
    const result = publish(env);
    totalDelivered += result.delivered;
    totalErrors += result.errors.length;
  }
  return { totalDelivered, totalErrors };
}

export function getEventLog(limit?: number): EventEnvelope[] {
  const log = [...eventLog].reverse();
  return limit ? log.slice(0, limit) : log;
}

export function getDeadLetterQueue(): EventEnvelope[] {
  return eventLog.filter((e) => e.deadLettered);
}

export { subscriptions as _subscriptions };
