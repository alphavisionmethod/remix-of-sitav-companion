// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile State Restore Contract
// Cold-start / warm-resume / deep-link restore semantics.
// ═══════════════════════════════════════════════════════════════

export type StateRestoreMode = "cold-start" | "warm-resume" | "deep-link" | "push-open";

export interface StateRestoreRequest {
  mode: StateRestoreMode;
  /** Deep-link key when mode is deep-link or push-open. */
  deepLinkKey?: string;
  /** Last known route the app was on. */
  lastRoute?: string;
  /** Wall-clock seconds since the app was last foregrounded. */
  secondsSinceLastForeground?: number;
}

export interface StateRestoreDecision {
  targetRoute: string;
  /** Whether the app must trigger biometric prompt before reveal. */
  requireBiometric: boolean;
  /** Whether cached data may be shown while live data hydrates. */
  allowStaleHydration: boolean;
  /** Honest reason string for analytics + diagnostics. */
  reason: string;
}
