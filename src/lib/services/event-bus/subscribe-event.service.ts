// ═══════════════════════════════════════════════════════════════
// SITA OS — Subscribe Event Service
// Subscription management with filtering
// ═══════════════════════════════════════════════════════════════

import type { SitaEvent } from "@/packages/event-types";
import type { EventEnvelope } from "./event-envelope";
import { _subscriptions } from "./publish-event.service";

type EventHandler = (event: SitaEvent, envelope: EventEnvelope) => void;

export function subscribe(params: {
  eventType: string | "*";
  domain?: string;
  handler: EventHandler;
}): string {
  const id = crypto.randomUUID();
  _subscriptions.push({
    id,
    eventType: params.eventType,
    domain: params.domain,
    handler: params.handler,
  });
  return id;
}

export function unsubscribe(subscriptionId: string): boolean {
  const idx = _subscriptions.findIndex((s) => s.id === subscriptionId);
  if (idx === -1) return false;
  _subscriptions.splice(idx, 1);
  return true;
}

export function listSubscriptions(): { id: string; eventType: string; domain?: string }[] {
  return _subscriptions.map((s) => ({
    id: s.id,
    eventType: s.eventType,
    domain: s.domain,
  }));
}

export function clearSubscriptions(): number {
  const count = _subscriptions.length;
  _subscriptions.length = 0;
  return count;
}

export function subscribeOnce(params: {
  eventType: string;
  domain?: string;
  handler: EventHandler;
}): string {
  const id = crypto.randomUUID();
  const wrappedHandler: EventHandler = (event, envelope) => {
    params.handler(event, envelope);
    unsubscribe(id);
  };
  _subscriptions.push({
    id,
    eventType: params.eventType,
    domain: params.domain,
    handler: wrappedHandler,
  });
  return id;
}

