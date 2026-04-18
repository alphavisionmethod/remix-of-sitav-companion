// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Capability Matrix
// Authoritative truth: what Android can do under SITA mobile runtime.
// ═══════════════════════════════════════════════════════════════

import type { MobileCapabilityId, MobileCapabilityStatus } from "./mobile-platform-contract";

export interface AndroidCapabilityRow {
  capability: MobileCapabilityId;
  status: MobileCapabilityStatus;
  /** Minimum Android API level, e.g. 26. */
  minSdk: number | null;
  note: string;
  fallback: string | null;
}

export const ANDROID_CAPABILITY_MATRIX: ReadonlyArray<AndroidCapabilityRow> = [
  { capability: "biometric.faceid",          status: "unsupported", minSdk: null, note: "iOS-only branding; use generic biometric.",        fallback: "biometric.fingerprint" },
  { capability: "biometric.touchid",         status: "unsupported", minSdk: null, note: "iOS-only branding.",                                fallback: "biometric.fingerprint" },
  { capability: "biometric.fingerprint",     status: "supported",   minSdk: 28,   note: "AndroidX BiometricPrompt (BIOMETRIC_STRONG).",      fallback: "device PIN" },
  { capability: "secure-storage.keychain",   status: "unsupported", minSdk: null, note: "iOS-only abstraction.",                             fallback: "keystore" },
  { capability: "secure-storage.keystore",   status: "supported",   minSdk: 28,   note: "Android Keystore + EncryptedSharedPreferences.",    fallback: null },
  { capability: "push.apns",                 status: "unsupported", minSdk: null, note: "iOS transport.",                                    fallback: null },
  { capability: "push.fcm",                  status: "roadmap",     minSdk: 26,   note: "FCM service-account credentials not yet provisioned.", fallback: "in-app inbox" },
  { capability: "push.web",                  status: "fallback",    minSdk: 26,   note: "Web Push via Chromium when used as PWA.",          fallback: "in-app inbox" },
  { capability: "background.refresh",        status: "supported",   minSdk: 26,   note: "WorkManager periodic work.",                        fallback: "foreground-only refresh" },
  { capability: "background.fetch",          status: "supported",   minSdk: 26,   note: "WorkManager one-shot.",                             fallback: "foreground-only refresh" },
  { capability: "background.processing",     status: "supported",   minSdk: 26,   note: "WorkManager + ForegroundService for long jobs.",    fallback: "foreground processing" },
  { capability: "deep-link.universal",       status: "unsupported", minSdk: null, note: "iOS-only.",                                         fallback: null },
  { capability: "deep-link.app-link",        status: "supported",   minSdk: 26,   note: "Android App Links via assetlinks.json.",            fallback: "custom-scheme" },
  { capability: "deep-link.custom-scheme",   status: "supported",   minSdk: 26,   note: "sita:// scheme intent filter.",                     fallback: null },
  { capability: "lifecycle.state-restore",   status: "supported",   minSdk: 26,   note: "onSaveInstanceState + ViewModel SavedStateHandle.",  fallback: "cold-start to home" },
  { capability: "lifecycle.foreground-service", status: "supported", minSdk: 26,  note: "ForegroundService for sync/long jobs (Android 14 type).", fallback: "WorkManager" },
  { capability: "offline.durable-queue",     status: "supported",   minSdk: 26,   note: "Room DB-backed queue.",                             fallback: "in-memory queue" },
  { capability: "offline.optimistic-mutation", status: "supported", minSdk: 26,   note: "Mutation buffering with conflict policy.",          fallback: "blocking mutations" },
  { capability: "network.degradation-aware", status: "supported",   minSdk: 26,   note: "ConnectivityManager NetworkCallback.",              fallback: "navigator.onLine" },
  { capability: "device-trust.attestation",  status: "supported",   minSdk: 26,   note: "Play Integrity API.",                               fallback: "soft trust score" },
  { capability: "device-trust.integrity",    status: "supported",   minSdk: 26,   note: "Play Integrity verdict.",                           fallback: "soft trust score" },
  { capability: "permissions.notifications", status: "supported",   minSdk: 33,   note: "POST_NOTIFICATIONS runtime permission (API 33+).",  fallback: "in-app banners" },
  { capability: "permissions.camera",        status: "supported",   minSdk: 26,   note: "android.permission.CAMERA.",                        fallback: "file picker" },
  { capability: "permissions.photos",        status: "supported",   minSdk: 33,   note: "READ_MEDIA_IMAGES on API 33+, legacy READ_EXTERNAL_STORAGE below.", fallback: "file picker" },
  { capability: "permissions.microphone",    status: "supported",   minSdk: 26,   note: "android.permission.RECORD_AUDIO.",                  fallback: null },
  { capability: "permissions.location",      status: "roadmap",     minSdk: 26,   note: "Not currently requested by SITA.",                  fallback: null },
  { capability: "permissions.contacts",      status: "roadmap",     minSdk: 26,   note: "Not currently requested by SITA.",                  fallback: null },
  { capability: "permissions.calendar",      status: "roadmap",     minSdk: 26,   note: "Concierge calendar integration future work.",       fallback: "manual entry" },
  { capability: "permissions.health",        status: "roadmap",     minSdk: 26,   note: "Health Connect not enabled.",                       fallback: null },
] as const;

export function getAndroidCapability(id: MobileCapabilityId): AndroidCapabilityRow | undefined {
  return ANDROID_CAPABILITY_MATRIX.find((r) => r.capability === id);
}
