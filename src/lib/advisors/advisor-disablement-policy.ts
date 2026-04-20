// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Disablement Policy
// What happens when an advisor is disabled, paused, or degraded.
// ═══════════════════════════════════════════════════════════════

export type DisablementReason = "owner-paused" | "budget-exhausted" | "kill-switch" | "trust-degraded" | "error-rate-exceeded" | "maintenance";
export type FallbackBehavior = "delegate-to-fallback" | "queue-for-owner" | "silent-degrade" | "refuse-with-receipt";

export interface DisablementPolicy {
  readonly reason: DisablementReason;
  readonly fallback: FallbackBehavior;
  readonly notifyOwner: boolean;
  readonly preserveMemory: boolean;
  readonly autoReenableCondition: string | null;
  readonly maxDisabledDurationHours: number | null;
}

export const DISABLEMENT_POLICIES: readonly DisablementPolicy[] = [
  { reason: "owner-paused", fallback: "delegate-to-fallback", notifyOwner: false, preserveMemory: true, autoReenableCondition: null, maxDisabledDurationHours: null },
  { reason: "budget-exhausted", fallback: "refuse-with-receipt", notifyOwner: true, preserveMemory: true, autoReenableCondition: "budget-replenished OR new-billing-period", maxDisabledDurationHours: null },
  { reason: "kill-switch", fallback: "refuse-with-receipt", notifyOwner: true, preserveMemory: true, autoReenableCondition: "kill-switch-deactivated", maxDisabledDurationHours: null },
  { reason: "trust-degraded", fallback: "delegate-to-fallback", notifyOwner: true, preserveMemory: true, autoReenableCondition: "trust-score > 0.5 for 24h", maxDisabledDurationHours: 72 },
  { reason: "error-rate-exceeded", fallback: "silent-degrade", notifyOwner: true, preserveMemory: true, autoReenableCondition: "error-rate < 5% for 1h", maxDisabledDurationHours: 24 },
  { reason: "maintenance", fallback: "queue-for-owner", notifyOwner: false, preserveMemory: true, autoReenableCondition: "maintenance-window-closed", maxDisabledDurationHours: 4 },
];

export function getDisablementPolicy(reason: DisablementReason): DisablementPolicy {
  return DISABLEMENT_POLICIES.find((p) => p.reason === reason) ?? DISABLEMENT_POLICIES[0];
}