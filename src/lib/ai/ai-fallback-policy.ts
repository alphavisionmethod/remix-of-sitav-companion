// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Fallback Policy
// Per-capability fallback chain resolution with trigger conditions.
// Extends BudgetGateResult.fallbackModelId pattern from budget-gate.ts.
// ═══════════════════════════════════════════════════════════════

import { AI_CAPABILITY_REGISTRY, type DegradedBehavior } from "./ai-capability-registry";

export type FallbackTrigger = "timeout" | "error" | "budget-exceeded" | "model-unavailable" | "rate-limited" | "invalid-output";
export type DegradedResultExpectation = "cached" | "simplified" | "refused";

export interface FallbackResolution {
  capabilityId: string;
  originalModel: string;
  triggerReason: FallbackTrigger;
  nextModel: string | null;
  degradedExpectation: DegradedResultExpectation | null;
  noProviderBehavior: DegradedBehavior;
  chainExhausted: boolean;
  replayable: boolean;
}

export interface FallbackPolicyEntry {
  capabilityId: string;
  primaryRoute: string;
  fallbackChain: readonly string[];
  fallbackTriggers: readonly FallbackTrigger[];
  degradedResultExpectation: DegradedResultExpectation;
  noProviderBehavior: DegradedBehavior;
  replayable: boolean;
}

const UNIVERSAL_TRIGGERS: FallbackTrigger[] = ["timeout", "error", "budget-exceeded", "model-unavailable", "rate-limited", "invalid-output"];

export const FALLBACK_POLICIES: readonly FallbackPolicyEntry[] = AI_CAPABILITY_REGISTRY.map((cap) => ({
  capabilityId: cap.capabilityId,
  primaryRoute: cap.preferredRoute,
  fallbackChain: cap.fallbackChain,
  fallbackTriggers: UNIVERSAL_TRIGGERS,
  degradedResultExpectation: cap.noProviderBehavior === "cached-only" ? "cached" as const
    : cap.noProviderBehavior === "refuse-with-receipt" ? "refused" as const
    : "simplified" as const,
  noProviderBehavior: cap.noProviderBehavior,
  replayable: cap.receiptRequired,
}));

export function resolveFallback(
  capabilityId: string,
  triggerReason: FallbackTrigger,
  failedModels: readonly string[] = [],
): FallbackResolution {
  const cap = AI_CAPABILITY_REGISTRY.find((c) => c.capabilityId === capabilityId);
  if (!cap) {
    return {
      capabilityId,
      originalModel: "unknown",
      triggerReason,
      nextModel: null,
      degradedExpectation: "refused",
      noProviderBehavior: "refuse-with-receipt",
      chainExhausted: true,
      replayable: false,
    };
  }

  const allModels = [cap.preferredRoute, ...cap.fallbackChain];
  const nextModel = allModels.find((m) => !failedModels.includes(m)) ?? null;
  const chainExhausted = nextModel === null;

  return {
    capabilityId,
    originalModel: failedModels[0] ?? cap.preferredRoute,
    triggerReason,
    nextModel,
    degradedExpectation: chainExhausted
      ? (cap.noProviderBehavior === "cached-only" ? "cached" : cap.noProviderBehavior === "refuse-with-receipt" ? "refused" : "simplified")
      : null,
    noProviderBehavior: cap.noProviderBehavior,
    chainExhausted,
    replayable: cap.receiptRequired,
  };
}

export function getFallbackPolicy(capabilityId: string): FallbackPolicyEntry | undefined {
  return FALLBACK_POLICIES.find((p) => p.capabilityId === capabilityId);
}

export const REPLAY_FAMILIES: readonly string[] = FALLBACK_POLICIES
  .filter((p) => p.replayable)
  .map((p) => p.capabilityId);