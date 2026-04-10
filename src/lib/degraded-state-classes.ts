// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Degraded State Classes
// Reusable taxonomy for truth-honest surface states
// ═══════════════════════════════════════════════════════════════

export const DEGRADED_STATE_CLASSES = [
  "unavailable",
  "demo",
  "internal_only",
  "not_configured",
  "provider_missing",
  "rate_limited",
  "setup_required",
  "partial",
  "stale",
  "coming_soon",
] as const;

export type DegradedStateClass = typeof DEGRADED_STATE_CLASSES[number];

const LABELS: Record<DegradedStateClass, string> = {
  unavailable: "Unavailable",
  demo: "Demo Mode",
  internal_only: "Internal Preview",
  not_configured: "Not Configured",
  provider_missing: "Provider Missing",
  rate_limited: "Rate Limited",
  setup_required: "Setup Required",
  partial: "Partial Data",
  stale: "Stale Data",
  coming_soon: "Coming Soon",
};

const DESCRIPTIONS: Record<DegradedStateClass, string> = {
  unavailable: "This capability is not currently available.",
  demo: "You're viewing sample data. Switch to live mode when ready.",
  internal_only: "This feature is available for internal testing only.",
  not_configured: "This feature needs configuration before it can be used.",
  provider_missing: "The required service provider is not connected.",
  rate_limited: "Too many requests. Please wait a moment.",
  setup_required: "Complete setup to activate this feature.",
  partial: "Some data sources are unavailable. Showing partial results.",
  stale: "Data may be outdated. Last refresh was too long ago.",
  coming_soon: "This feature is planned and will be available soon.",
};

const NEXT_ACTIONS: Record<DegradedStateClass, string | null> = {
  unavailable: null,
  demo: "Switch to Live Mode",
  internal_only: null,
  not_configured: "Open Settings",
  provider_missing: "Connect Provider",
  rate_limited: null,
  setup_required: "Start Setup",
  partial: "Retry",
  stale: "Refresh",
  coming_soon: null,
};

export function getDegradedLabel(cls: DegradedStateClass): string {
  return LABELS[cls];
}

export function getDegradedDescription(cls: DegradedStateClass): string {
  return DESCRIPTIONS[cls];
}

export function getDegradedNextAction(cls: DegradedStateClass): string | null {
  return NEXT_ACTIONS[cls];
}

/** Map a degraded state class to a severity for banner display */
export function getDegradedSeverity(cls: DegradedStateClass): "info" | "warning" | "critical" {
  switch (cls) {
    case "demo":
    case "coming_soon":
    case "internal_only":
      return "info";
    case "partial":
    case "stale":
    case "rate_limited":
    case "setup_required":
    case "not_configured":
    case "provider_missing":
      return "warning";
    case "unavailable":
      return "critical";
    default:
      return "warning";
  }
}
