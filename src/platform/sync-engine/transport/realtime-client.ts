// ═══════════════════════════════════════════════════════════════
// SITA OS — Realtime Sync Client
// WebSocket-based realtime sync with checkpoint replay
// ═══════════════════════════════════════════════════════════════

import type { SyncChangeEvent } from "../sync-object-model";

/** WebSocket connection state */
export type WSConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "error" | "suspended";

/** Realtime sync event from server */
export interface RealtimeSyncEvent {
  type: "sync_update" | "sync_delete" | "presence_update" | "conflict_detected" | "checkpoint_ack";
  userId: string;
  objectId?: string;
  namespace?: string;
  newVersion?: number;
  changeId?: string;
  payload?: unknown;
  timestamp: string;
}

/** Connection options */
export interface RealtimeClientOptions {
  heartbeatIntervalMs: number;
  reconnectBaseMs: number;
  reconnectMaxMs: number;
  maxReconnectAttempts: number;
}

/** Connection stats */
export interface RealtimeConnectionStats {
  state: WSConnectionState;
  connectedAt: string | null;
  lastEventAt: string | null;
  lastHeartbeatAt: string | null;
  eventsReceived: number;
  eventsSent: number;
  reconnectAttempts: number;
  latencyMs: number;
  subscriptions: string[];
}

type EventHandler = (event: RealtimeSyncEvent) => void;

class RealtimeSyncClient {
  private state: WSConnectionState = "disconnected";
  private options: RealtimeClientOptions = {
    heartbeatIntervalMs: 30000,
    reconnectBaseMs: 1000,
    reconnectMaxMs: 60000,
    maxReconnectAttempts: 20,
  };

  private subscriptions = new Set<string>();
  private eventHandlers: EventHandler[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  private stats: RealtimeConnectionStats = {
    state: "disconnected",
    connectedAt: null,
    lastEventAt: null,
    lastHeartbeatAt: null,
    eventsReceived: 0,
    eventsSent: 0,
    reconnectAttempts: 0,
    latencyMs: 0,
    subscriptions: [],
  };

  private checkpointId: string | null = null;
  private userId: string = "";
  private deviceId: string = "";

  /** Connect to the realtime sync service */
  connect(userId: string, deviceId: string, token: string): void {
    this.userId = userId;
    this.deviceId = deviceId;
    this.setState("connecting");

    // Simulate connection (in production: actual WebSocket)
    setTimeout(() => {
      this.setState("connected");
      this.stats.connectedAt = new Date().toISOString();

      // Start heartbeat
      this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), this.options.heartbeatIntervalMs);

      // Subscribe to default channels
      this.subscribe(`user:${userId}`);
      this.subscribe(`device:${deviceId}`);

      // Replay from checkpoint if available
      if (this.checkpointId) {
        this.requestCheckpointReplay(this.checkpointId);
      }

      console.log(`[RealtimeClient] Connected for user=${userId.slice(0, 8)}`);
    }, 200);
  }

  /** Disconnect */
  disconnect(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.heartbeatInterval = null;
    this.reconnectTimer = null;
    this.setState("disconnected");
    this.reconnectAttempts = 0;
  }

  /** Suspend connection (for battery/thermal) */
  suspend(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
    this.setState("suspended");
  }

  /** Resume from suspension */
  resume(): void {
    if (this.state === "suspended") {
      this.setState("reconnecting");
      this.attemptReconnect();
    }
  }

  /** Subscribe to a channel */
  subscribe(channel: string): void {
    this.subscriptions.add(channel);
    this.stats.subscriptions = Array.from(this.subscriptions);
    if (this.state === "connected") {
      this.send({ type: "subscribe", channel });
    }
  }

  /** Unsubscribe from a channel */
  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    this.stats.subscriptions = Array.from(this.subscriptions);
    if (this.state === "connected") {
      this.send({ type: "unsubscribe", channel });
    }
  }

  /** Send a sync event to the server */
  sendSyncEvent(event: Partial<RealtimeSyncEvent>): void {
    if (this.state !== "connected") return;
    this.send({
      type: "sync_event",
      ...event,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
    this.stats.eventsSent++;
  }

  /** Set the checkpoint for replay on reconnect */
  setCheckpoint(changeId: string): void {
    this.checkpointId = changeId;
  }

  /** Register an event handler */
  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => { this.eventHandlers = this.eventHandlers.filter(h => h !== handler); };
  }

  /** Get connection stats */
  getStats(): RealtimeConnectionStats {
    return { ...this.stats, state: this.state };
  }

  /** Get current connection state */
  getState(): WSConnectionState {
    return this.state;
  }

  /** Check if connected */
  isConnected(): boolean {
    return this.state === "connected";
  }

  /** Update options */
  setOptions(opts: Partial<RealtimeClientOptions>): void {
    this.options = { ...this.options, ...opts };
  }

  // ─── Internal ───────────────────────────────

  private setState(state: WSConnectionState): void {
    this.state = state;
    this.stats.state = state;
  }

  private sendHeartbeat(): void {
    if (this.state !== "connected") return;
    this.send({ type: "heartbeat", timestamp: new Date().toISOString() });
    this.stats.lastHeartbeatAt = new Date().toISOString();
  }

  private send(data: unknown): void {
    // Simulated send — in production this goes over WebSocket
    void data;
  }

  private receiveEvent(event: RealtimeSyncEvent): void {
    this.stats.eventsReceived++;
    this.stats.lastEventAt = new Date().toISOString();
    for (const handler of this.eventHandlers) handler(event);
  }

  private requestCheckpointReplay(fromChangeId: string): void {
    this.send({ type: "checkpoint_replay", fromChangeId, userId: this.userId, deviceId: this.deviceId });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.setState("error");
      return;
    }

    this.reconnectAttempts++;
    this.stats.reconnectAttempts = this.reconnectAttempts;
    const delay = Math.min(
      this.options.reconnectBaseMs * Math.pow(2, this.reconnectAttempts - 1),
      this.options.reconnectMaxMs
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userId, this.deviceId, "");
    }, delay);
  }

  /** Simulate receiving an event (for testing/demo) */
  simulateIncomingEvent(event: RealtimeSyncEvent): void {
    this.receiveEvent(event);
  }
}

/** Singleton realtime sync client */
export const realtimeClient = new RealtimeSyncClient();
