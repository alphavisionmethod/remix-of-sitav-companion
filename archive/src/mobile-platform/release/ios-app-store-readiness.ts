// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS App Store Readiness Registry
// Phase 12 — the 18-item iOS deployability checklist as data.
// ═══════════════════════════════════════════════════════════════

export type ReadinessStatus = "ready" | "partial" | "deferred" | "missing";

export interface ReadinessItem {
  readonly id: string;
  readonly title: string;
  readonly status: ReadinessStatus;
  readonly evidence: string;
  readonly blocker: boolean;
  readonly remediation?: string;
}

export const IOS_APP_STORE_READINESS: ReadonlyArray<ReadinessItem> = [
  {
    id: "ios-runtime-contract",
    title: "iOS runtime contract exists",
    status: "ready",
    evidence: "src/lib/mobile-platform/ios/ + contracts/mobile-platform-contract.ts",
    blocker: false,
  },
  {
    id: "ios-deep-links",
    title: "Deep-link routing works on iOS (Universal Links + sita://)",
    status: "ready",
    evidence: "navigation/mobile-deep-link-map.ts + ios adapter",
    blocker: false,
  },
  {
    id: "ios-apns",
    title: "Push notifications via APNs",
    status: "deferred",
    evidence: "Apple Developer membership pending; nativePush honestly returns null",
    blocker: false,
    remediation: "Provision Apple Developer Program membership, then add APNS_KEY_ID/APNS_TEAM_ID secrets and flip MOBILE_PLATFORM_FLAGS.apnsDisabled.",
  },
  {
    id: "ios-apns-token-lifecycle",
    title: "APNs token lifecycle handled (register/refresh/rotate/revoke)",
    status: "ready",
    evidence: "services/push-token-lifecycle.ts + mobile_push_tokens table",
    blocker: false,
  },
  {
    id: "ios-secure-storage",
    title: "Secure local storage (Keychain)",
    status: "ready",
    evidence: "native/native-secure-storage.ts → Capacitor Preferences + iOS Keychain",
    blocker: false,
  },
  {
    id: "ios-session-restore",
    title: "Session restore works",
    status: "ready",
    evidence: "navigation/mobile-state-restore.ts",
    blocker: false,
  },
  {
    id: "ios-biometric",
    title: "Biometric auth (Face ID / Touch ID)",
    status: "ready",
    evidence: "native/native-biometric.ts + biometric-contract.ts",
    blocker: false,
  },
  {
    id: "ios-permissions",
    title: "Permission prompts explicit + correct",
    status: "ready",
    evidence: "contracts/permission-matrix.ts (rationale + denial fallback per permission)",
    blocker: false,
  },
  {
    id: "ios-offline-queue",
    title: "Offline queue survives app restarts",
    status: "ready",
    evidence: "sync/sync-queue-manager.ts (durable persistence)",
    blocker: false,
  },
  {
    id: "ios-background-tasks",
    title: "Background refresh / BGTaskScheduler defined",
    status: "ready",
    evidence: "contracts/background-task-contract.ts (5 task kinds)",
    blocker: false,
  },
  {
    id: "ios-release-pipeline",
    title: "Release pipeline (xcodebuild → IPA)",
    status: "ready",
    evidence: "scripts/release/ios/build-ios.sh",
    blocker: false,
  },
  {
    id: "ios-signing",
    title: "Bundle ID / signing / provisioning configured",
    status: "deferred",
    evidence: "Pipeline accepts IOS_TEAM_ID/IOS_PROVISIONING_PROFILE/IOS_SIGNING_CERTIFICATE; user must provide once Apple membership lands",
    blocker: false,
    remediation: "After Apple Developer enrollment, set IOS_TEAM_ID, IOS_BUNDLE_ID, IOS_PROVISIONING_PROFILE, IOS_SIGNING_CERTIFICATE in CI secrets.",
  },
  {
    id: "ios-startup",
    title: "App startup + re-entry tested",
    status: "ready",
    evidence: "native/native-app-lifecycle.ts + lifecycle-contract.ts",
    blocker: false,
  },
  {
    id: "ios-notification-open",
    title: "Notification-open → screen restore works",
    status: "ready",
    evidence: "services/notification-open-router.ts",
    blocker: false,
  },
  {
    id: "ios-network-degradation",
    title: "Network degradation defined + tested",
    status: "ready",
    evidence: "contracts/network-degradation-contract.ts + sync/degraded-network-policy.ts",
    blocker: false,
  },
  {
    id: "ios-crash-analytics",
    title: "Crash + analytics instrumentation",
    status: "ready",
    evidence: "analytics/ partition (mobile-specific buffer)",
    blocker: false,
  },
  {
    id: "ios-store-checklist",
    title: "App Store release readiness checklist exists",
    status: "ready",
    evidence: "release/ios-app-store-readiness.ts (this file)",
    blocker: false,
  },
  {
    id: "ios-min-version",
    title: "Minimum iOS version defined + enforced",
    status: "ready",
    evidence: "release/min-os-version-contract.ts → ios 16.0",
    blocker: false,
  },
];
