// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Play Store Readiness Registry
// Phase 12 — the 18-item Android deployability checklist as data.
// ═══════════════════════════════════════════════════════════════

import type { ReadinessItem } from "./ios-app-store-readiness";

export const ANDROID_PLAY_STORE_READINESS: ReadonlyArray<ReadinessItem> = [
  {
    id: "android-runtime-contract",
    title: "Android runtime contract exists",
    status: "ready",
    evidence: "src/lib/mobile-platform/android/ + contracts/mobile-platform-contract.ts",
    blocker: false,
  },
  {
    id: "android-deep-links",
    title: "Deep-link routing works on Android (App Links + sita://)",
    status: "ready",
    evidence: "navigation/mobile-deep-link-map.ts + android adapter",
    blocker: false,
  },
  {
    id: "android-fcm",
    title: "Push notifications via FCM",
    status: "deferred",
    evidence: "FCM service-account credentials pending; nativePush honestly returns null on android until provisioned",
    blocker: false,
    remediation: "Provision Firebase project, set FCM_SERVICE_ACCOUNT_JSON secret, and flip MOBILE_PLATFORM_FLAGS.fcmDisabled.",
  },
  {
    id: "android-fcm-token-lifecycle",
    title: "FCM token lifecycle handled (register/refresh/rotate/revoke)",
    status: "ready",
    evidence: "services/push-token-lifecycle.ts + mobile_push_tokens table",
    blocker: false,
  },
  {
    id: "android-secure-storage",
    title: "Secure local storage (Keystore)",
    status: "ready",
    evidence: "native/native-secure-storage.ts → Capacitor Preferences + Android Keystore",
    blocker: false,
  },
  {
    id: "android-session-restore",
    title: "Session restore works",
    status: "ready",
    evidence: "navigation/mobile-state-restore.ts",
    blocker: false,
  },
  {
    id: "android-biometric",
    title: "Biometric auth (BiometricPrompt)",
    status: "ready",
    evidence: "native/native-biometric.ts + biometric-contract.ts",
    blocker: false,
  },
  {
    id: "android-permissions",
    title: "Android-specific permission model",
    status: "ready",
    evidence: "contracts/permission-matrix.ts (per-permission android branch)",
    blocker: false,
  },
  {
    id: "android-offline-queue",
    title: "Offline queue survives restarts",
    status: "ready",
    evidence: "sync/sync-queue-manager.ts (durable persistence)",
    blocker: false,
  },
  {
    id: "android-background-tasks",
    title: "Background tasks via WorkManager defined",
    status: "ready",
    evidence: "contracts/background-task-contract.ts (5 task kinds)",
    blocker: false,
  },
  {
    id: "android-release-pipeline",
    title: "Release pipeline (Gradle bundleRelease → AAB)",
    status: "ready",
    evidence: "scripts/release/android/build-android.sh",
    blocker: false,
  },
  {
    id: "android-signing",
    title: "Signing / build variants configured",
    status: "ready",
    evidence: "Pipeline accepts ANDROID_KEYSTORE_PATH / ANDROID_KEY_ALIAS / passwords; user provides once",
    blocker: false,
  },
  {
    id: "android-notification-open",
    title: "Notification-open → route restore works",
    status: "ready",
    evidence: "services/notification-open-router.ts",
    blocker: false,
  },
  {
    id: "android-update-path",
    title: "App update path defined",
    status: "ready",
    evidence: "Play in-app updates via Android adapter; OTA web bundle via cap sync",
    blocker: false,
  },
  {
    id: "android-crash-analytics",
    title: "Crash + analytics diagnostics",
    status: "ready",
    evidence: "analytics/ partition (mobile-specific buffer)",
    blocker: false,
  },
  {
    id: "android-store-checklist",
    title: "Play Store readiness checklist exists",
    status: "ready",
    evidence: "release/android-play-store-readiness.ts (this file)",
    blocker: false,
  },
  {
    id: "android-min-version",
    title: "Minimum Android API level defined + enforced",
    status: "ready",
    evidence: "release/min-os-version-contract.ts → API 26 (Android 8.0)",
    blocker: false,
  },
  {
    id: "android-degraded",
    title: "Unsupported capabilities degrade honestly",
    status: "ready",
    evidence: "runtime/mobile-capability-resolver.ts + capability matrix",
    blocker: false,
  },
];
