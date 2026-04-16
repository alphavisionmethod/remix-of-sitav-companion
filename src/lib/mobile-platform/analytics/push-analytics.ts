// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Push Analytics
// ═══════════════════════════════════════════════════════════════

import type { PushTransport, PushCategory } from "../contracts/push-contract";
import type { MobileOS } from "../contracts/mobile-platform-contract";
import { envelopeMobileEvent, type MobileAnalyticsEnvelope } from "./mobile-analytics-partition";

export type PushAnalyticsEventKind = "registered" | "received" | "opened" | "dismissed" | "failed";

export function pushAnalyticsEvent(input: {
  os: MobileOS | null;
  sessionId: string;
  kind: PushAnalyticsEventKind;
  transport: PushTransport;
  category: PushCategory;
  payloadId: string;
  errorCode?: string;
}): MobileAnalyticsEnvelope {
  return envelopeMobileEvent({
    os: input.os,
    sessionId: input.sessionId,
    event: `push.${input.kind}`,
    properties: {
      transport: input.transport,
      category: input.category,
      payloadId: input.payloadId,
      errorCode: input.errorCode,
    },
  });
}
