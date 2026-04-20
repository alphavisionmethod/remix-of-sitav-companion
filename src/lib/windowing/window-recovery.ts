// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Recovery
// Crash-safe restore: detect unclean shutdown → offer restore.
// ═══════════════════════════════════════════════════════════════

import {
  loadWindowSession,
  wasCleanShutdown,
  clearCleanShutdownFlag,
  clearWindowSession,
  type SessionBundle,
} from "./window-session-store";

export interface RecoveryState {
  /** Was the previous shutdown unclean? */
  crashDetected: boolean;
  /** Snapshot from the crashed session (if available). */
  snapshot: SessionBundle | null;
  /** Number of windows that can be restored. */
  restorableCount: number;
}

/**
 * Probe for crash recovery state. Call once at boot.
 * After calling, clear the clean shutdown flag so the NEXT
 * shutdown can be detected.
 */
export function probeRecoveryState(): RecoveryState {
  const clean = wasCleanShutdown();
  const snapshot = loadWindowSession();
  
  // Clear flag so future crashes are detectable
  clearCleanShutdownFlag();

  if (clean || !snapshot || snapshot.windows.length === 0) {
    return { crashDetected: false, snapshot: null, restorableCount: 0 };
  }

  // Unclean shutdown with saved windows → offer restore
  return {
    crashDetected: true,
    snapshot,
    restorableCount: snapshot.windows.length,
  };
}

/** User accepted restore — return the snapshots. */
export function acceptRestore(state: RecoveryState): SessionBundle | null {
  if (!state.snapshot) return null;
  // Clear session now that it's been consumed
  clearWindowSession();
  return state.snapshot;
}

/** User declined restore — discard the snapshot. */
export function declineRestore(): void {
  clearWindowSession();
}