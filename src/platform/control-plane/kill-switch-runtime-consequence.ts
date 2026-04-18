// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Runtime Consequence Map
// Declarative truth: WHAT happens in the UI/runtime when a switch
// becomes active. Consumed by `useKillSwitchGate` and the global
// degraded-mode banner system.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeConsequence } from "./kill-switch-types";

export const KILL_SWITCH_CONSEQUENCE_MAP: readonly RuntimeConsequence[] = [
  {
    switchId: "KS-ADVISORS",
    consequenceClass: "hide-feature",
    userMessage: "Advisor council is paused for maintenance. Recommendations will resume shortly.",
    bannerSeverity: "warning",
    surfaces: ["web", "desktop", "mobile", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-OUTBOUND",
    consequenceClass: "queue-and-defer",
    userMessage: "Outbound messages are paused. Drafts are queued and will send once restored.",
    bannerSeverity: "warning",
    surfaces: ["web", "desktop", "mobile", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-CONNECTORS",
    consequenceClass: "show-degraded-banner",
    userMessage: "External integrations are paused. Existing data is intact, sync will resume.",
    bannerSeverity: "warning",
    surfaces: ["web", "desktop", "mobile", "admin"],
    emitsNegativeReceipt: false,
  },
  {
    switchId: "KS-SYNC",
    consequenceClass: "show-degraded-banner",
    userMessage: "Data sync is paused. Some figures may be slightly stale.",
    bannerSeverity: "info",
    surfaces: ["web", "desktop", "mobile"],
    emitsNegativeReceipt: false,
  },
  {
    switchId: "KS-PAYMENTS",
    consequenceClass: "block-mutation",
    userMessage: "Payment processing is paused. Charges and refunds are temporarily unavailable.",
    bannerSeverity: "critical",
    surfaces: ["web", "desktop", "mobile", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-PAYMENTS-AUTH",
    consequenceClass: "block-mutation",
    userMessage: "New payment authorizations are paused. Existing settlements and refunds are unaffected.",
    bannerSeverity: "critical",
    surfaces: ["web", "desktop", "mobile", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-MOBILE-PUSH",
    consequenceClass: "show-degraded-banner",
    userMessage: "Push notifications are paused. In-app notifications still work.",
    bannerSeverity: "info",
    surfaces: ["mobile", "desktop", "admin"],
    emitsNegativeReceipt: false,
  },
  {
    switchId: "KS-MODEL-PROVIDERS",
    consequenceClass: "force-refusal",
    userMessage: "AI features are temporarily unavailable. Cached results may still be shown.",
    bannerSeverity: "critical",
    surfaces: ["web", "desktop", "mobile", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-WORKFLOW",
    consequenceClass: "queue-and-defer",
    userMessage: "Automated workflows are paused. Manual approvals still work.",
    bannerSeverity: "warning",
    surfaces: ["web", "desktop", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-SIMULATIONS",
    consequenceClass: "hide-feature",
    userMessage: "Simulation engine is paused. Historical scenarios remain viewable.",
    bannerSeverity: "info",
    surfaces: ["web", "desktop", "admin"],
    emitsNegativeReceipt: false,
  },
  {
    switchId: "KS-AUTOMATIONS",
    consequenceClass: "stop-scheduled-runs",
    userMessage: "Scheduled automations are paused.",
    bannerSeverity: "warning",
    surfaces: ["web", "desktop", "admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-RELEASE-ROLLOUT",
    consequenceClass: "rollback-release",
    userMessage: "Release rollout is paused. New deployments are blocked.",
    bannerSeverity: "critical",
    surfaces: ["admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-APPLIANCE-UPDATE",
    consequenceClass: "rollback-release",
    userMessage: "Appliance updates are paused. Devices remain on current version.",
    bannerSeverity: "warning",
    surfaces: ["admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-SELF-HEALING",
    consequenceClass: "stop-scheduled-runs",
    userMessage: "Self-healing automations are paused. Operators must intervene manually.",
    bannerSeverity: "warning",
    surfaces: ["admin"],
    emitsNegativeReceipt: true,
  },
  {
    switchId: "KS-PROVIDER-INGESTION",
    consequenceClass: "freeze-ingestion",
    userMessage: "Inbound provider data is paused. Webhooks are acknowledged but not processed.",
    bannerSeverity: "warning",
    surfaces: ["admin"],
    emitsNegativeReceipt: true,
  },
] as const;

export function getConsequence(switchId: string): RuntimeConsequence | null {
  return KILL_SWITCH_CONSEQUENCE_MAP.find((c) => c.switchId === switchId) ?? null;
}

export function getConsequencesForSurface(
  surface: "web" | "desktop" | "mobile" | "admin",
): readonly RuntimeConsequence[] {
  return KILL_SWITCH_CONSEQUENCE_MAP.filter((c) => c.surfaces.includes(surface));
}
