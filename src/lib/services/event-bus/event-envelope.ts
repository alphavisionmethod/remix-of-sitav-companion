// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Envelope Factory
// Creates EventEnvelope with auto-generated IDs, correlation
// ═══════════════════════════════════════════════════════════════

import type { BaseEvent, EventMetadata } from "@/packages/event-types";
import type { DomainId } from "@/packages/contracts";

export interface EventEnvelope<T extends BaseEvent = BaseEvent> {
  event: T;
  enqueuedAt: string;
  deliveredAt?: string;
  retryCount: number;
  maxRetries: number;
  deadLettered: boolean;
}

export function createEventEnvelope<T extends BaseEvent>(
  type: string,
  domain: DomainId,
  tenantId: string,
  payload: T extends BaseEvent ? T["metadata"] extends EventMetadata ? Record<string, unknown> : never : never,
  options?: { correlationId?: string; causedBy?: string; idempotencyKey?: string }
): EventEnvelope {
  const event: BaseEvent = {
    id: crypto.randomUUID(),
    type,
    tenantId,
    correlationId: options?.correlationId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    domain,
    metadata: {
      source: "sita-os",
      version: "1.0.0",
      causedBy: options?.causedBy,
      idempotencyKey: options?.idempotencyKey || crypto.randomUUID(),
    },
  };

  return {
    event: { ...event, payload } as unknown as BaseEvent,
    enqueuedAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
    deadLettered: false,
  };
}

export function markDelivered<T extends BaseEvent>(envelope: EventEnvelope<T>): EventEnvelope<T> {
  return { ...envelope, deliveredAt: new Date().toISOString() };
}

export function markDeadLettered<T extends BaseEvent>(envelope: EventEnvelope<T>): EventEnvelope<T> {
  return { ...envelope, deadLettered: true };
}

export function incrementRetry<T extends BaseEvent>(envelope: EventEnvelope<T>): EventEnvelope<T> {
  const updated = { ...envelope, retryCount: envelope.retryCount + 1 };
  if (updated.retryCount >= updated.maxRetries) updated.deadLettered = true;
  return updated;
}

