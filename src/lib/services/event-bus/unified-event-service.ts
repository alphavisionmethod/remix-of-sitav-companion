// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Event Service
// Merges event-bus + event-broker into single canonical system
// Application-level — no Kafka/NATS
// ═══════════════════════════════════════════════════════════════

import { createEventEnvelope, type EventEnvelope } from "./event-envelope";
import { publish as rawPublish, getEventLog as getRawEventLog } from "./publish-event.service";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Unified Types ──────────────────────────────────────────────

export type UnifiedEventHandler = (event: EventEnvelope, metadata: { receivedAt: string }) => void;

interface UnifiedSubscription {
  id: string;
  eventType: string;
  domain?: DomainId;
  handler: UnifiedEventHandler;
  createdAt: string;
}

// ── Unified Event Service ──────────────────────────────────────

export class UnifiedEventService {
  private subscriptions: UnifiedSubscription[] = [];
  private eventTrace: Array<{ eventType: string; domain: DomainId; correlationId: string; timestamp: string; delivered: number }> = [];

  publish(
    eventType: string,
    domain: DomainId,
    tenantId: string,
    payload: Record<string, unknown>,
    options?: { correlationId?: string; causedBy?: string }
  ): { delivered: number; errors: string[] } {
    const envelope = createEventEnvelope(eventType, domain, tenantId, payload as any, options);

    // Dispatch to unified subscribers
    let delivered = 0;
    const errors: string[] = [];

    for (const sub of this.subscriptions) {
      if (sub.eventType !== "*" && sub.eventType !== eventType) continue;
      if (sub.domain && sub.domain !== domain) continue;
      try {
        sub.handler(envelope, { receivedAt: new Date().toISOString() });
        delivered++;
      } catch (err) {
        errors.push(`Handler ${sub.id}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    // Also publish through legacy raw publish for backward compatibility
    const legacyResult = rawPublish(envelope);
    delivered += legacyResult.delivered;
    errors.push(...legacyResult.errors);

    // Trace
    const correlationId = options?.correlationId || (envelope.event as any)?.correlationId || "unknown";
    this.eventTrace.push({ eventType, domain, correlationId, timestamp: new Date().toISOString(), delivered });
    if (this.eventTrace.length > 2000) this.eventTrace = this.eventTrace.slice(-1000);

    return { delivered, errors };
  }

  subscribe(eventType: string, handler: UnifiedEventHandler, domain?: DomainId): string {
    const id = crypto.randomUUID();
    this.subscriptions.push({ id, eventType, domain, handler, createdAt: new Date().toISOString() });
    return id;
  }

  unsubscribe(subscriptionId: string): boolean {
    const idx = this.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (idx >= 0) {
      this.subscriptions.splice(idx, 1);
      return true;
    }
    return false;
  }

  getEventLog(limit?: number): EventEnvelope[] {
    return getRawEventLog(limit);
  }

  getTraceByCorrelation(correlationId: string): Array<{ eventType: string; domain: DomainId; timestamp: string; delivered: number }> {
    return this.eventTrace.filter((t) => t.correlationId === correlationId);
  }

  getEventTrace(limit?: number): Array<{ eventType: string; domain: DomainId; correlationId: string; timestamp: string; delivered: number }> {
    const log = [...this.eventTrace].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.length;
  }

  getTraceStats(): { totalEvents: number; uniqueTypes: number; uniqueCorrelations: number; avgDelivered: number } {
    const stats = { totalEvents: this.eventTrace.length, uniqueTypes: 0, uniqueCorrelations: 0, avgDelivered: 0 };
    if (stats.totalEvents === 0) return stats;
    const types = new Set(this.eventTrace.map((t) => t.eventType));
    const corrs = new Set(this.eventTrace.map((t) => t.correlationId));
    stats.uniqueTypes = types.size;
    stats.uniqueCorrelations = corrs.size;
    stats.avgDelivered = this.eventTrace.reduce((sum, t) => sum + t.delivered, 0) / stats.totalEvents;
    return stats;
  }
}

export const unifiedEventService = new UnifiedEventService();
