// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Analytics Partition
// Keeps mobile telemetry separable from web/desktop streams.
// ═══════════════════════════════════════════════════════════════

import type { MobileOS } from "../contracts/mobile-platform-contract";

export interface MobileAnalyticsEnvelope {
  partition: "mobile";
  os: MobileOS | null;
  appVersion: string;
  channel: string;
  sessionId: string;
  occurredAt: string;
  event: string;
  properties: Record<string, unknown>;
}

export function envelopeMobileEvent(input: {
  os: MobileOS | null;
  appVersion?: string;
  channel?: string;
  sessionId: string;
  event: string;
  properties?: Record<string, unknown>;
}): MobileAnalyticsEnvelope {
  return {
    partition: "mobile",
    os: input.os,
    appVersion: input.appVersion ?? "0.0.0",
    channel: input.channel ?? "internal",
    sessionId: input.sessionId,
    occurredAt: new Date().toISOString(),
    event: input.event,
    properties: input.properties ?? {},
  };
}
