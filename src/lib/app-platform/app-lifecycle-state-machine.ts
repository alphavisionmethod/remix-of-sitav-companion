// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical App Lifecycle State Machine
// 17 states with explicit transition table and validation.
// ═══════════════════════════════════════════════════════════════

export type AppLifecycleState =
  | "DISCOVERED"
  | "AVAILABLE"
  | "INSTALL_PENDING"
  | "INSTALLING"
  | "INSTALLED"
  | "LAUNCH_PENDING"
  | "RUNNING"
  | "FOCUSED"
  | "BACKGROUNDED"
  | "SUSPENDED"
  | "UPDATE_AVAILABLE"
  | "UPDATING"
  | "ERROR"
  | "CRASHED"
  | "RECOVERING"
  | "REMOVAL_PENDING"
  | "REMOVING"
  | "REMOVED"
  | "RESTORE_PENDING";

export interface LifecycleTransitionDef {
  from: AppLifecycleState;
  to: AppLifecycleState;
  requiredChecks: string[];
  persistenceRequired: boolean;
  receiptRequired: boolean;
  adminVisible: boolean;
  failureFallback: AppLifecycleState | null;
  recoveryPath: AppLifecycleState | null;
}

export const LIFECYCLE_TRANSITIONS: LifecycleTransitionDef[] = [
  // Discovery → Availability
  { from: "DISCOVERED", to: "AVAILABLE", requiredChecks: ["manifest_valid", "trust_resolved"], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },

  // Install flow
  { from: "AVAILABLE", to: "INSTALL_PENDING", requiredChecks: ["trust_tier_allows_install", "runtime_compatible"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "AVAILABLE", recoveryPath: null },
  { from: "INSTALL_PENDING", to: "INSTALLING", requiredChecks: ["user_confirmed_or_auto"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: "AVAILABLE", recoveryPath: null },
  { from: "INSTALLING", to: "INSTALLED", requiredChecks: ["install_complete", "integrity_verified"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "ERROR", recoveryPath: "AVAILABLE" },
  { from: "INSTALLING", to: "ERROR", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: "AVAILABLE" },

  // Launch flow
  { from: "INSTALLED", to: "LAUNCH_PENDING", requiredChecks: ["permissions_satisfied", "runtime_available"], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: "INSTALLED", recoveryPath: null },
  { from: "LAUNCH_PENDING", to: "RUNNING", requiredChecks: ["process_started"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: "ERROR", recoveryPath: "INSTALLED" },
  { from: "RUNNING", to: "FOCUSED", requiredChecks: [], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "RUNNING", to: "BACKGROUNDED", requiredChecks: [], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "FOCUSED", to: "BACKGROUNDED", requiredChecks: [], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "BACKGROUNDED", to: "FOCUSED", requiredChecks: [], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "FOCUSED", to: "RUNNING", requiredChecks: [], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "BACKGROUNDED", to: "RUNNING", requiredChecks: [], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "RUNNING", to: "SUSPENDED", requiredChecks: ["state_snapshot_saved"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: "RUNNING", recoveryPath: null },
  { from: "FOCUSED", to: "SUSPENDED", requiredChecks: ["state_snapshot_saved"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: "RUNNING", recoveryPath: null },
  { from: "BACKGROUNDED", to: "SUSPENDED", requiredChecks: ["state_snapshot_saved"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: "RUNNING", recoveryPath: null },
  { from: "SUSPENDED", to: "RUNNING", requiredChecks: ["state_restored"], persistenceRequired: false, receiptRequired: false, adminVisible: false, failureFallback: "INSTALLED", recoveryPath: "INSTALLED" },

  // Update flow
  { from: "INSTALLED", to: "UPDATE_AVAILABLE", requiredChecks: ["update_check_passed"], persistenceRequired: true, receiptRequired: false, adminVisible: true, failureFallback: "INSTALLED", recoveryPath: null },
  { from: "UPDATE_AVAILABLE", to: "UPDATING", requiredChecks: ["user_confirmed_or_auto_update"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "UPDATE_AVAILABLE", recoveryPath: null },
  { from: "UPDATING", to: "INSTALLED", requiredChecks: ["update_complete", "integrity_verified"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "ERROR", recoveryPath: "UPDATE_AVAILABLE" },

  // Crash / Recovery flow
  { from: "RUNNING", to: "CRASHED", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: null },
  { from: "FOCUSED", to: "CRASHED", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: null },
  { from: "BACKGROUNDED", to: "CRASHED", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: null },
  { from: "CRASHED", to: "RECOVERING", requiredChecks: ["crash_count_below_max"], persistenceRequired: true, receiptRequired: false, adminVisible: true, failureFallback: "ERROR", recoveryPath: null },
  { from: "RECOVERING", to: "RUNNING", requiredChecks: ["state_restored", "process_started"], persistenceRequired: true, receiptRequired: true, adminVisible: false, failureFallback: "ERROR", recoveryPath: "INSTALLED" },
  { from: "RECOVERING", to: "ERROR", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: "INSTALLED" },
  { from: "CRASHED", to: "ERROR", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: "INSTALLED" },
  { from: "ERROR", to: "INSTALLED", requiredChecks: ["error_acknowledged"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },

  // Removal flow
  { from: "INSTALLED", to: "REMOVAL_PENDING", requiredChecks: ["trust_tier_allows_removal"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "INSTALLED", recoveryPath: null },
  { from: "UPDATE_AVAILABLE", to: "REMOVAL_PENDING", requiredChecks: ["trust_tier_allows_removal"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "UPDATE_AVAILABLE", recoveryPath: null },
  { from: "ERROR", to: "REMOVAL_PENDING", requiredChecks: [], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: null, recoveryPath: null },
  { from: "REMOVAL_PENDING", to: "REMOVING", requiredChecks: ["user_confirmed_removal"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: "INSTALLED", recoveryPath: null },
  { from: "REMOVING", to: "REMOVED", requiredChecks: ["data_cleanup_complete"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "ERROR", recoveryPath: "INSTALLED" },

  // Restore flow
  { from: "REMOVED", to: "RESTORE_PENDING", requiredChecks: ["manifest_still_available"], persistenceRequired: true, receiptRequired: false, adminVisible: false, failureFallback: null, recoveryPath: null },
  { from: "RESTORE_PENDING", to: "INSTALLING", requiredChecks: ["trust_tier_allows_install"], persistenceRequired: true, receiptRequired: true, adminVisible: true, failureFallback: "REMOVED", recoveryPath: null },
];

// ── Transition lookup cache ────────────────────────────────────

const _transitionMap = new Map<string, LifecycleTransitionDef>();
for (const t of LIFECYCLE_TRANSITIONS) {
  _transitionMap.set(`${t.from}→${t.to}`, t);
}

/** Check if a state transition is valid. */
export function isValidTransition(from: AppLifecycleState, to: AppLifecycleState): boolean {
  return _transitionMap.has(`${from}→${to}`);
}

/** Get transition definition, or null if invalid. */
export function getTransition(from: AppLifecycleState, to: AppLifecycleState): LifecycleTransitionDef | null {
  return _transitionMap.get(`${from}→${to}`) ?? null;
}

/** Get all valid next states from a given state. */
export function getNextStates(from: AppLifecycleState): AppLifecycleState[] {
  return LIFECYCLE_TRANSITIONS.filter(t => t.from === from).map(t => t.to);
}

/** Validate a transition and return the definition or throw. */
export function validateTransition(from: AppLifecycleState, to: AppLifecycleState): LifecycleTransitionDef {
  const t = getTransition(from, to);
  if (!t) {
    throw new Error(`Invalid lifecycle transition: ${from} → ${to}. Valid targets: ${getNextStates(from).join(", ") || "none"}`);
  }
  return t;
}

/** All lifecycle states as an ordered array. */
export const ALL_LIFECYCLE_STATES: AppLifecycleState[] = [
  "DISCOVERED", "AVAILABLE", "INSTALL_PENDING", "INSTALLING", "INSTALLED",
  "LAUNCH_PENDING", "RUNNING", "FOCUSED", "BACKGROUNDED", "SUSPENDED",
  "UPDATE_AVAILABLE", "UPDATING", "ERROR", "CRASHED", "RECOVERING",
  "REMOVAL_PENDING", "REMOVING", "REMOVED", "RESTORE_PENDING",
];