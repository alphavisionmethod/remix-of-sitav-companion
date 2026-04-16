// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Push Adapter (FCM)
// FCM is roadmap until service-account credentials are provisioned.
// ═══════════════════════════════════════════════════════════════

import type { PushPayload, PushDeliveryReceipt, PushRegistration } from "../contracts/push-contract";
import { MOBILE_PLATFORM_FLAGS } from "../runtime/mobile-platform-flags";

export interface AndroidPushAdapter {
  isEnabled(): boolean;
  register(): Promise<PushRegistration | null>;
  unregister(): Promise<void>;
  send(payload: PushPayload): Promise<PushDeliveryReceipt>;
}

export const androidPushAdapter: AndroidPushAdapter = {
  isEnabled: () => !MOBILE_PLATFORM_FLAGS.fcmDisabled,
  async register() {
    if (MOBILE_PLATFORM_FLAGS.fcmDisabled) return null;
    return null;
  },
  async unregister() {
    /* no-op until FCM is wired */
  },
  async send(payload) {
    return {
      payloadId: payload.id,
      transport: "fcm",
      os: "android",
      status: MOBILE_PLATFORM_FLAGS.fcmDisabled ? "failed" : "queued",
      timestamp: new Date().toISOString(),
      errorCode: MOBILE_PLATFORM_FLAGS.fcmDisabled ? "fcm-credentials-pending" : undefined,
    };
  },
};
