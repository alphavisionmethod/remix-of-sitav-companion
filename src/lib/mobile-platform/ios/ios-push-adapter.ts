// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Push Adapter
// APNs deferred — adapter exists for contract honesty; calls return
// "unsupported" until Apple Developer membership is provisioned.
// ═══════════════════════════════════════════════════════════════

import type { PushPayload, PushDeliveryReceipt, PushRegistration } from "../contracts/push-contract";
import { MOBILE_PLATFORM_FLAGS } from "../runtime/mobile-platform-flags";

export interface IOSPushAdapter {
  isEnabled(): boolean;
  register(): Promise<PushRegistration | null>;
  unregister(): Promise<void>;
  send(payload: PushPayload): Promise<PushDeliveryReceipt>;
}

export const iosPushAdapter: IOSPushAdapter = {
  isEnabled: () => !MOBILE_PLATFORM_FLAGS.apnsDisabled,
  async register() {
    if (MOBILE_PLATFORM_FLAGS.apnsDisabled) return null;
    return null;
  },
  async unregister() {
    /* no-op until APNs is wired */
  },
  async send(payload) {
    return {
      payloadId: payload.id,
      transport: "apns",
      os: "ios",
      status: MOBILE_PLATFORM_FLAGS.apnsDisabled ? "failed" : "queued",
      timestamp: new Date().toISOString(),
      errorCode: MOBILE_PLATFORM_FLAGS.apnsDisabled ? "apns-deferred" : undefined,
    };
  },
};
