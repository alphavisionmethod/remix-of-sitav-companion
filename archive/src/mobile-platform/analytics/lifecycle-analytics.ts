// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Lifecycle Analytics
// ═══════════════════════════════════════════════════════════════

import type { MobileOS, MobileLifecyclePhase } from "../contracts/mobile-platform-contract";
import { envelopeMobileEvent, type MobileAnalyticsEnvelope } from "./mobile-analytics-partition";

export function lifecycleAnalyticsEvent(input: {
  os: MobileOS | null;
  sessionId: string;
  from: MobileLifecyclePhase;
  to: MobileLifecyclePhase;
  reason?: string;
}): MobileAnalyticsEnvelope {
  return envelopeMobileEvent({
    os: input.os,
    sessionId: input.sessionId,
    event: "lifecycle.transition",
    properties: { from: input.from, to: input.to, reason: input.reason },
  });
}
