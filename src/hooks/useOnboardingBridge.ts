// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding-to-Profile Bridge
// Maps completed onboarding state into BusinessProfile archetype
// weights so the adaptive home renders a personalized experience.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useBusinessOnboarding } from "@/hooks/useBusinessOnboarding";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import type { ArchetypeWeights } from "@/domains/engines/business-profile-engine";

/**
 * Reads completed onboarding state and pushes archetype weight
 * overrides into BusinessProfileContext so every adaptive surface
 * (home, sidebar, CRM, advisors) reflects the user's answers.
 *
 * Call once inside BusinessAppShellInner after formation is done.
 */
export function useOnboardingBridge() {
  const { isCompleted, savedState } = useBusinessOnboarding();
  const { updateOverrides, isAdapted } = useBusinessProfile();
  const applied = useRef(false);

  useEffect(() => {
    // Only bridge once per mount, and only when onboarding is done
    if (!isCompleted || applied.current || isAdapted) return;

    const overrides: Partial<ArchetypeWeights> = {};

    // --- Business types → archetype boosts ---
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

    // --- Team size → employee-based weight ---
    if (savedState.teamSize && savedState.teamSize !== "solo") {
      overrides["employee-based"] = (overrides["employee-based"] ?? 0) + 0.15;
    }

    // --- Revenue sources → archetype signals ---
    for (const rs of savedState.revenueSources) {
      const lower = rs.toLowerCase();
      if (lower.includes("appointment")) overrides["appointment-based"] = (overrides["appointment-based"] ?? 0) + 0.15;
      if (lower.includes("ecommerce") || lower.includes("product")) overrides.ecommerce = (overrides.ecommerce ?? 0) + 0.1;
      if (lower.includes("retainer") || lower.includes("subscription")) overrides.membership = (overrides.membership ?? 0) + 0.1;
      if (lower.includes("proposal")) overrides.agency = (overrides.agency ?? 0) + 0.1;
    }

    if (Object.keys(overrides).length > 0) {
      updateOverrides(overrides);
      applied.current = true;
    }
  }, [isCompleted, savedState, updateOverrides, isAdapted]);
}