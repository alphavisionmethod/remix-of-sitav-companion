// ═══════════════════════════════════════════════════════════════
// SITA OS — Product Reality Tiers
// Tier system: production/prototype/simulated/spec-only
// ═══════════════════════════════════════════════════════════════

export type ProductRealityTier = "production" | "prototype" | "simulated" | "spec-only" | "experimental";

export interface TierDefinition {
  tier: ProductRealityTier;
  label: string;
  description: string;
  codeRequired: boolean;
  testsRequired: boolean;
  ciGateRequired: boolean;
  deployable: boolean;
  supportable: boolean;
  launchClaimAllowed: boolean;
}

export const TIER_DEFINITIONS: readonly TierDefinition[] = [
  { tier: "production", label: "Production", description: "Fully implemented, tested, deployed, and supported", codeRequired: true, testsRequired: true, ciGateRequired: true, deployable: true, supportable: true, launchClaimAllowed: true },
  { tier: "prototype", label: "Prototype", description: "Code exists and partially works, not production-hardened", codeRequired: true, testsRequired: false, ciGateRequired: false, deployable: false, supportable: false, launchClaimAllowed: false },
  { tier: "simulated", label: "Simulated", description: "Simulated in browser for UX purposes, no real OS/hardware backing", codeRequired: true, testsRequired: false, ciGateRequired: false, deployable: true, supportable: false, launchClaimAllowed: false },
  { tier: "spec-only", label: "Spec Only", description: "Documentation/design only, no implementation", codeRequired: false, testsRequired: false, ciGateRequired: false, deployable: false, supportable: false, launchClaimAllowed: false },
  { tier: "experimental", label: "Experimental", description: "Research/POC code, not stable or production-ready", codeRequired: true, testsRequired: false, ciGateRequired: false, deployable: false, supportable: false, launchClaimAllowed: false },
] as const;

export function getTierDefinition(tier: ProductRealityTier): TierDefinition {
  return TIER_DEFINITIONS.find((t) => t.tier === tier)!;
}

export function canClaimLaunch(tier: ProductRealityTier): boolean {
  return getTierDefinition(tier).launchClaimAllowed;
}

export function isDeployable(tier: ProductRealityTier): boolean {
  return getTierDefinition(tier).deployable;
}
