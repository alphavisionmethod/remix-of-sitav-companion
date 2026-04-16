// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Push Registration Bridge (Capacitor)
// Targets @capacitor/push-notifications when installed. APNs and
// FCM credentials are *deferred*; this returns honest "not-provisioned"
// receipts until the platform credentials land.
// ═══════════════════════════════════════════════════════════════

import { isCapacitorAvailable, invokeCapacitorPlugin, getCapacitorPlatform } from "./capacitor-bridge";
import type { PushRegistration, PushTransport } from "../contracts/push-contract";
import { MOBILE_PLATFORM_FLAGS } from "../runtime/mobile-platform-flags";

const PLUGIN = "PushNotifications";

export const nativePush = {
  isAvailable: () => isCapacitorAvailable(),

  /** Honest registration: returns null when no credentials are wired. */
  async register(): Promise<PushRegistration | null> {
    if (!isCapacitorAvailable()) return null;
    const platform = getCapacitorPlatform();
    if (platform === "ios" && MOBILE_PLATFORM_FLAGS.apnsDisabled) return null;
    if (platform === "android" && MOBILE_PLATFORM_FLAGS.fcmDisabled) return null;

    const perm = await invokeCapacitorPlugin<{ receive: string }>({
      pluginId: PLUGIN,
      method: "requestPermissions",
    });
    if (perm?.receive !== "granted") return null;

    await invokeCapacitorPlugin({ pluginId: PLUGIN, method: "register" });

    // Token comes async via 'registration' listener — surface a placeholder
    // that the listener layer fills in. Returning null here keeps the
    // contract honest until the token actually lands.
    return null;
  },

  async unregister(): Promise<boolean> {
    if (!isCapacitorAvailable()) return false;
    const res = await invokeCapacitorPlugin({ pluginId: PLUGIN, method: "removeAllListeners" });
    return res !== null;
  },

  resolveTransport(): PushTransport {
    const platform = getCapacitorPlatform();
    if (platform === "ios") return "apns";
    if (platform === "android") return "fcm";
    return "web-push";
  },
};
