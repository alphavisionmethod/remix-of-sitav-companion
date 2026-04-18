// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Honesty Rules
// Encodes the rules that separate honest claims from drift.
// Used by `check-launch-honesty.ts` and admin truth dashboards.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier, TierAvailability } from "./runtime-tier-model";

export interface LaunchHonestyRule {
  id: string;
  description: string;
  appliesTo: readonly RuntimeTier[];
  /** Forbidden phrases that trigger a violation when found in a tier where the capability is not `supported`. */
  forbiddenClaims: readonly string[];
  /** Recommended honest phrasing. */
  honestPhrasing: string;
}

export const LAUNCH_HONESTY_RULES: readonly LaunchHonestyRule[] = [
  {
    id: "no-os-claim-in-web",
    description: "Web tier MUST NOT claim host-level OS authority.",
    appliesTo: ["WEB_APP"],
    forbiddenClaims: [
      "true operating system",
      "owns the host",
      "kernel-level access",
      "native filesystem (without bridge)",
    ],
    honestPhrasing: "OS-like experience running in your browser",
  },
  {
    id: "no-kernel-claim-in-desktop",
    description: "Desktop host wraps the OS — it is not the OS.",
    appliesTo: ["DESKTOP_HOST"],
    forbiddenClaims: [
      "we are your operating system",
      "we replace your OS",
      "kernel ownership",
    ],
    honestPhrasing: "Native desktop experience powered by SITA",
  },
  {
    id: "no-bespoke-kernel-claim-in-appliance",
    description: "Appliance is a packaged stack — bespoke kernel claims need real implementation.",
    appliesTo: ["APPLIANCE_RUNTIME"],
    forbiddenClaims: [
      "fully bespoke kernel",
      "custom microkernel",
    ],
    honestPhrasing: "Packaged appliance with managed runtime services",
  },
  {
    id: "simulation-must-be-marked",
    description: "Simulated UX surfaces must be marked as simulation when they imitate OS authority.",
    appliesTo: ["SIMULATED_OS_EXPERIENCE"],
    forbiddenClaims: [
      "real system process",
      "real native window",
    ],
    honestPhrasing: "Simulated OS experience",
  },
] as const;

/** Returns true when the given tier+availability combination satisfies the rule. */
export function isClaimHonest(
  tier: RuntimeTier,
  capability: TierAvailability,
  claim: string,
): boolean {
  const rules = LAUNCH_HONESTY_RULES.filter((r) => r.appliesTo.includes(tier));
  for (const rule of rules) {
    for (const phrase of rule.forbiddenClaims) {
      if (claim.toLowerCase().includes(phrase.toLowerCase()) && capability !== "supported") {
        return false;
      }
    }
  }
  return true;
}

export function getRulesForTier(tier: RuntimeTier): readonly LaunchHonestyRule[] {
  return LAUNCH_HONESTY_RULES.filter((r) => r.appliesTo.includes(tier));
}
