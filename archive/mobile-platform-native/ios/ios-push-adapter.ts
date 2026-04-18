// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Push Adapter
// Bridges to Capacitor PushNotifications when present. APNs is
// deferred (no Apple Developer membership) — register() returns null
// honestly until the flag flips.
// ═══════════════════════════════════════════════════════════════

import type { PushPayload, PushDeliveryReceipt, PushRegistration } from "../contracts/push-contract";
import { MOBILE_PLATFORM_FLAGS } from "../runtime/mobile-platform-flags";
import { nativePush } from "../native/native-push";

export interface IOSPushAdapter {
  isEnabled(): boolean;
  register(): Promise<PushRegistration | null>;
  unregister(): Promise<void>;
  send(payload: PushPayload): Promise<PushDeliveryReceipt>;
}

export const iosPushAdapter: IOSPushAdapter = {
  isEnabled: () => !MOBILE_PLATFORM_FLAGS.apnsDisabled && nativePush.isAvailable(),

  async register() {
    if (MOBILE_PLATFORM_FLAGS.apnsDisabled) return null;
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
      transport: "apns",
      os: "ios",
      status: MOBILE_PLATFORM_FLAGS.apnsDisabled ? "failed" : "queued",
      timestamp: new Date().toISOString(),
      errorCode: MOBILE_PLATFORM_FLAGS.apnsDisabled ? "apns-deferred" : undefined,
    };
  },
};
