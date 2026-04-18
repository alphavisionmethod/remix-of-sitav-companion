// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Push Adapter (FCM)
// Bridges to Capacitor PushNotifications when present. FCM is
// roadmap until the service-account credentials are provisioned.
// ═══════════════════════════════════════════════════════════════

import type { PushPayload, PushDeliveryReceipt, PushRegistration } from "../contracts/push-contract";
import { MOBILE_PLATFORM_FLAGS } from "../runtime/mobile-platform-flags";
import { nativePush } from "../native/native-push";

export interface AndroidPushAdapter {
  isEnabled(): boolean;
  register(): Promise<PushRegistration | null>;
  unregister(): Promise<void>;
  send(payload: PushPayload): Promise<PushDeliveryReceipt>;
}

export const androidPushAdapter: AndroidPushAdapter = {
  isEnabled: () => !MOBILE_PLATFORM_FLAGS.fcmDisabled && nativePush.isAvailable(),

  async register() {
    if (MOBILE_PLATFORM_FLAGS.fcmDisabled) return null;
    if (!nativePush.isAvailable()) return null;
    return nativePush.register();
  },

  async unregister() {
    if (!nativePush.isAvailable()) return;
    await nativePush.unregister();
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
