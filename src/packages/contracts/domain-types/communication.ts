// ═══════════════════════════════════════════════════════════════
// SITA OS — Communication Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped, DomainId } from "../_contract-scaffold";

export type ChannelType = "email" | "sms" | "push" | "slack" | "whatsapp" | "in-app" | "webhook";

export type DeliveryStatus = "queued" | "sending" | "delivered" | "failed" | "bounced" | "read" | "clicked";

export type MessagePriority = "urgent" | "high" | "normal" | "low" | "digest";

export type MessageCategory = "transactional" | "notification" | "marketing" | "system" | "alert" | "reminder";

export interface Message extends Timestamped, TenantScoped {
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
  status: DeliveryStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  expiresAt?: string;
  domain: DomainId;
  correlationId: string;
  metadata: Record<string, unknown>;
}

export interface NotificationPreferences extends BaseContract, TenantScoped {
  channels: Record<ChannelType, boolean>;
  quietHours: { enabled: boolean; start: string; end: string; timezone: string };
  categoryPrefs: Record<MessageCategory, { enabled: boolean; channels: ChannelType[] }>;
  digestEnabled: boolean;
  digestFrequency: "hourly" | "daily" | "weekly";
  digestTime: string;
}

export interface CommunicationTemplate extends BaseContract {
  name: string;
  channel: ChannelType;
  category: MessageCategory;
  subject?: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  version: number;
  active: boolean;
}

export interface DeliveryReport {
  messageId: string;
  channel: ChannelType;
  status: DeliveryStatus;
  timestamp: string;
  providerResponse?: Record<string, unknown>;
  latencyMs: number;
}
