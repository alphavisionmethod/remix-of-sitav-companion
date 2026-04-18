// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Deprecation Map
// Old mobile patterns to retire as the platform layer rolls out.
// ═══════════════════════════════════════════════════════════════

export interface MobileDeprecation {
  symbol: string;
  reason: string;
  replacement: string;
  removeAfter: string;
}

export const MOBILE_DEPRECATIONS: ReadonlyArray<MobileDeprecation> = [
  {
    symbol: "ad-hoc push registration in components",
    reason: "Push must be platform-routed.",
    replacement: "Use push-contract + ios/android push adapters.",
    removeAfter: "v1.1.0",
  },
  {
    symbol: "page-local offline localStorage access",
    reason: "Per-page offline logic creates inconsistency.",
    replacement: "mobileSyncQueue + offline-sync-contract.",
    removeAfter: "v1.1.0",
  },
  {
    symbol: "page-local biometric stubs",
    reason: "No platform truth.",
    replacement: "iosBiometricAdapter / androidBiometricAdapter.",
    removeAfter: "v1.1.0",
  },
] as const;
