// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot State Persistence
// 2.0.9 Recovery & interruption architecture
// Persists boot progress to sessionStorage for resume-on-reload
// Handles network loss, power interruption, graceful degradation
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "sita-boot-state";

export interface PersistedBootState {
  phase: string;
  phaseTimestamp: number;
  hwChecksComplete: string[];
  a11yOptions: string[];
  interrupted: boolean;
  interruptionReason?: "reload" | "network-loss" | "timeout" | "unknown";
}

// ── Write ───────────────────────────────────────────────────

export function persistBootState(state: PersistedBootState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — continue silently
  }
}

// ── Read ────────────────────────────────────────────────────

export function loadPersistedBootState(): PersistedBootState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBootState;
    // If persisted more than 5 minutes ago, discard (stale)
    if (Date.now() - parsed.phaseTimestamp > 5 * 60 * 1000) {
      clearPersistedBootState();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// ── Clear ───────────────────────────────────────────────────

export function clearPersistedBootState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Determine resume phase ──────────────────────────────────

const RESUMABLE_PHASES = [
  "HARDWARE_DETECT",
  "SECURE_INIT",
  "POST_SECURE",
  "WORKSPACE_PREP",
  "TRUSTED_SERVICES",
  "FINALIZING",
];

/**
 * Given persisted state, returns the phase to resume from.
 * Early phases restart from the beginning.
 * Late phases skip ahead to avoid repeating completed work.
 */
export function getResumePhase(persisted: PersistedBootState): string | null {
  if (RESUMABLE_PHASES.includes(persisted.phase)) {
    return persisted.phase;
  }
  return null; // restart from beginning
}

// ── Network status helpers ──────────────────────────────────

export function isNetworkAvailable(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// ── Visibility change (tab switch / power save) ─────────────

export function onVisibilityChange(callback: (hidden: boolean) => void): () => void {
  const handler = () => callback(document.hidden);
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}
