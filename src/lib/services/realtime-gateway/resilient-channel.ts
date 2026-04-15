// ═══════════════════════════════════════════════════════════════
// SITA OS — Resilient Channel
// WebSocket reconnection with exponential backoff, event resume,
// offline mutation queue, and heartbeat keepalive.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────

export interface ResilientChannelConfig {
  topic: string;
  event?: string;
  schema?: string;
  table?: string;
  filter?: string;
  onEvent: (payload: unknown) => void;
  onStatusChange?: (status: ChannelState) => void;
  maxRetries?: number;
  heartbeatIntervalMs?: number;
}

export type ChannelState = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

interface QueuedMutation {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

// ── Resilient Channel Class ────────────────────────────────────

export class ResilientChannel {
  private channel: RealtimeChannel | null = null;
  private state: ChannelState = "disconnected";
  private retryCount = 0;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private lastEventId: string | null = null;
  private lastEventTimestamp: number = 0;
  private offlineQueue: QueuedMutation[] = [];
  private config: Required<ResilientChannelConfig>;
  private destroyed = false;

  constructor(config: ResilientChannelConfig) {
    this.config = {
      event: "*",
      schema: "public",
      table: "",
      filter: "",
      maxRetries: 15,
      heartbeatIntervalMs: 30_000,
      onStatusChange: () => {},
      ...config,
    };
  }

  // ── Public API ─────────────────────────────────────────────

  connect(): void {
    if (this.destroyed) return;
    this.setState("connecting");
    this.setupChannel();
  }

  disconnect(): void {
    this.destroyed = true;
    this.cleanup();
    this.setState("disconnected");
  }

  getState(): ChannelState {
    return this.state;
  }

  getLastEventId(): string | null {
    return this.lastEventId;
  }

  /** Queue a mutation for retry when connection is restored */
  queueMutation(table: string, operation: QueuedMutation["operation"], payload: Record<string, unknown>): string {
    const id = crypto.randomUUID();
    this.offlineQueue.push({
      id,
      table,
      operation,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    });
    return id;
  }

  /** Get pending offline mutations */
  getPendingMutations(): readonly QueuedMutation[] {
    return this.offlineQueue;
  }

  /** Clear offline queue */
  clearQueue(): void {
    this.offlineQueue = [];
  }

  // ── Private ────────────────────────────────────────────────

  private setState(state: ChannelState): void {
    if (this.state === state) return;
    this.state = state;
    this.config.onStatusChange(state);
  }

  private setupChannel(): void {
    this.cleanup();

    const channelName = `resilient-${this.config.topic}-${Date.now()}`;

    if (this.config.table) {
      // Postgres changes channel
      this.channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes" as any,
          {
            event: this.config.event as any,
            schema: this.config.schema,
            table: this.config.table,
            ...(this.config.filter ? { filter: this.config.filter } : {}),
          },
          (payload: unknown) => {
            this.handleEvent(payload);
          },
        )
        .subscribe((status) => {
          this.handleSubscriptionStatus(status);
        });
    } else {
      // Broadcast channel
      this.channel = supabase
        .channel(channelName)
        .on("broadcast", { event: this.config.event }, (payload: unknown) => {
          this.handleEvent(payload);
        })
        .subscribe((status) => {
          this.handleSubscriptionStatus(status);
        });
    }
  }

  private handleSubscriptionStatus(status: string): void {
    switch (status) {
      case "SUBSCRIBED":
        this.setState("connected");
        this.retryCount = 0;
        this.startHeartbeat();
        this.drainOfflineQueue();
        break;
      case "CLOSED":
      case "CHANNEL_ERROR":
        if (!this.destroyed) {
          this.setState("reconnecting");
          this.scheduleReconnect();
        }
        break;
      case "TIMED_OUT":
        if (!this.destroyed) {
          this.setState("reconnecting");
          this.scheduleReconnect();
        }
        break;
    }
  }

  private handleEvent(payload: unknown): void {
    const eventPayload = payload as Record<string, unknown>;
    if (eventPayload?.commit_timestamp) {
      this.lastEventTimestamp = new Date(eventPayload.commit_timestamp as string).getTime();
    }
    if (eventPayload?.eventId || eventPayload?.id) {
      this.lastEventId = (eventPayload.eventId || eventPayload.id) as string;
    }
    this.config.onEvent(payload);
  }

  private scheduleReconnect(): void {
    if (this.destroyed || this.retryCount >= this.config.maxRetries) {
      this.setState("error");
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, ... capped at 60s
    const baseDelay = 1000;
    const maxDelay = 60_000;
    const delay = Math.min(baseDelay * Math.pow(2, this.retryCount), maxDelay);
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    const finalDelay = Math.round(delay + jitter);

    this.retryTimeout = setTimeout(() => {
      this.retryCount++;
      this.setupChannel();
    }, finalDelay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.state !== "connected") {
        this.stopHeartbeat();
        return;
      }
      // Send a heartbeat broadcast to keep the connection alive
      this.channel?.send({
        type: "broadcast",
        event: "heartbeat",
        payload: { timestamp: Date.now() },
      });
    }, this.config.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async drainOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const mutation of queue) {
      try {
        const table = (supabase as any).from(mutation.table);
        switch (mutation.operation) {
          case "insert":
            await table.insert(mutation.payload);
            break;
          case "update":
            if (mutation.payload.id) {
              await table.update(mutation.payload).eq("id", mutation.payload.id);
            }
            break;
          case "delete":
            if (mutation.payload.id) {
              await table.delete().eq("id", mutation.payload.id);
            }
            break;
        }
      } catch {
        // Re-queue failed mutations with incremented retry
        if (mutation.retryCount < 3) {
          this.offlineQueue.push({ ...mutation, retryCount: mutation.retryCount + 1 });
        }
      }
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// ── Factory ────────────────────────────────────────────────────

/** Create a resilient channel for a database table */
export function createTableChannel(
  table: string,
  onEvent: (payload: unknown) => void,
  options?: Partial<ResilientChannelConfig>,
): ResilientChannel {
  const channel = new ResilientChannel({
    topic: `table-${table}`,
    table,
    onEvent,
    ...options,
  });
  channel.connect();
  return channel;
}

/** Create a resilient broadcast channel */
export function createBroadcastChannel(
  topic: string,
  event: string,
  onEvent: (payload: unknown) => void,
  options?: Partial<ResilientChannelConfig>,
): ResilientChannel {
  const channel = new ResilientChannel({
    topic,
    event,
    onEvent,
    ...options,
  });
  channel.connect();
  return channel;
}

// ── Channel Manager ────────────────────────────────────────────

class ResilientChannelManager {
  private channels = new Map<string, ResilientChannel>();

  get(key: string): ResilientChannel | undefined {
    return this.channels.get(key);
  }

  getOrCreate(key: string, config: ResilientChannelConfig): ResilientChannel {
    const existing = this.channels.get(key);
    if (existing && existing.getState() !== "error") return existing;

    // Cleanup old channel if exists
    existing?.disconnect();

    const channel = new ResilientChannel(config);
    this.channels.set(key, channel);
    channel.connect();
    return channel;
  }

  remove(key: string): void {
    const channel = this.channels.get(key);
    channel?.disconnect();
    this.channels.delete(key);
  }

  disconnectAll(): void {
    this.channels.forEach(ch => ch.disconnect());
    this.channels.clear();
  }

  getStats(): { total: number; connected: number; reconnecting: number; errored: number } {
    let connected = 0, reconnecting = 0, errored = 0;
    this.channels.forEach(ch => {
      switch (ch.getState()) {
        case "connected": connected++; break;
        case "reconnecting": reconnecting++; break;
        case "error": errored++; break;
      }
    });
    return { total: this.channels.size, connected, reconnecting, errored };
  }
}

export const channelManager = new ResilientChannelManager();
