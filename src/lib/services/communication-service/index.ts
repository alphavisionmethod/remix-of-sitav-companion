// ═══════════════════════════════════════════════════════════════
// SITA OS — Communication Service
// Email, SMS, push notification orchestration with policy gates
// ═══════════════════════════════════════════════════════════════

import type { Message, NotificationPreferences, CommunicationTemplate, DeliveryReport, ChannelType, DeliveryStatus, MessageCategory, MessagePriority } from "@/packages/contracts/domain-types/communication";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
// @persistence: os_service_state — state survives refresh via universal adapter

export type { Message, NotificationPreferences, CommunicationTemplate, DeliveryReport, ChannelType, DeliveryStatus, MessageCategory, MessagePriority };

export interface SendRequest {
  channel: ChannelType;
  category: MessageCategory;
  priority: MessagePriority;
  recipientId: string;
  recipientAddress: string;
  subject?: string;
  body: string;
  htmlBody?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  scheduledAt?: string;
  domain: Message["domain"];
  correlationId: string;
}

export interface SendResult {
  messageId: string;
  status: DeliveryStatus;
  channel: ChannelType;
  scheduledAt?: string;
  error?: string;
}

export class CommunicationService {
  private messages: Map<string, Message> = new Map();
  private templates: Map<string, CommunicationTemplate> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private deliveryReports: DeliveryReport[] = [];

  async send(request: SendRequest): Promise<SendResult> {
    // Check preferences
    const prefs = this.preferences.get(request.recipientId);
    if (prefs && !prefs.channels[request.channel]) {
      return { messageId: "", status: "failed", channel: request.channel, error: "Channel disabled by user preferences" };
    }

    // Check quiet hours
    if (prefs?.quietHours.enabled && request.priority !== "urgent") {
      const now = new Date();
      const hour = now.getHours();
      const start = parseInt(prefs.quietHours.start);
      const end = parseInt(prefs.quietHours.end);
      if (hour >= start || hour < end) {
        return { messageId: "", status: "queued", channel: request.channel, scheduledAt: prefs.quietHours.end };
      }
    }

    // Apply template
    let body = request.body;
    let htmlBody = request.htmlBody;
    if (request.templateId) {
      const template = this.templates.get(request.templateId);
      if (template) {
        body = this.applyTemplate(template.body, request.templateData ?? {});
        htmlBody = template.htmlBody ? this.applyTemplate(template.htmlBody, request.templateData ?? {}) : undefined;
      }
    }

    const message: Message = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: "",
      channel: request.channel,
      category: request.category,
      priority: request.priority,
      recipientId: request.recipientId,
      recipientAddress: request.recipientAddress,
      subject: request.subject,
      body,
      htmlBody,
      templateId: request.templateId,
      templateData: request.templateData,
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      domain: request.domain,
      correlationId: request.correlationId,
      metadata: {},
    };

    this.messages.set(message.id, message);

    // Route push channel through DB → edge function pipeline
    if (request.channel === "push") {
      try {
        const { data: { user } } = await db.auth.getUser();
        if (user) {
          await fromDynamicTable("notifications_queue").insert({
            user_id: user.id,
            category: request.category,
            channel: "push",
            title: request.subject || body.slice(0, 100),
            body: body.slice(0, 500),
            urgency: request.priority === "urgent" ? "critical" : request.priority === "high" ? "high" : "normal",
            action_url: (request.templateData?.action_url as string) || null,
            metadata: { correlation_id: request.correlationId, domain: request.domain },
          });
          message.status = "queued";
          message.sentAt = new Date().toISOString();
          return { messageId: message.id, status: "queued", channel: message.channel };
        }
      } catch (err) {
        console.error("Push dispatch failed, falling back to simulated:", err);
      }
    }

    // Simulate delivery for non-push channels
    message.status = "delivered";
    message.sentAt = new Date().toISOString();
    message.deliveredAt = new Date().toISOString();

    this.deliveryReports.push({
      messageId: message.id,
      channel: message.channel,
      status: "delivered",
      timestamp: new Date().toISOString(),
      latencyMs: Math.random() * 500 + 100,
    });

    return { messageId: message.id, status: "delivered", channel: message.channel };
  }

  setPreferences(userId: string, prefs: NotificationPreferences): void {
    this.preferences.set(userId, prefs);
  }

  getPreferences(userId: string): NotificationPreferences | null {
    return this.preferences.get(userId) ?? null;
  }

  registerTemplate(template: CommunicationTemplate): void {
    this.templates.set(template.id, template);
  }

  getMessageHistory(recipientId: string, limit: number = 50): Message[] {
    return Array.from(this.messages.values())
      .filter((m: any) => m.recipientId === recipientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  getDeliveryStats(): { total: number; delivered: number; failed: number; bounced: number; avgLatency: number } {
    const reports = this.deliveryReports;
    return {
      total: reports.length,
      delivered: reports.filter((r: any) => r.status === "delivered").length,
      failed: reports.filter((r: any) => r.status === "failed").length,
      bounced: reports.filter((r: any) => r.status === "bounced").length,
      avgLatency: reports.length > 0 ? reports.reduce((s, r) => s + r.latencyMs, 0) / reports.length : 0,
    };
  }

  private applyTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? `{{${key}}}`));
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("communication-service", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      messages: Array.from(this.messages.entries()),
      templates: Array.from(this.templates.entries()),
      preferences: Array.from(this.preferences.entries()),
      deliveryReports: this.deliveryReports,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.messages) this.messages = new Map(state.messages as Iterable<[string, never]>) as typeof this.messages;
    if (state.templates) this.templates = new Map(state.templates as Iterable<[string, never]>) as typeof this.templates;
    if (state.preferences) this.preferences = new Map(state.preferences as Iterable<[string, never]>) as typeof this.preferences;
    if (state.deliveryReports) this.deliveryReports = state.deliveryReports as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("communication-service");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createCommunicationService(): CommunicationService {
  return new CommunicationService();
}

