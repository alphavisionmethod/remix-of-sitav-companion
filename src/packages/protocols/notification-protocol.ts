// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Protocol
// Categories, urgency semantics, action payloads, push wake format,
// delivery acknowledgement.
// ═══════════════════════════════════════════════════════════════

export type NotificationCategory =
  | "approval_required"
  | "action_completed"
  | "trust_alert"
  | "system_health"
  | "advisor_insight"
  | "boardroom_escalation"
  | "release_event"
  | "sync_conflict"
  | "financial_alert"
  | "security_event"
  | "digest"
  | "informational";

export type NotificationUrgency = "critical" | "high" | "normal" | "low" | "silent";

export type NotificationChannel = "push" | "in_app" | "email" | "websocket" | "sms";

export type DeliveryStatus = "pending" | "delivered" | "read" | "acted" | "expired" | "failed";

export interface NotificationEnvelope {
  notification_id: string;
  correlation_id?: string;
  recipient_id: string;
  category: NotificationCategory;
  urgency: NotificationUrgency;
  channels: NotificationChannel[];
  title: string;
  body: string;
  action?: NotificationAction;
  data?: Record<string, unknown>;
  group_key?: string;
  collapse_key?: string;
  ttl_seconds?: number;
  created_at: string;
  scheduled_at?: string;
}

export interface NotificationAction {
  action_type: "navigate" | "approve" | "dismiss" | "execute" | "view";
  target: string;
  label: string;
  payload?: Record<string, unknown>;
  requires_auth: boolean;
  confirmation_required: boolean;
}

export interface PushWakePayload {
  notification_id: string;
  category: NotificationCategory;
  urgency: NotificationUrgency;
  title: string;
  body: string;
  action_url?: string;
  badge_count?: number;
  sound?: "default" | "critical" | "none";
  data?: Record<string, string>;
}

export interface DeliveryAcknowledgement {
  notification_id: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  delivered_at?: string;
  read_at?: string;
  acted_at?: string;
  device_id?: string;
  failure_reason?: string;
}

export interface NotificationPreference {
  category: NotificationCategory;
  enabled: boolean;
  channels: NotificationChannel[];
  urgency_threshold: NotificationUrgency;
  quiet_hours?: { start: string; end: string };
  digest_mode: boolean;
}

export interface NotificationDigest {
  digest_id: string;
  recipient_id: string;
  period: "hourly" | "daily" | "weekly";
  categories: NotificationCategory[];
  items: NotificationDigestItem[];
  generated_at: string;
}

export interface NotificationDigestItem {
  notification_id: string;
  category: NotificationCategory;
  title: string;
  summary: string;
  urgency: NotificationUrgency;
  created_at: string;
}
