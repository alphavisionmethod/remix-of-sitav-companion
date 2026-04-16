// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Push Registration Service
// Single entry point that resolves transport, asks the OS adapter
// to register, and surfaces an honest registration record.
// ═══════════════════════════════════════════════════════════════

import { iosPushAdapter } from "../ios/ios-push-adapter";
import { androidPushAdapter } from "../android/android-push-adapter";
import { detectMobileRuntime } from "../runtime/mobile-runtime-detection";
import type { PushRegistration, PushTransport } from "../contracts/push-contract";
import { resolveMobileCapability } from "../runtime/mobile-capability-resolver";
import { MOBILE_PLATFORM_FLAGS } from "../runtime/mobile-platform-flags";

export type PushRegistrationOutcome =
  | { status: "registered"; registration: PushRegistration }
  | { status: "deferred"; reason: "apns-deferred" | "fcm-credentials-pending" | "no-mobile-os" | "native-unavailable" | "permission-denied"; transport: PushTransport | null };

export const mobilePushRegistration = {
  async register(): Promise<PushRegistrationOutcome> {
    const probe = detectMobileRuntime();
    if (!probe.os) {
      return { status: "deferred", reason: "no-mobile-os", transport: "web-push" };
    }
    if (probe.os === "ios") {
      if (MOBILE_PLATFORM_FLAGS.apnsDisabled) {
        return { status: "deferred", reason: "apns-deferred", transport: "apns" };
      }
      const reg = await iosPushAdapter.register();
      if (reg) return { status: "registered", registration: reg };
      return { status: "deferred", reason: "native-unavailable", transport: "apns" };
    }
    if (probe.os === "android") {
      if (MOBILE_PLATFORM_FLAGS.fcmDisabled) {
        return { status: "deferred", reason: "fcm-credentials-pending", transport: "fcm" };
      }
      const reg = await androidPushAdapter.register();
      if (reg) return { status: "registered", registration: reg };
      return { status: "deferred", reason: "native-unavailable", transport: "fcm" };
    }
    return { status: "deferred", reason: "no-mobile-os", transport: null };
  },

  async unregister(): Promise<void> {
    const probe = detectMobileRuntime();
    if (probe.os === "ios") await iosPushAdapter.unregister();
    if (probe.os === "android") await androidPushAdapter.unregister();
  },

  /** Honest snapshot used by admin/health surfaces. */
  snapshot() {
    const probe = detectMobileRuntime();
    const transport: PushTransport | null =
      probe.os === "ios" ? "apns" : probe.os === "android" ? "fcm" : "web-push";
    const capId = probe.os === "ios" ? "push.apns" : probe.os === "android" ? "push.fcm" : "push.web";
    const cap = resolveMobileCapability(capId, probe.os);
    return {
      os: probe.os,
      host: probe.host,
      transport,
      capabilityStatus: cap.status,
      apnsDisabled: MOBILE_PLATFORM_FLAGS.apnsDisabled,
      fcmDisabled: MOBILE_PLATFORM_FLAGS.fcmDisabled,
      sampledAt: new Date().toISOString(),
    };
  },
};
