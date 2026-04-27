// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding-to-Profile Bridge
// Maps completed onboarding state into BusinessProfile archetype
// weights so the adaptive home renders a personalized experience.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import type { ArchetypeWeights } from "@/domains/engines/business-profile-engine";
import type { OnboardingState } from "@/pages/revenue-office/onboarding/types";

/** Derive archetype weight overrides from onboarding answers. */
function deriveOverrides(savedState: OnboardingState): Partial<ArchetypeWeights> {
  const overrides: Partial<ArchetypeWeights> = {};

  for (const bt of savedState.businessTypes) {
    const lower = bt.toLowerCase();
    if (lower.includes("ecommerce") || lower.includes("online")) overrides.ecommerce = (overrides.ecommerce ?? 0) + 0.3;
    if (lower.includes("service")) overrides.service = (overrides.service ?? 0) + 0.3;
    if (lower.includes("agency") || lower.includes("consulting")) overrides.agency = (overrides.agency ?? 0) + 0.3;
    if (lower.includes("local") || lower.includes("brick") || lower.includes("retail")) overrides["brick-and-mortar"] = (overrides["brick-and-mortar"] ?? 0) + 0.3;
    if (lower.includes("membership") || lower.includes("subscription")) overrides.membership = (overrides.membership ?? 0) + 0.3;
    if (lower.includes("coaching") || lower.includes("professional")) overrides["professional-practice"] = (overrides["professional-practice"] ?? 0) + 0.3;
    if (lower.includes("creator")) overrides.membership = (overrides.membership ?? 0) + 0.2;
  }

  if (savedState.teamSize && savedState.teamSize !== "solo") {
    overrides["employee-based"] = (overrides["employee-based"] ?? 0) + 0.15;
  }

  for (const rs of savedState.revenueSources) {
    const lower = rs.toLowerCase();
    if (lower.includes("appointment")) overrides["appointment-based"] = (overrides["appointment-based"] ?? 0) + 0.15;
    if (lower.includes("ecommerce") || lower.includes("product")) overrides.ecommerce = (overrides.ecommerce ?? 0) + 0.1;
    if (lower.includes("retainer") || lower.includes("subscription")) overrides.membership = (overrides.membership ?? 0) + 0.1;
    if (lower.includes("proposal")) overrides.agency = (overrides.agency ?? 0) + 0.1;
  }

  return overrides;
}

/**
 * Bridges onboarding state into BusinessProfile archetype weights.
 *
 * Returns `applyNow(state)` so callers can push overrides immediately
 * on formation completion without waiting for the DB round-trip.
 */
export function useOnboardingBridge() {
  const { updateOverrides, isAdapted } = useBusinessProfile();
  const applied = useRef(false);

  /** Imperatively apply overrides from a given onboarding state. */
  const applyNow = useCallback((state: OnboardingState) => {
    if (applied.current) return;
    const overrides = deriveOverrides(state);
    if (Object.keys(overrides).length > 0) {
      updateOverrides(overrides);
      applied.current = true;
    }
  }, [updateOverrides]);

  return { applyNow, isAdapted };
}