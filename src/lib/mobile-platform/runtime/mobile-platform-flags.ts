// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Platform Flags
// Centralized switches the rest of the mobile layer reads from.
// ═══════════════════════════════════════════════════════════════

export interface MobilePlatformFlags {
  /** Enable durable offline queue (vs in-memory only). */
  offlineQueueDurable: boolean;
  /** Show stale-data hints across mobile surfaces. */
  showStaleHints: boolean;
  /** Allow biometric-gated reveals on sensitive surfaces. */
  biometricGateEnabled: boolean;
  /** Enable lifecycle telemetry shipping. */
  lifecycleAnalyticsEnabled: boolean;
  /** Allow silent push to trigger background refresh. */
  silentPushRefreshEnabled: boolean;
  /** Hard disable APNs (defer flag). */
  apnsDisabled: boolean;
  /** Hard disable FCM (until credentials provisioned). */
  fcmDisabled: boolean;
}

export const MOBILE_PLATFORM_FLAGS: Readonly<MobilePlatformFlags> = Object.freeze({
  offlineQueueDurable: true,
  showStaleHints: true,
  biometricGateEnabled: true,
  lifecycleAnalyticsEnabled: true,
  silentPushRefreshEnabled: true,
  apnsDisabled: true, // honest: deferred per platform constraint
  fcmDisabled: true,  // honest: planned, not yet provisioned
});
