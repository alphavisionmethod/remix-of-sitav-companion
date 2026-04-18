// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync State Machine
// All UX states with transitions, observers, and UI binding hooks
// ═══════════════════════════════════════════════════════════════

/** All possible sync UX states */
export type SyncUXState =
  | "syncing"
  | "up-to-date"
  | "offline"
  | "paused"
  | "waiting-for-wifi"
  | "waiting-for-charge"
  | "conflict"
  | "attention-needed"
  | "secure-sync-active"
  | "downloading"
  | "uploading"
  | "pending"
  | "error"
  | "initializing";

/** State metadata for UI rendering */
export interface SyncStateInfo {
  state: SyncUXState;
  label: string;
  description: string;
  icon: string;
  color: string;
  priority: number;
  actionable: boolean;
  actionLabel?: string;
}

/** State transition event */
export interface StateTransition {
  from: SyncUXState;
  to: SyncUXState;
  timestamp: string;
  reason: string;
}

type StateChangeHandler = (state: SyncUXState, info: SyncStateInfo) => void;

/** State definitions with UI metadata */
const STATE_DEFINITIONS: Record<SyncUXState, Omit<SyncStateInfo, "state">> = {
  "syncing": { label: "Syncing", description: "Syncing changes across devices", icon: "RefreshCw", color: "hsl(var(--sita-purple))", priority: 3, actionable: false },
  "up-to-date": { label: "Up to date", description: "All changes synced", icon: "CheckCircle", color: "hsl(var(--trust-safe))", priority: 10, actionable: false },
  "offline": { label: "Offline", description: "No internet connection. Changes will sync when back online.", icon: "WifiOff", color: "hsl(var(--muted-foreground))", priority: 2, actionable: false },
  "paused": { label: "Paused", description: "Sync is paused", icon: "PauseCircle", color: "hsl(var(--sita-gold))", priority: 4, actionable: true, actionLabel: "Resume" },
  "waiting-for-wifi": { label: "Waiting for Wi-Fi", description: "Large files will sync on Wi-Fi", icon: "Wifi", color: "hsl(var(--sita-gold))", priority: 5, actionable: true, actionLabel: "Sync now" },
  "waiting-for-charge": { label: "Waiting for power", description: "Sync paused to save battery", icon: "BatteryLow", color: "hsl(var(--sita-gold))", priority: 5, actionable: true, actionLabel: "Sync now" },
  "conflict": { label: "Conflict", description: "Some files have conflicts that need resolution", icon: "AlertTriangle", color: "hsl(var(--destructive))", priority: 1, actionable: true, actionLabel: "Resolve" },
  "attention-needed": { label: "Attention needed", description: "Sync requires your attention", icon: "AlertCircle", color: "hsl(var(--destructive))", priority: 1, actionable: true, actionLabel: "View" },
  "secure-sync-active": { label: "Secure sync", description: "End-to-end encrypted sync active", icon: "Shield", color: "hsl(var(--trust-safe))", priority: 8, actionable: false },
  "downloading": { label: "Downloading", description: "Downloading files from cloud", icon: "Download", color: "hsl(var(--sita-purple))", priority: 3, actionable: false },
  "uploading": { label: "Uploading", description: "Uploading files to cloud", icon: "Upload", color: "hsl(var(--sita-purple))", priority: 3, actionable: false },
  "pending": { label: "Pending", description: "Changes queued for sync", icon: "Clock", color: "hsl(var(--muted-foreground))", priority: 6, actionable: false },
  "error": { label: "Sync error", description: "Something went wrong with sync", icon: "XCircle", color: "hsl(var(--destructive))", priority: 0, actionable: true, actionLabel: "Retry" },
  "initializing": { label: "Starting", description: "Initializing sync engine", icon: "Loader", color: "hsl(var(--muted-foreground))", priority: 9, actionable: false },
};

class SyncStateMachine {
  private currentState: SyncUXState = "initializing";
  private transitionLog: StateTransition[] = [];
  private handlers: StateChangeHandler[] = [];

  /** Get the current state */
  getState(): SyncUXState {
    return this.currentState;
  }

  /** Get full state info for UI */
  getStateInfo(): SyncStateInfo {
    return { state: this.currentState, ...STATE_DEFINITIONS[this.currentState] };
  }

  /** Get info for any state */
  getInfoFor(state: SyncUXState): SyncStateInfo {
    return { state, ...STATE_DEFINITIONS[state] };
  }

  /** Transition to a new state */
  transition(to: SyncUXState, reason: string): void {
    if (to === this.currentState) return;
    const from = this.currentState;
    this.currentState = to;

    this.transitionLog.push({ from, to, timestamp: new Date().toISOString(), reason });
    if (this.transitionLog.length > 500) this.transitionLog = this.transitionLog.slice(-250);

    const info = this.getStateInfo();
    for (const handler of this.handlers) handler(to, info);
  }

  /** Subscribe to state changes */
  onStateChange(handler: StateChangeHandler): () => void {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }

  /** Get transition history */
  getTransitionLog(limit: number = 50): StateTransition[] {
    return this.transitionLog.slice(-limit);
  }

  /** Get all available states with their definitions */
  getAllStates(): SyncStateInfo[] {
    return (Object.keys(STATE_DEFINITIONS) as SyncUXState[]).map(state => ({
      state,
      ...STATE_DEFINITIONS[state],
    }));
  }

  /** Determine state from daemon signals */
  evaluateState(signals: {
    isOnline: boolean;
    isRunning: boolean;
    pendingPush: number;
    pendingPull: number;
    conflictCount: number;
    errors: string[];
    mode: string;
    batteryLevel: number;
    isCharging: boolean;
    isMetered: boolean;
    hasE2EE: boolean;
  }): SyncUXState {
    if (!signals.isRunning) return "initializing";
    if (!signals.isOnline) return "offline";
    if (signals.errors.length > 0) return "error";
    if (signals.conflictCount > 0) return "conflict";
    if (signals.mode === "low-power" && signals.batteryLevel < 15 && !signals.isCharging) return "waiting-for-charge";
    if (signals.mode === "metered" && signals.isMetered) return "waiting-for-wifi";
    if (signals.mode === "offline") return "paused";
    if (signals.pendingPush > 0 && signals.pendingPull > 0) return "syncing";
    if (signals.pendingPush > 0) return "uploading";
    if (signals.pendingPull > 0) return "downloading";
    if (signals.hasE2EE) return "secure-sync-active";
    return "up-to-date";
  }
}

/** Singleton sync state machine */
export const syncStateMachine = new SyncStateMachine();
