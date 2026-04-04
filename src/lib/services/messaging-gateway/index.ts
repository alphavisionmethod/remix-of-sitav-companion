// ═══════════════════════════════════════════════════════════════
// SITA OS — Messaging Gateway Service
// Multi-channel message routing (email, Slack, WhatsApp)
// ═══════════════════════════════════════════════════════════════

export type GatewayChannel = "email" | "slack" | "whatsapp" | "sms" | "push" | "webhook";

export type GatewayStatus = "connected" | "disconnected" | "error" | "rate-limited";

export interface GatewayChannelConfig {
  channel: GatewayChannel;
  status: GatewayStatus;
  providerName: string;
  apiKeyConfigured: boolean;
  webhookUrl?: string;
  rateLimit: number;
  currentRate: number;
  lastMessageAt?: string;
  errorCount: number;
  metadata: Record<string, unknown>;
}

export interface OutboundMessage {
  id: string;
  channel: GatewayChannel;
  to: string;
  from?: string;
  subject?: string;
  body: string;
  richContent?: Record<string, unknown>;
  priority: "high" | "normal" | "low";
  status: "queued" | "sent" | "delivered" | "failed";
  sentAt?: string;
  error?: string;
  retries: number;
  metadata: Record<string, unknown>;
}

export interface InboundMessage {
  id: string;
  channel: GatewayChannel;
  from: string;
  body: string;
  receivedAt: string;
  processed: boolean;
  metadata: Record<string, unknown>;
}

export class MessagingGatewayService {
  private channels: Map<GatewayChannel, GatewayChannelConfig> = new Map();
  private outbound: OutboundMessage[] = [];
  private inbound: InboundMessage[] = [];

  configureChannel(config: GatewayChannelConfig): void {
    this.channels.set(config.channel, config);
  }

  getChannelStatus(channel: GatewayChannel): GatewayChannelConfig | null {
    return this.channels.get(channel) ?? null;
  }

  listChannels(): GatewayChannelConfig[] {
    return Array.from(this.channels.values());
  }

  async send(channel: GatewayChannel, to: string, body: string, options?: { subject?: string; priority?: "high" | "normal" | "low"; from?: string; richContent?: Record<string, unknown> }): Promise<OutboundMessage> {
    const config = this.channels.get(channel);

    const message: OutboundMessage = {
      id: crypto.randomUUID(),
      channel,
      to,
      from: options?.from,
      subject: options?.subject,
      body,
      richContent: options?.richContent,
      priority: options?.priority ?? "normal",
      status: "queued",
      retries: 0,
      metadata: {},
    };

    if (!config || config.status !== "connected") {
      message.status = "failed";
      message.error = `Channel ${channel} not connected`;
    } else if (config.currentRate >= config.rateLimit) {
      message.status = "failed";
      message.error = "Rate limit exceeded";
      config.status = "rate-limited";
    } else {
      message.status = "sent";
      message.sentAt = new Date().toISOString();
      config.currentRate++;
      config.lastMessageAt = message.sentAt;
    }

    this.outbound.push(message);
    if (this.outbound.length > 5000) this.outbound = this.outbound.slice(-5000);
    return message;
  }

  receiveMessage(channel: GatewayChannel, from: string, body: string, metadata?: Record<string, unknown>): InboundMessage {
    const msg: InboundMessage = {
      id: crypto.randomUUID(),
      channel,
      from,
      body,
      receivedAt: new Date().toISOString(),
      processed: false,
      metadata: metadata ?? {},
    };
    this.inbound.push(msg);
    return msg;
  }

  getOutboundHistory(limit: number = 50): OutboundMessage[] {
    return this.outbound.slice(-limit).reverse();
  }

  getInboundHistory(limit: number = 50): InboundMessage[] {
    return this.inbound.slice(-limit).reverse();
  }

  getStats(): { totalSent: number; totalReceived: number; failedCount: number; byChannel: Record<string, number> } {
    const byChannel: Record<string, number> = {};
    this.outbound.forEach(m => { byChannel[m.channel] = (byChannel[m.channel] ?? 0) + 1; });
    return {
      totalSent: this.outbound.filter(m => m.status === "sent" || m.status === "delivered").length,
      totalReceived: this.inbound.length,
      failedCount: this.outbound.filter(m => m.status === "failed").length,
      byChannel,
    };
  }

  resetRateLimits(): void {
    this.channels.forEach(c => { c.currentRate = 0; if (c.status === "rate-limited") c.status = "connected"; });
  }
}

export function createMessagingGateway(): MessagingGatewayService {
  return new MessagingGatewayService();
}
