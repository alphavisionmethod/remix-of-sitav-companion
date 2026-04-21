// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical State Grammar
// Shared product states for consistent UX across all domains.
// ═══════════════════════════════════════════════════════════════

// ── Product State ───────────────────────────────────────────────

export type ProductState =
  | "loading"              // data is being fetched
  | "empty"                // no data to display
  | "error"                // unrecoverable error
  | "blocked"              // action blocked by policy/permission
  | "degraded"             // partial functionality available
  | "recovering"           // system is recovering
  | "ready"                // fully functional
  | "attention-required"   // user action needed
  | "stale-data"           // data may be outdated
  | "permission-required"  // needs elevated permission
  | "evidence-required"    // needs proof/verification
  | "offline"              // no network connectivity
  | "maintenance";         // scheduled downtime

// ── State Metadata ──────────────────────────────────────────────

export interface StateMetadata {
  readonly state: ProductState;
  readonly displayTitle: string;
  readonly displayMessage: string;
  readonly icon: string;
  readonly actionLabel?: string;
  readonly actionRoute?: string;
  readonly retryable: boolean;
  readonly dismissable: boolean;
  readonly severity: "info" | "warning" | "error" | "critical";
}

// ── Default State Copy ──────────────────────────────────────────

export const STATE_METADATA_DEFAULTS: Record<ProductState, StateMetadata> = {
  "loading":              { state: "loading",              displayTitle: "Loading",              displayMessage: "Please wait while we load your data.",                     icon: "loader",       retryable: false, dismissable: false, severity: "info" },
  "empty":                { state: "empty",                displayTitle: "No Data",              displayMessage: "There's nothing here yet. Get started by creating one.",   icon: "inbox",        retryable: false, dismissable: false, severity: "info" },
  "error":                { state: "error",                displayTitle: "Something Went Wrong", displayMessage: "An unexpected error occurred. Please try again.",          icon: "alert-circle", retryable: true,  dismissable: false, severity: "error" },
  "blocked":              { state: "blocked",              displayTitle: "Action Blocked",       displayMessage: "This action is blocked by a policy or permission.",        icon: "shield-off",   retryable: false, dismissable: false, severity: "warning" },
  "degraded":             { state: "degraded",             displayTitle: "Limited Mode",         displayMessage: "Some features are temporarily unavailable.",               icon: "alert-triangle", retryable: true, dismissable: true,  severity: "warning" },
  "recovering":           { state: "recovering",           displayTitle: "Recovering",           displayMessage: "The system is recovering. This may take a moment.",        icon: "refresh-cw",   retryable: false, dismissable: false, severity: "info" },
  "ready":                { state: "ready",                displayTitle: "Ready",                displayMessage: "Everything is working normally.",                          icon: "check-circle", retryable: false, dismissable: false, severity: "info" },
  "attention-required":   { state: "attention-required",   displayTitle: "Action Needed",        displayMessage: "Your attention is required to proceed.",                   icon: "bell",         retryable: false, dismissable: false, severity: "warning" },
  "stale-data":           { state: "stale-data",           displayTitle: "Data May Be Outdated", displayMessage: "The displayed data may not reflect the latest changes.",   icon: "clock",        retryable: true,  dismissable: true,  severity: "info" },
  "permission-required":  { state: "permission-required",  displayTitle: "Permission Required",  displayMessage: "You need additional permissions to access this.",          icon: "lock",         retryable: false, dismissable: false, severity: "warning" },
  "evidence-required":    { state: "evidence-required",    displayTitle: "Verification Needed",  displayMessage: "Additional evidence or verification is required.",         icon: "file-check",   retryable: false, dismissable: false, severity: "warning" },
  "offline":              { state: "offline",              displayTitle: "Offline",              displayMessage: "You are currently offline. Some features are unavailable.", icon: "wifi-off",     retryable: true,  dismissable: false, severity: "warning" },
  "maintenance":          { state: "maintenance",          displayTitle: "Maintenance",          displayMessage: "Scheduled maintenance in progress. Please check back.",    icon: "wrench",       retryable: false, dismissable: false, severity: "info" },
};

// ── Helpers ─────────────────────────────────────────────────────

export function getStateMetadata(state: ProductState): StateMetadata {
  return STATE_METADATA_DEFAULTS[state];
}

export function isActionableState(state: ProductState): boolean {
  return ["error", "attention-required", "permission-required", "evidence-required", "stale-data"].includes(state);
}

export function isSevereState(state: ProductState): boolean {
  return ["error", "blocked", "offline", "maintenance"].includes(state);
}