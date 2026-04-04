// ═══════════════════════════════════════════════════════════════
// SITA OS — Realtime Gateway Service
// Supabase Realtime channel management, presence, event fan-out
// ═══════════════════════════════════════════════════════════════

export type ChannelStatus = "connecting" | "connected" | "disconnected" | "error";
export type PresenceState = "online" | "away" | "busy" | "offline";

export interface RealtimeChannel {
  id: string;
  topic: string;
  status: ChannelStatus;
  subscriberCount: number;
  createdAt: string;
  lastEventAt?: string;
  metadata?: Record<string, unknown>;
}

export interface PresenceRecord {
  userId: string;
  state: PresenceState;
  lastSeen: string;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

export interface RealtimeEvent {
  id: string;
  channelId: string;
  eventType: string;
  payload: Record<string, unknown>;
  senderId?: string;
  timestamp: string;
}

export interface SubscriptionConfig {
  topic: string;
  eventTypes?: string[];
  filter?: Record<string, unknown>;
  onEvent: (event: RealtimeEvent) => void;
  onStatusChange?: (status: ChannelStatus) => void;
}

export interface RealtimeGatewayState {
  channels: RealtimeChannel[];
  presence: PresenceRecord[];
  totalEvents: number;
  health: { status: "healthy" | "degraded" | "disconnected"; latencyMs: number };
}

export class RealtimeGatewayService {
  private channels = new Map<string, RealtimeChannel>();
  private presence = new Map<string, PresenceRecord>();
  private subscriptions = new Map<string, SubscriptionConfig>();
  private eventLog: RealtimeEvent[] = [];
  private maxEventLog = 1000;

  subscribe(config: SubscriptionConfig): string {
    const channelId = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const channel: RealtimeChannel = {
      id: channelId,
      topic: config.topic,
      status: "connecting",
      subscriberCount: 1,
      createdAt: new Date().toISOString(),
    };
    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, config);

    // Simulate connection
    setTimeout(() => {
      channel.status = "connected";
      config.onStatusChange?.("connected");
    }, 50);

    return channelId;
  }

  unsubscribe(channelId: string): boolean {
    const existed = this.channels.delete(channelId);
    this.subscriptions.delete(channelId);
    return existed;
  }

  broadcast(topic: string, eventType: string, payload: Record<string, unknown>, senderId?: string): number {
    const event: RealtimeEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channelId: topic,
      eventType,
      payload,
      senderId,
      timestamp: new Date().toISOString(),
    };

    let delivered = 0;
    for (const [chId, config] of this.subscriptions) {
      if (config.topic !== topic) continue;
      if (config.eventTypes && !config.eventTypes.includes(eventType)) continue;

      const channel = this.channels.get(chId);
      if (channel) channel.lastEventAt = event.timestamp;
      config.onEvent(event);
      delivered++;
    }

    this.eventLog.push(event);
    if (this.eventLog.length > this.maxEventLog) {
      this.eventLog = this.eventLog.slice(-Math.floor(this.maxEventLog / 2));
    }

    return delivered;
  }

  updatePresence(userId: string, state: PresenceState, deviceId?: string, metadata?: Record<string, unknown>): void {
    this.presence.set(userId, {
      userId,
      state,
      lastSeen: new Date().toISOString(),
      deviceId,
      metadata,
    });
  }

  removePresence(userId: string): void {
    this.presence.delete(userId);
  }

  getPresence(userId: string): PresenceRecord | undefined {
    return this.presence.get(userId);
  }

  getOnlineUsers(): PresenceRecord[] {
    return Array.from(this.presence.values()).filter(p => p.state !== "offline");
  }

  getChannel(channelId: string): RealtimeChannel | undefined {
    return this.channels.get(channelId);
  }

  getChannelsByTopic(topic: string): RealtimeChannel[] {
    return Array.from(this.channels.values()).filter(c => c.topic === topic);
  }

  getRecentEvents(limit = 50): RealtimeEvent[] {
    return this.eventLog.slice(-limit);
  }

  evaluate(): RealtimeGatewayState {
    const channels = Array.from(this.channels.values());
    const connectedCount = channels.filter(c => c.status === "connected").length;
    const totalChannels = channels.length;

    return {
      channels,
      presence: Array.from(this.presence.values()),
      totalEvents: this.eventLog.length,
      health: {
        status: totalChannels === 0 ? "healthy" : connectedCount === totalChannels ? "healthy" : connectedCount > 0 ? "degraded" : "disconnected",
        latencyMs: Math.round(Math.random() * 15 + 5),
      },
    };
  }
}

export function createRealtimeGateway(): RealtimeGatewayService {
  return new RealtimeGatewayService();
}
