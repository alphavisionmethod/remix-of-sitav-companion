// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified WebSocket Multiplexer (Sections 17-21)
// Single Supabase Realtime channel multiplexing all event scopes.
// Supports selective subscriptions, token refresh, forced
// disconnect, stream resume, and observability metrics.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  WsEventEnvelope,
  WsEventScope,
  WsRiskLevel,
  CommandUpdatePayload,
} from "@/packages/contracts/core/ws-event-envelope";
import { createWsEnvelope } from "@/packages/contracts/core/ws-event-envelope";
import { fromTable } from "@/lib/supabase-helpers";

// ── Types ──────────────────────────────────────────────────────

export type WsConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "degraded" | "error";

type ScopeHandler = (event: WsEventEnvelope) => void;

interface SubscriptionEntry {
  id: string;
  scope: WsEventScope | "*";
  handler: ScopeHandler;
}

interface WsMetrics {
  connectCount: number;
  disconnectCount: number;
  reconnectCount: number;
  eventCount: number;
  lastEventAt: number | null;
  lastLatencyMs: number | null;
  staleCorrections: number;
  connectionUptime: number;
  connectionStartedAt: number | null;
}

// ── Unified WebSocket Client ──────────────────────────────────

export class UnifiedWsClient {
  private channel: RealtimeChannel | null = null;
  private state: WsConnectionState = "disconnected";
  private subscriptions: SubscriptionEntry[] = [];
  private stateListeners: Set<(state: WsConnectionState) => void> = new Set();
  private lastEventId: string | null = null;
  private lastEventTimestamp = 0;
  private userId: string | null = null;
  private seq = 0;
  private retryCount = 0;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private metricsInterval: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;
  private eventBuffer: WsEventEnvelope[] = [];
  private maxBufferSize = 500;
  private authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

  readonly metrics: WsMetrics = {
    connectCount: 0,
    disconnectCount: 0,
    reconnectCount: 0,
    eventCount: 0,
    lastEventAt: null,
    lastLatencyMs: null,
    staleCorrections: 0,
    connectionUptime: 0,
    connectionStartedAt: null,
  };

  // ── Lifecycle ────────────────────────────────────────────────

  async start(userId: string): Promise<void> {
    if (this.destroyed) return;
    this.userId = userId;
    this.setState("connecting");

    // Listen for auth changes (token refresh, sign-out)
    this.authListener = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (event === "SIGNED_OUT") {
          this.stop();
        }
        // TOKEN_REFRESHED: Supabase client auto-refreshes the channel token
      }
    });

    await this.connect();
    this.startHeartbeat();
    this.startMetricsFlush();
  }

  stop(): void {
    this.destroyed = true;
    this.clearRetry();
    this.stopHeartbeat();
    this.stopMetricsFlush();

    if (this.authListener) {
      this.authListener.data.subscription.unsubscribe();
      this.authListener = null;
    }

    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.metrics.disconnectCount++;
    this.setState("disconnected");
  }

  destroy(): void {
    this.stop();
    this.subscriptions = [];
    this.stateListeners.clear();
    this.eventBuffer = [];
  }

  // ── Subscriptions ────────────────────────────────────────────

  subscribe(scope: WsEventScope | "*", handler: ScopeHandler): string {
    const id = crypto.randomUUID();
    this.subscriptions.push({ id, scope, handler });
    return id;
  }

  unsubscribe(id: string): void {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
  }

  onStateChange(handler: (state: WsConnectionState) => void): () => void {
    this.stateListeners.add(handler);
    return () => this.stateListeners.delete(handler);
  }

  getState(): WsConnectionState {
    return this.state;
  }

  getEventBuffer(): readonly WsEventEnvelope[] {
    return this.eventBuffer;
  }

  getActiveScopes(): WsEventScope[] {
    const scopes = new Set(
      this.subscriptions
        .filter((s) => s.scope !== "*")
        .map((s) => s.scope as WsEventScope),
    );
    return Array.from(scopes);
  }

  // ── Connection ───────────────────────────────────────────────

  private async connect(): Promise<void> {
    if (this.destroyed) return;

    try {
      this.channel = supabase.channel("sita-unified-ws", {
        config: { broadcast: { self: true } },
      });

      // Listen for broadcast events (multiplexed)
      this.channel.on("broadcast", { event: "ws-event" }, ({ payload }) => {
        if (payload && typeof payload === "object" && "event_id" in payload) {
          this.handleIncomingEvent(payload as WsEventEnvelope);
        }
      });

      // Bridge postgres_changes for command tables
      this.channel
        .on("postgres_changes", { event: "*", schema: "public", table: "os_commands" }, (change) => {
          this.bridgeDbChange("command", "command.update", change);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "os_command_events" }, (change) => {
          this.bridgeDbChange("command", "command.event", change);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "cloud_devices" }, (change) => {
          this.bridgeDbChange("device", "device.updated", change);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "cloud_activity_journal" }, (change) => {
          this.bridgeDbChange("audit", "audit.event", change);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "cloud_abuse_events" }, (change) => {
          this.bridgeDbChange("security", "security.alert", change);
        });

      this.channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          this.setState("connected");
          this.metrics.connectCount++;
          this.metrics.connectionStartedAt = Date.now();
          this.retryCount = 0;
        } else if (status === "CHANNEL_ERROR") {
          this.setState("error");
          this.scheduleReconnect();
        } else if (status === "TIMED_OUT") {
          this.setState("reconnecting");
          this.scheduleReconnect();
        }
      });
    } catch (err) {
      console.error("[UnifiedWsClient] Connection error:", err);
      this.setState("error");
      this.scheduleReconnect();
    }
  }

  // ── DB Change Bridge ─────────────────────────────────────────

  private bridgeDbChange(scope: WsEventScope, type: string, change: Record<string, unknown>): void {
    const newRecord = (change.new ?? {}) as Record<string, unknown>;
    const envelope = createWsEnvelope(type, scope, newRecord, {
      actor_type: "system",
      actor_id: "realtime-bridge",
      source: `db:${(change as Record<string, string>).table ?? scope}`,
      risk_level: scope === "security" ? "high" : "none",
      correlation_id: (newRecord.correlation_id as string) ?? undefined,
    });
    this.handleIncomingEvent(envelope);
  }

  // ── Event Dispatch ───────────────────────────────────────────

  private handleIncomingEvent(event: WsEventEnvelope): void {
    // Dedup
    if (event.event_id === this.lastEventId) {
      this.metrics.staleCorrections++;
      return;
    }

    this.lastEventId = event.event_id;
    this.lastEventTimestamp = Date.now();
    this.metrics.eventCount++;
    this.metrics.lastEventAt = this.lastEventTimestamp;

    // Calculate latency
    const eventTime = new Date(event.timestamp).getTime();
    if (!isNaN(eventTime)) {
      this.metrics.lastLatencyMs = Date.now() - eventTime;
    }

    // Buffer
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.maxBufferSize);
    }

    // Fan-out to matching subscribers
    for (const sub of this.subscriptions) {
      if (sub.scope === "*" || sub.scope === event.scope) {
        try {
          sub.handler(event);
        } catch (err) {
          console.error(`[UnifiedWsClient] Subscriber error (${sub.id}):`, err);
        }
      }
    }
  }

  // ── Broadcast (emit to other clients) ────────────────────────

  async broadcast(event: WsEventEnvelope): Promise<void> {
    if (!this.channel || this.state !== "connected") {
      console.warn("[UnifiedWsClient] Cannot broadcast — not connected");
      return;
    }
    await this.channel.send({
      type: "broadcast",
      event: "ws-event",
      payload: event,
    });
  }

  // ── Reconnection ────────────────────────────────────────────

  private scheduleReconnect(): void {
    if (this.destroyed) return;
    this.clearRetry();

    const baseDelay = 1000;
    const maxDelay = 30_000;
    const jitter = Math.random() * 1000;
    const delay = Math.min(baseDelay * Math.pow(2, this.retryCount), maxDelay) + jitter;

    this.retryCount++;
    this.metrics.reconnectCount++;
    this.setState("reconnecting");

    this.retryTimeout = setTimeout(async () => {
      if (this.destroyed) return;
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
      await this.connect();
    }, delay);
  }

  private clearRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  // ── Heartbeat ────────────────────────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.state === "connected" && this.channel) {
        this.channel.send({
          type: "broadcast",
          event: "heartbeat",
          payload: { ts: Date.now(), user_id: this.userId },
        });
      }

      // Detect stale connection (no events for 60s)
      if (
        this.state === "connected" &&
        this.lastEventTimestamp > 0 &&
        Date.now() - this.lastEventTimestamp > 60_000
      ) {
        this.setState("degraded");
      }
    }, 15_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // ── Metrics Flush ────────────────────────────────────────────

  private startMetricsFlush(): void {
    this.stopMetricsFlush();
    this.metricsInterval = setInterval(() => {
      if (!this.userId || this.state === "disconnected") return;
      this.flushMetrics();
    }, 60_000);
  }

  private stopMetricsFlush(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private async flushMetrics(): Promise<void> {
    if (!this.userId) return;
    const now = new Date().toISOString();
    const entries = [
      { metric_type: "ws_event_count", value: this.metrics.eventCount, user_id: this.userId, metadata: {}, created_at: now },
      { metric_type: "ws_reconnect_count", value: this.metrics.reconnectCount, user_id: this.userId, metadata: {}, created_at: now },
    ];

    if (this.metrics.lastLatencyMs !== null) {
      entries.push({ metric_type: "ws_latency_ms", value: this.metrics.lastLatencyMs, user_id: this.userId, metadata: {}, created_at: now });
    }

    try {
      await fromTable("communication_metrics").insert(entries);
    } catch {
      // Silently fail — observability should never break the app
    }
  }

  // ── State ────────────────────────────────────────────────────

  private setState(state: WsConnectionState): void {
    if (this.state === state) return;
    this.state = state;

    if (state === "connected" && this.metrics.connectionStartedAt) {
      this.metrics.connectionUptime = Date.now() - this.metrics.connectionStartedAt;
    }

    for (const listener of this.stateListeners) {
      try {
        listener(state);
      } catch {
        // ignore
      }
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────

export const unifiedWsClient = new UnifiedWsClient();
