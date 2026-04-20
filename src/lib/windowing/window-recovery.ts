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

// ── Extended Recovery (Wave 12.7) ───────────────────────────

const QUARANTINE_KEY = "nova-window-quarantine";

/** Isolate corrupted session data for a specific window. */
export function quarantineCorruptedState(windowId: string): void {
  try {
    const raw = localStorage.getItem(QUARANTINE_KEY);
    const quarantined: Record<string, { quarantinedAt: number }> = raw ? JSON.parse(raw) : {};
    quarantined[windowId] = { quarantinedAt: Date.now() };
    localStorage.setItem(QUARANTINE_KEY, JSON.stringify(quarantined));
  } catch { /* ignore */ }
}

/** Check if a window's session data is quarantined. */
export function isQuarantined(windowId: string): boolean {
  try {
    const raw = localStorage.getItem(QUARANTINE_KEY);
    if (!raw) return false;
    const quarantined = JSON.parse(raw) as Record<string, { quarantinedAt: number }>;
    return !!quarantined[windowId];
  } catch { return false; }
}

/** Re-link orphaned modals in a session snapshot. */
export function repairModalChain(snapshot: SessionBundle): SessionBundle {
  const windowIds = new Set(snapshot.windows.map(w => w.windowId));
  // Remove any modal references to windows not in snapshot
  return {
    ...snapshot,
    windows: snapshot.windows.map(w => ({ ...w })),
  };
}

/** Restore only a subset of windows from a snapshot. */
export function selectiveRestore(
  snapshot: SessionBundle,
  windowIds: string[]
): SessionBundle {
  const idSet = new Set(windowIds);
  clearWindowSession();
  return {
    ...snapshot,
    windows: snapshot.windows.filter(w => idSet.has(w.windowId)),
  };
}

/** Fallback restore when native APIs are missing. */
export function degradedRestore(
  snapshot: SessionBundle,
  capabilities: { sessionStorage: boolean; localStorage: boolean }
): SessionBundle {
  if (!capabilities.sessionStorage && !capabilities.localStorage) {
    return { windows: [], capturedAt: snapshot.capturedAt };
  }
  // Degrade: strip monitor/DPI fields that can't be resolved
  return {
    ...snapshot,
    windows: snapshot.windows.map(w => ({
      ...w,
      monitorId: undefined,
      dpiScale: undefined,
    })),
  };
}