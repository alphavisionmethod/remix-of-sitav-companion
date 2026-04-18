// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Update Contract
// Update lifecycle matching auto-updater.cjs behavior
// ═══════════════════════════════════════════════════════════════

export type UpdateLifecycleState =
  | "idle"
  | "checking"
  | "update-available"
  | "update-not-available"
  | "downloading"
  | "download-complete"
  | "installing"
  | "error"
  | "rollback";

export interface UpdateLifecycleTransition {
  from: UpdateLifecycleState;
  to: UpdateLifecycleState;
  trigger: string;
  userAction: boolean;
  description: string;
}

export const UPDATE_LIFECYCLE_TRANSITIONS: readonly UpdateLifecycleTransition[] = [
  { from: "idle", to: "checking", trigger: "checkForUpdates()", userAction: true, description: "User or schedule triggers update check" },
  { from: "checking", to: "update-available", trigger: "update-available event", userAction: false, description: "Server reports new version available" },
  { from: "checking", to: "update-not-available", trigger: "update-not-available event", userAction: false, description: "Current version is latest" },
  { from: "checking", to: "error", trigger: "error event", userAction: false, description: "Network or server error during check" },
  { from: "update-available", to: "downloading", trigger: "downloadUpdate()", userAction: true, description: "User confirms download" },
  { from: "downloading", to: "download-complete", trigger: "update-downloaded event", userAction: false, description: "Package downloaded and verified" },
  { from: "downloading", to: "error", trigger: "error event", userAction: false, description: "Download failed or hash mismatch" },
  { from: "download-complete", to: "installing", trigger: "installUpdate()", userAction: true, description: "User confirms install and restart" },
  { from: "installing", to: "idle", trigger: "app-restarted", userAction: false, description: "App restarts with new version" },
  { from: "error", to: "idle", trigger: "dismiss/retry", userAction: true, description: "User dismisses error or retries" },
  { from: "error", to: "rollback", trigger: "auto-rollback", userAction: false, description: "Failed update triggers rollback" },
  { from: "rollback", to: "idle", trigger: "rollback-complete", userAction: false, description: "Previous version restored" },
  { from: "update-not-available", to: "idle", trigger: "dismiss", userAction: true, description: "User acknowledges no update" },
] as const;

/** Signing assumptions for update packages */
export const UPDATE_SIGNING_ASSUMPTIONS = {
  /** All update packages must be signed */
  signatureRequired: true,
  /** Signature algorithm */
  algorithm: "RSA-SHA256",
  /** macOS: notarized via Apple Developer ID */
  macOSNotarization: true,
  /** Windows: Authenticode signature */
  windowsAuthenticode: true,
  /** Linux: checksum verification (no OS-level signing standard) */
  linuxChecksumVerification: true,
  /** Update feed served over HTTPS only */
  httpsOnly: true,
} as const;

/** Rollback behavior definition */
export const UPDATE_ROLLBACK_BEHAVIOR = {
  /** Whether automatic rollback is supported */
  automaticRollback: true,
  /** Max rollback versions kept */
  maxRollbackVersions: 2,
  /** Rollback trigger conditions */
  triggers: [
    "Crash loop detected within 30 seconds of launch after update",
    "Main process fails to initialize",
    "Critical IPC bridge methods unavailable after update",
  ],
  /** What gets preserved during rollback */
  preservedData: ["user-data", "settings", "local-backups"],
  /** What gets reset during rollback */
  resetData: ["cache", "temp-files"],
} as const;

/** Degraded mode when updates fail */
export const UPDATE_DEGRADED_MODE = {
  /** App continues to function with current version */
  continueOperation: true,
  /** Show persistent banner about failed update */
  showBanner: true,
  /** Retry interval in minutes */
  retryIntervalMinutes: 60,
  /** Max retry attempts before giving up */
  maxRetries: 5,
  /** Offer manual download link as fallback */
  manualDownloadFallback: true,
} as const;
