// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Event Service
// Merges event-bus + event-broker into single canonical system
// Includes Supabase Realtime bridge for server-side events
// ═══════════════════════════════════════════════════════════════

import { createEventEnvelope, type EventEnvelope } from "./event-envelope";
import { publish as rawPublish, getEventLog as getRawEventLog } from "./publish-event.service";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";
import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import type { RealtimeChannel } from "@supabase/supabase-js";

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
  private realtimeChannel: RealtimeChannel | null = null;
  private realtimeBridgeActive = false;

  publish(
    eventType: string,
    domain: DomainId,
    tenantId: string,
    payload: Record<string, unknown>,
    options?: { correlationId?: string; causedBy?: string }
  ): { delivered: number; errors: string[] } {
    const envelope = createEventEnvelope(eventType, domain, tenantId, payload as never, options);

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
    const correlationId = options?.correlationId || String((envelope.event as unknown as Record<string, unknown>)?.correlationId ?? "unknown");
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

  // ── Supabase Realtime Bridge ─────────────────────────────────

  /**
   * Start listening to server-side events via Supabase Realtime.
   * Bridges DB changes on key tables (agent_signals, notifications_queue, incidents)
   * into the client-side event bus.
   */
  startRealtimeBridge(): void {
    if (this.realtimeBridgeActive) return;

    this.realtimeChannel = supabase
      .channel("sita-os-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_signals" },
        (payload) => {
          const record = payload.new as Record<string, unknown>;
          this.publish(
            `server.agent_signal.${String(record.signal_type || "unknown")}`,
            "platform" as DomainId,
            String(record.user_id || "system"),
            record,
            { correlationId: String(record.id || crypto.randomUUID()) }
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications_queue" },
        (payload) => {
          const record = payload.new as Record<string, unknown>;
          this.publish(
            `server.notification.${String(record.category || "general")}`,
            "platform" as DomainId,
            String(record.user_id || "system"),
            record,
            { correlationId: String(record.id || crypto.randomUUID()) }
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          const record = payload.new as Record<string, unknown>;
          this.publish(
            `server.incident.${String(record.severity || "unknown")}`,
            "platform" as DomainId,
            String(record.user_id || "system"),
            record,
            { correlationId: String(record.id || crypto.randomUUID()) }
          );
        }
      )
      .subscribe((status) => {
        this.realtimeBridgeActive = status === "SUBSCRIBED";
      });
  }

  /**
   * Stop the Realtime bridge.
   */
  stopRealtimeBridge(): void {
    if (this.realtimeChannel) {
      db.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
      this.realtimeBridgeActive = false;
    }
  }

  isRealtimeBridgeActive(): boolean {
    return this.realtimeBridgeActive;
  }

  // ── Query Methods ────────────────────────────────────────────

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

  getTraceStats(): { totalEvents: number; uniqueTypes: number; uniqueCorrelations: number; avgDelivered: number; realtimeBridge: boolean } {
    const stats = { totalEvents: this.eventTrace.length, uniqueTypes: 0, uniqueCorrelations: 0, avgDelivered: 0, realtimeBridge: this.realtimeBridgeActive };
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
