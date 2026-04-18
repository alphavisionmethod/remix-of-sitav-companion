// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Capability Matrix
// Authoritative truth: what iOS can do under SITA mobile runtime.
// ═══════════════════════════════════════════════════════════════

import type { MobileCapabilityId, MobileCapabilityStatus } from "./mobile-platform-contract";

export interface IOSCapabilityRow {
  capability: MobileCapabilityId;
  status: MobileCapabilityStatus;
  /** Minimum iOS version required, e.g. "16.0". */
  minVersion: string | null;
  /** Honest note shown in admin/launch-honesty UI. */
  note: string;
  /** Fallback to use when not supported. */
  fallback: string | null;
}

export const IOS_CAPABILITY_MATRIX: ReadonlyArray<IOSCapabilityRow> = [
  { capability: "biometric.faceid",          status: "supported",   minVersion: "16.0", note: "Face ID via LocalAuthentication.",                fallback: "device passcode" },
  { capability: "biometric.touchid",         status: "supported",   minVersion: "16.0", note: "Touch ID on supported hardware.",                  fallback: "device passcode" },
  { capability: "biometric.fingerprint",     status: "unsupported", minVersion: null,   note: "Android-only nomenclature.",                       fallback: null },
  { capability: "secure-storage.keychain",   status: "supported",   minVersion: "16.0", note: "iOS Keychain with kSecAttrAccessibleWhenUnlocked.", fallback: null },
  { capability: "secure-storage.keystore",   status: "unsupported", minVersion: null,   note: "Android-only abstraction.",                        fallback: "keychain" },
  { capability: "push.apns",                 status: "roadmap",     minVersion: "16.0", note: "APNs deferred — Apple Developer membership pending.", fallback: "in-app inbox" },
  { capability: "push.fcm",                  status: "unsupported", minVersion: null,   note: "Android transport.",                                fallback: null },
  { capability: "push.web",                  status: "fallback",    minVersion: "16.4", note: "Web Push only when installed as PWA on iOS 16.4+.", fallback: "in-app inbox" },
  { capability: "background.refresh",        status: "supported",   minVersion: "16.0", note: "BGAppRefreshTask, OS-controlled scheduling.",      fallback: "foreground-only refresh" },
  { capability: "background.fetch",          status: "supported",   minVersion: "16.0", note: "Legacy BGTaskScheduler.",                          fallback: "foreground-only refresh" },
  { capability: "background.processing",     status: "supported",   minVersion: "16.0", note: "BGProcessingTask for heavier work.",               fallback: "foreground processing" },
  { capability: "deep-link.universal",       status: "supported",   minVersion: "16.0", note: "Apple Universal Links via associated domains.",     fallback: "custom-scheme" },
  { capability: "deep-link.app-link",        status: "unsupported", minVersion: null,   note: "Android-only.",                                    fallback: null },
  { capability: "deep-link.custom-scheme",   status: "supported",   minVersion: "16.0", note: "sita:// scheme.",                                  fallback: null },
  { capability: "lifecycle.state-restore",   status: "supported",   minVersion: "16.0", note: "UIScene state restoration.",                       fallback: "cold-start to home" },
  { capability: "lifecycle.foreground-service", status: "unsupported", minVersion: null, note: "Android-only concept.",                           fallback: null },
  { capability: "offline.durable-queue",     status: "supported",   minVersion: "16.0", note: "SQLite-backed queue (Capacitor SQLite plugin).",    fallback: "in-memory queue" },
  { capability: "offline.optimistic-mutation", status: "supported", minVersion: "16.0", note: "Mutation buffering with conflict policy.",          fallback: "blocking mutations" },
  { capability: "network.degradation-aware", status: "supported",   minVersion: "16.0", note: "NWPathMonitor signal exposed to app.",              fallback: "navigator.onLine" },
  { capability: "device-trust.attestation",  status: "supported",   minVersion: "16.0", note: "DeviceCheck / App Attest.",                        fallback: "soft trust score" },
  { capability: "device-trust.integrity",    status: "supported",   minVersion: "16.0", note: "App Attest integrity assertions.",                 fallback: "soft trust score" },
  { capability: "permissions.notifications", status: "supported",   minVersion: "16.0", note: "UNUserNotificationCenter.",                        fallback: "in-app banners" },
  { capability: "permissions.camera",        status: "supported",   minVersion: "16.0", note: "AVFoundation, Info.plist NSCameraUsageDescription.", fallback: "file picker" },
  { capability: "permissions.photos",        status: "supported",   minVersion: "16.0", note: "PHPhotoLibrary, limited library access supported.", fallback: "file picker" },
  { capability: "permissions.microphone",    status: "supported",   minVersion: "16.0", note: "AVAudioSession.",                                  fallback: null },
  { capability: "permissions.location",      status: "roadmap",     minVersion: "16.0", note: "Not currently requested by SITA.",                 fallback: null },
  { capability: "permissions.contacts",      status: "roadmap",     minVersion: "16.0", note: "Not currently requested by SITA.",                 fallback: null },
  { capability: "permissions.calendar",      status: "roadmap",     minVersion: "16.0", note: "Concierge calendar integration future work.",      fallback: "manual entry" },
  { capability: "permissions.health",        status: "roadmap",     minVersion: "16.0", note: "HealthKit not enabled.",                           fallback: null },
] as const;

export function getIOSCapability(id: MobileCapabilityId): IOSCapabilityRow | undefined {
  return IOS_CAPABILITY_MATRIX.find((r) => r.capability === id);
}
