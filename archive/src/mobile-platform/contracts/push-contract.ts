// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Push Contract
// Defines APNs / FCM / Web push semantics, payload shape, routing.
// ═══════════════════════════════════════════════════════════════

import type { MobileOS } from "./mobile-platform-contract";

export type PushTransport = "apns" | "fcm" | "web-push";

export type PushCategory =
  | "approval-required"
  | "boardroom-alert"
  | "money-alert"
  | "sync-failure"
  | "emergency"
  | "informational";

export type PushPriority = "critical" | "high" | "normal" | "low";

export interface PushPayload {
  /** Stable id for dedupe across transports. */
  id: string;
  category: PushCategory;
  priority: PushPriority;
  title: string;
  body: string;
  /** Deep-link target — must resolve via mobile-deep-link-map. */
  deepLink?: string;
  /** Opaque correlation id linking back to a domain object. */
  correlationId?: string;
  /** ttlSeconds; transport drops if exceeded. */
  ttl?: number;
  /** Silent push for background refresh (no UI). */
  silent?: boolean;
  /** Free-form data forwarded into the app. */
  data?: Record<string, unknown>;
}

export interface PushDeliveryReceipt {
  payloadId: string;
  transport: PushTransport;
  os: MobileOS;
  status: "queued" | "delivered" | "opened" | "failed" | "expired";
  timestamp: string;
  errorCode?: string;
}

export interface PushRegistration {
  os: MobileOS;
  transport: PushTransport;
  token: string;
  registeredAt: string;
  refreshedAt: string;
  expiresAt: string | null;
}

/**
 * Pure routing rule: which transports are permitted per OS, in
 * priority order. The first transport whose capability is "supported"
 * or "fallback" wins.
 */
export const PUSH_TRANSPORT_PRIORITY: Record<MobileOS, ReadonlyArray<PushTransport>> = {
  ios: ["apns", "web-push"],
  android: ["fcm", "web-push"],
};
