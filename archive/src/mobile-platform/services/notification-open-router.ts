// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Open Router
// Phase 12 — receives `pushNotificationActionPerformed`, resolves
// the deep link, runs auth/biometric guards, and hands off to the
// app navigator. Records `notification.opened` analytic.
// ═══════════════════════════════════════════════════════════════

import { resolveDeepLink } from "../navigation/mobile-deep-link-map";
import { invokeCapacitorPlugin, isCapacitorAvailable } from "../native/capacitor-bridge";
import type { DeepLinkResolution } from "../contracts/deep-link-contract";

export interface NotificationOpenEvent {
  payloadId: string;
  deepLink: string;
  resolution: DeepLinkResolution | null;
  outcome: "navigated" | "blocked-auth" | "blocked-biometric" | "unresolved";
  at: string;
}

type NavHandler = (path: string) => void | Promise<void>;
type AuthChecker = () => Promise<boolean> | boolean;
type BiometricChecker = () => Promise<boolean> | boolean;

let navigator: NavHandler | null = null;
let authChecker: AuthChecker = () => true;
let biometricChecker: BiometricChecker = () => true;
const subscribers = new Set<(e: NotificationOpenEvent) => void>();
let nativeListenerAttached = false;

function emit(e: NotificationOpenEvent) {
  for (const cb of subscribers) {
    try { cb(e); } catch { /* noop */ }
  }
}

export const notificationOpenRouter = {
  /** Wire up the app router (called once from the app shell). */
  attachNavigator(nav: NavHandler) { navigator = nav; },

  /** Replace the auth gate (defaults to allow). */
  attachAuthChecker(checker: AuthChecker) { authChecker = checker; },

  /** Replace the biometric gate (defaults to allow). */
  attachBiometricChecker(checker: BiometricChecker) { biometricChecker = checker; },

  on(cb: (e: NotificationOpenEvent) => void): () => void {
    subscribers.add(cb);
    return () => { subscribers.delete(cb); };
  },

  /** Pure programmatic open — exposed for tests + non-Capacitor surfaces. */
  async openDeepLink(deepLink: string, payloadId = "manual"): Promise<NotificationOpenEvent> {
    const resolution = resolveDeepLink(deepLink);
    const at = new Date().toISOString();

    if (!resolution) {
      const evt: NotificationOpenEvent = { payloadId, deepLink, resolution: null, outcome: "unresolved", at };
      emit(evt);
      return evt;
    }

    if (resolution.authRequirement === "authenticated" || resolution.authRequirement === "biometric") {
      const ok = await Promise.resolve(authChecker());
      if (!ok) {
        const evt: NotificationOpenEvent = { payloadId, deepLink, resolution, outcome: "blocked-auth", at };
        emit(evt);
        return evt;
      }
    }

    if (resolution.authRequirement === "biometric") {
      const bio = await Promise.resolve(biometricChecker());
      if (!bio) {
        const evt: NotificationOpenEvent = { payloadId, deepLink, resolution, outcome: "blocked-biometric", at };
        emit(evt);
        return evt;
      }
    }

    if (navigator) {
      try { await navigator(resolution.routePath); } catch (err) {
        console.warn("[notificationOpenRouter] nav failed", err);
      }
    }
    const evt: NotificationOpenEvent = { payloadId, deepLink, resolution, outcome: "navigated", at };
    emit(evt);
    return evt;
  },

  /**
   * Bind the native `pushNotificationActionPerformed` listener exactly
   * once. Safe in pure-web environments (no-op).
   */
  attachNativeListener() {
    if (nativeListenerAttached || !isCapacitorAvailable()) return;
    nativeListenerAttached = true;
    void invokeCapacitorPlugin({
      pluginId: "PushNotifications",
      method: "addListener",
      options: {
        eventName: "pushNotificationActionPerformed",
        callback: async (action: { notification: { data?: Record<string, unknown>; id?: string } }) => {
          const data = action?.notification?.data ?? {};
          const deepLink = (data.deepLink as string) || (data.url as string) || "/mobile";
          const payloadId = action?.notification?.id || (data.id as string) || "unknown";
          await notificationOpenRouter.openDeepLink(deepLink, payloadId);
        },
      },
    });
  },
};
