// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability ↔ Launch Honesty Bridge
//
// Binds the feature-capability-registry to the launch-honesty-rules
// so that any UI claim made on a surface where a feature is
// simulated / prohibited / unsupported is automatically flagged.
// ═══════════════════════════════════════════════════════════════

import type { CanonicalSurface } from "./surface-types";
import {
  FEATURE_CAPABILITY_REGISTRY,
  type FeatureAvailability,
  type FeatureCapabilityEntry,
} from "./feature-capability-registry";
import { getRuntimeTierForSurface, isPlatformSurface } from "./surface-types";
import { LAUNCH_HONESTY_RULES, type LaunchHonestyRule } from "./launch-honesty-rules";
import type { RuntimeTier } from "./runtime-tier-model";

export interface LaunchHonestyViolation {
  featureId: string;
  surface: CanonicalSurface;
  availability: FeatureAvailability;
  honestyNote?: string;
  ruleViolated?: string;
  recommendedPhrasing?: string;
  severity: "blocker" | "warning" | "info";
}

/** Severity policy by availability state. */
function severityForState(state: FeatureAvailability): "blocker" | "warning" | "info" {
  switch (state) {
    case "prohibited":
    case "unsupported":
      return "blocker";
    case "simulated":
    case "fallback":
    case "degraded":
      return "warning";
    case "roadmap":
      return "info";
    default:
      return "info";
  }
}

/** Find tier-scoped honesty rules that apply to a surface. */
function rulesForSurface(surface: CanonicalSurface): LaunchHonestyRule[] {
  if (!isPlatformSurface(surface)) return [];
  const tier: RuntimeTier = getRuntimeTierForSurface(surface);
  return LAUNCH_HONESTY_RULES.filter((r) => r.appliesTo.includes(tier));
}

/**
 * Audit a UI claim string against the active surface's truth.
 * Returns violations when the claim implies parity that does not exist.
 */
export function auditClaim(
  surface: CanonicalSurface,
  claim: string,
  featureId?: string,
): LaunchHonestyViolation[] {
  const violations: LaunchHonestyViolation[] = [];
  const lower = claim.toLowerCase();
  const rules = rulesForSurface(surface);

  // Phrase-level check
  for (const rule of rules) {
    for (const phrase of rule.forbiddenClaims) {
      if (lower.includes(phrase.toLowerCase())) {
        violations.push({
          featureId: featureId ?? "(unbound)",
          surface,
          availability: "prohibited",
          ruleViolated: rule.id,
          recommendedPhrasing: rule.honestPhrasing,
          severity: "blocker",
        });
      }
    }
  }

  // Feature-level check
  if (featureId) {
    const feature = FEATURE_CAPABILITY_REGISTRY.find((f) => f.featureId === featureId);
    if (feature) {
      const state = feature.availability[surface];
      if (state !== "supported") {
        violations.push({
          featureId,
          surface,
          availability: state,
          honestyNote: feature.launchHonestyNote,
          severity: severityForState(state),
        });
      }
    }
  }

  return violations;
}

/**
 * Generate a launch-honesty audit across all features for a surface.
 * Used by the admin Runtime Capability Explorer and CI checks.
 */
export function auditSurface(surface: CanonicalSurface): LaunchHonestyViolation[] {
  const out: LaunchHonestyViolation[] = [];
  for (const feature of FEATURE_CAPABILITY_REGISTRY as readonly FeatureCapabilityEntry[]) {
    const state = feature.availability[surface];
    if (state === "supported") continue;
    out.push({
      featureId: feature.featureId,
      surface,
      availability: state,
      honestyNote: feature.launchHonestyNote,
      severity: severityForState(state),
    });
  }
  return out;
}

/** Aggregate honesty score (% of features in `supported` state on this surface). */
export function surfaceHonestyScore(surface: CanonicalSurface): {
  surface: CanonicalSurface;
  totalFeatures: number;
  supportedCount: number;
  scorePct: number;
  blockerCount: number;
  warningCount: number;
} {
  const total = FEATURE_CAPABILITY_REGISTRY.length;
  let supported = 0;
  let blockers = 0;
  let warnings = 0;
  for (const feature of FEATURE_CAPABILITY_REGISTRY) {
    const state = feature.availability[surface];
    if (state === "supported") supported++;
    const sev = severityForState(state);
    if (sev === "blocker") blockers++;
    else if (sev === "warning") warnings++;
  }
  return {
    surface,
    totalFeatures: total,
    supportedCount: supported,
    scorePct: Math.round((supported / total) * 100),
    blockerCount: blockers,
    warningCount: warnings,
  };
}
