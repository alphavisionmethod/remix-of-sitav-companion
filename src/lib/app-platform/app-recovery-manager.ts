// ═══════════════════════════════════════════════════════════════
// SITA OS — App Recovery Manager
// Crash detection + restart with state snapshot for app platform.
// ═══════════════════════════════════════════════════════════════

const CRASH_STATE_KEY = "sita-app-crash-state";
const MAX_CRASH_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export type AppLifecyclePhase =
  | "not_installed"
  | "installing"
  | "installed"
  | "launching"
  | "running"
  | "updating"
  | "crashed"
  | "recovering"
  | "uninstalling"
  | "blocked";

export interface AppCrashSnapshot {
  appId: string;
  crashedAt: number;
  lastKnownPhase: AppLifecyclePhase;
  errorMessage?: string;
  /** Serializable state the app had before crash. */
  stateSnapshot?: Record<string, unknown>;
  /** How many times this app has crashed in current session. */
  crashCount: number;
}

export interface AppRecoveryOffer {
  appId: string;
  crashedAt: number;
  crashCount: number;
  canRestore: boolean;
  stateAvailable: boolean;
}

// ── Persistence ─────────────────────────────────────────────────

function loadCrashStates(): Record<string, AppCrashSnapshot> {
  try {
    const raw = localStorage.getItem(CRASH_STATE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, AppCrashSnapshot>;
    const now = Date.now();
    // Prune old entries
    const cleaned: Record<string, AppCrashSnapshot> = {};
    for (const [id, entry] of Object.entries(data)) {
      if (now - entry.crashedAt < MAX_CRASH_AGE_MS) cleaned[id] = entry;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function saveCrashStates(states: Record<string, AppCrashSnapshot>): void {
  try {
    localStorage.setItem(CRASH_STATE_KEY, JSON.stringify(states));
  } catch { /* quota exceeded */ }
}

// ── Public API ──────────────────────────────────────────────────

/** Record an app crash with optional state snapshot. */
export function recordAppCrash(
  appId: string,
  error?: string,
  stateSnapshot?: Record<string, unknown>,
): AppCrashSnapshot {
  const states = loadCrashStates();
  const existing = states[appId];
  const snapshot: AppCrashSnapshot = {
    appId,
    crashedAt: Date.now(),
    lastKnownPhase: "crashed",
    errorMessage: error,
    stateSnapshot,
    crashCount: (existing?.crashCount ?? 0) + 1,
  };
  states[appId] = snapshot;
  saveCrashStates(states);
  return snapshot;
}

/** Check if an app has a pending crash recovery offer. */
export function getRecoveryOffer(appId: string): AppRecoveryOffer | null {
  const states = loadCrashStates();
  const snapshot = states[appId];
  if (!snapshot) return null;
  return {
    appId: snapshot.appId,
    crashedAt: snapshot.crashedAt,
    crashCount: snapshot.crashCount,
    canRestore: snapshot.crashCount < 3, // max 3 auto-restarts
    stateAvailable: !!snapshot.stateSnapshot,
  };
}

/** Accept recovery — return the snapshot and clear it. */
export function acceptAppRecovery(appId: string): AppCrashSnapshot | null {
  const states = loadCrashStates();
  const snapshot = states[appId];
  if (!snapshot) return null;
  delete states[appId];
  saveCrashStates(states);
  return snapshot;
}

/** Decline recovery — clear the crash state. */
export function declineAppRecovery(appId: string): void {
  const states = loadCrashStates();
  delete states[appId];
  saveCrashStates(states);
}

/** Clear all crash states (e.g. on logout). */
export function clearAllCrashStates(): void {
  localStorage.removeItem(CRASH_STATE_KEY);
}

/** List all apps with pending recovery offers. */
export function listPendingRecoveries(): AppRecoveryOffer[] {
  const states = loadCrashStates();
  return Object.values(states).map((s) => ({
    appId: s.appId,
    crashedAt: s.crashedAt,
    crashCount: s.crashCount,
    canRestore: s.crashCount < 3,
    stateAvailable: !!s.stateSnapshot,
  }));
}