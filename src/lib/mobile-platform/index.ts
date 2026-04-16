// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Platform Public Barrel
// Canonical import path: @/lib/mobile-platform
// ═══════════════════════════════════════════════════════════════

// Contracts
export * from "./contracts/mobile-platform-contract";
export * from "./contracts/ios-capability-matrix";
export * from "./contracts/android-capability-matrix";
export * from "./contracts/permission-matrix";
export * from "./contracts/push-contract";
export * from "./contracts/deep-link-contract";
export * from "./contracts/lifecycle-contract";
export * from "./contracts/background-task-contract";
export * from "./contracts/secure-storage-contract";
export * from "./contracts/biometric-contract";
export * from "./contracts/offline-sync-contract";
export * from "./contracts/state-restore-contract";
export * from "./contracts/network-degradation-contract";

// Runtime
export * from "./runtime/mobile-runtime-detection";
export * from "./runtime/mobile-platform-flags";
export * from "./runtime/mobile-capability-resolver";
export * from "./runtime/mobile-permission-resolver";
export * from "./runtime/mobile-parity-resolver";
export { MobileRuntimeProvider, useMobileRuntime, useMobileCapability } from "./runtime/mobile-runtime-context";

// Adapters (iOS)
export { iosRuntimeAdapter } from "./ios/ios-runtime-adapter";
export { iosPushAdapter } from "./ios/ios-push-adapter";
export { iosSecureStorage } from "./ios/ios-secure-storage";
export { iosBiometricAdapter } from "./ios/ios-biometric-adapter";
export { iosDeepLinkAdapter } from "./ios/ios-deep-link-adapter";
export { iosBackgroundTasksAdapter } from "./ios/ios-background-tasks";
export { iosLifecycleAdapter } from "./ios/ios-lifecycle-adapter";
export { IOS_RELEASE_CHANNELS } from "./ios/ios-release-channel";

// Adapters (Android)
export { androidRuntimeAdapter } from "./android/android-runtime-adapter";
export { androidPushAdapter } from "./android/android-push-adapter";
export { androidSecureStorage } from "./android/android-secure-storage";
export { androidBiometricAdapter } from "./android/android-biometric-adapter";
export { androidDeepLinkAdapter } from "./android/android-deep-link-adapter";
export { androidBackgroundTasksAdapter } from "./android/android-background-tasks";
export { androidLifecycleAdapter } from "./android/android-lifecycle-adapter";
export { ANDROID_RELEASE_CHANNELS } from "./android/android-release-channel";

// Sync
export { mobileSyncQueue, SyncQueueManager } from "./sync/sync-queue-manager";
export { resolveConflict } from "./sync/sync-conflict-policy";
export { nextRetry } from "./sync/retry-policy";
export { classifyNetwork, shouldQueueMutation, shouldShowOfflineBanner } from "./sync/degraded-network-policy";
export { sampleNetworkSnapshot } from "./sync/network-sampler";
export { localStorageQueuePersistence, LocalStorageQueuePersistence } from "./sync/local-storage-persistence";
export { getMobileSyncHealth } from "./sync/mobile-sync-health";
export { mobileOfflineSyncEngine, MobileOfflineSyncEngine } from "./sync/mobile-offline-sync-engine";

// Security
export { computeDeviceTrust } from "./security/mobile-device-trust";
export { encryptLocal, decryptLocal } from "./security/mobile-local-encryption";
export { registerKey, listKeys, rotateKey } from "./security/mobile-key-management";
export { MOBILE_PRIVACY_GUARDS } from "./security/mobile-privacy-guards";

// Analytics
export { envelopeMobileEvent } from "./analytics/mobile-analytics-partition";
export { pushAnalyticsEvent } from "./analytics/push-analytics";
export { lifecycleAnalyticsEvent } from "./analytics/lifecycle-analytics";
export { recordMobileDiagnostic, drainMobileDiagnostics, peekMobileDiagnostics } from "./analytics/mobile-diagnostics";

// Navigation
export { MOBILE_DEEP_LINKS, resolveDeepLink } from "./navigation/mobile-deep-link-map";
export { MOBILE_ROUTE_REGISTRY, getMobileRouteEntry } from "./navigation/mobile-route-registry";
export { decideStateRestore } from "./navigation/mobile-state-restore";
export { evaluateNavigationGuards } from "./navigation/mobile-navigation-guards";

// Migration
export { MOBILE_FEATURE_CLASSIFICATION } from "./migration/mobile-feature-classification-map";
export { MOBILE_RUNTIME_CONFLICTS } from "./migration/mobile-runtime-conflict-map";
export { MOBILE_DEPRECATIONS } from "./migration/mobile-deprecation-map";

export const MOBILE_PLATFORM_LAYER_VERSION = "1.0.0" as const;
