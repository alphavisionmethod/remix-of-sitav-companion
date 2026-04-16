// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Runtime Contract
// Canonical contract for iOS / Android / Mobile-PWA tiers.
// Bound to Capacitor adapter & PWA install path.
// ═══════════════════════════════════════════════════════════════

export type MobileSurface = "ios" | "android" | "mobile-pwa";

export type MobileCapability =
  | "biometrics"
  | "secure-storage"
  | "push-apns"
  | "push-fcm"
  | "push-web"
  | "deep-link"
  | "offline-sync"
  | "background-fetch"
  | "haptics"
  | "camera"
  | "share-sheet"
  | "app-store-distribution";

export interface MobileRuntimeCapabilityState {
  readonly surface: MobileSurface;
  readonly capability: MobileCapability;
  readonly available: boolean;
  readonly via: "capacitor" | "web-api" | "pwa-shell" | "deferred";
  readonly notes?: string;
}

/** Honest matrix per architectural decision in memory:
 *  - Web push (VAPID) active everywhere
 *  - APNs deferred (no Apple paid membership)
 *  - FCM optional/planned
 */
export const MOBILE_RUNTIME_CAPABILITIES: readonly MobileRuntimeCapabilityState[] = [
  // iOS
  { surface: "ios", capability: "biometrics", available: true, via: "capacitor" },
  { surface: "ios", capability: "secure-storage", available: true, via: "capacitor" },
  { surface: "ios", capability: "push-apns", available: false, via: "deferred", notes: "APNs deferred — no Apple membership yet" },
  { surface: "ios", capability: "push-web", available: true, via: "web-api" },
  { surface: "ios", capability: "deep-link", available: true, via: "capacitor" },
  { surface: "ios", capability: "offline-sync", available: true, via: "capacitor" },
  { surface: "ios", capability: "background-fetch", available: true, via: "capacitor" },
  { surface: "ios", capability: "haptics", available: true, via: "capacitor" },
  { surface: "ios", capability: "camera", available: true, via: "capacitor" },
  { surface: "ios", capability: "share-sheet", available: true, via: "capacitor" },
  { surface: "ios", capability: "app-store-distribution", available: false, via: "deferred", notes: "Requires paid Apple Developer account" },
  // Android
  { surface: "android", capability: "biometrics", available: true, via: "capacitor" },
  { surface: "android", capability: "secure-storage", available: true, via: "capacitor" },
  { surface: "android", capability: "push-fcm", available: true, via: "capacitor", notes: "FCM_SERVICE_ACCOUNT_JSON required at deploy time" },
  { surface: "android", capability: "push-web", available: true, via: "web-api" },
  { surface: "android", capability: "deep-link", available: true, via: "capacitor" },
  { surface: "android", capability: "offline-sync", available: true, via: "capacitor" },
  { surface: "android", capability: "background-fetch", available: true, via: "capacitor" },
  { surface: "android", capability: "haptics", available: true, via: "capacitor" },
  { surface: "android", capability: "camera", available: true, via: "capacitor" },
  { surface: "android", capability: "share-sheet", available: true, via: "capacitor" },
  { surface: "android", capability: "app-store-distribution", available: true, via: "capacitor" },
  // Mobile-PWA
  { surface: "mobile-pwa", capability: "biometrics", available: true, via: "web-api", notes: "WebAuthn / platform authenticator" },
  { surface: "mobile-pwa", capability: "secure-storage", available: false, via: "web-api", notes: "Falls back to IndexedDB; not hardware-backed" },
  { surface: "mobile-pwa", capability: "push-web", available: true, via: "web-api" },
  { surface: "mobile-pwa", capability: "deep-link", available: true, via: "pwa-shell" },
  { surface: "mobile-pwa", capability: "offline-sync", available: true, via: "pwa-shell" },
  { surface: "mobile-pwa", capability: "background-fetch", available: true, via: "pwa-shell" },
  { surface: "mobile-pwa", capability: "haptics", available: true, via: "web-api" },
  { surface: "mobile-pwa", capability: "camera", available: true, via: "web-api" },
  { surface: "mobile-pwa", capability: "share-sheet", available: true, via: "web-api" },
  { surface: "mobile-pwa", capability: "app-store-distribution", available: false, via: "pwa-shell", notes: "Distribution via install-to-home-screen, not app stores" },
];

export function getMobileCapabilities(surface: MobileSurface): readonly MobileRuntimeCapabilityState[] {
  return MOBILE_RUNTIME_CAPABILITIES.filter((c) => c.surface === surface);
}

export function isMobileCapabilityAvailable(surface: MobileSurface, capability: MobileCapability): boolean {
  const entry = MOBILE_RUNTIME_CAPABILITIES.find((c) => c.surface === surface && c.capability === capability);
  return entry?.available ?? false;
}
