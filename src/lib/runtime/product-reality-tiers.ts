// ═══════════════════════════════════════════════════════════════
// SITA OS — Product Reality Tiers
// T1 proven → T4 presentational classification
// ═══════════════════════════════════════════════════════════════

/**
 * Tiered classification of how "real" a product feature is.
 * Used by dashboards, admin truth panels, and launch honesty.
 */
export type ProductRealityTier = "T1" | "T2" | "T3" | "T4";

export interface ProductRealityTierDefinition {
  tier: ProductRealityTier;
  name: string;
  description: string;
  dataSource: "live_production" | "real_with_gaps" | "simulated" | "static_presentational";
  trustworthy: boolean;
  showInBoardroom: boolean;
  showInAdmin: boolean;
  requiresDisclaimer: boolean;
  disclaimerText?: string;
}

export const PRODUCT_REALITY_TIERS: Record<ProductRealityTier, ProductRealityTierDefinition> = {
  T1: {
    tier: "T1",
    name: "Proven",
    description: "Live production data, real integrations, verified outputs",
    dataSource: "live_production",
    trustworthy: true,
    showInBoardroom: true,
    showInAdmin: true,
    requiresDisclaimer: false,
  },
  T2: {
    tier: "T2",
    name: "Real with Gaps",
    description: "Real data but some features pending, partial integrations",
    dataSource: "real_with_gaps",
    trustworthy: true,
    showInBoardroom: true,
    showInAdmin: true,
    requiresDisclaimer: true,
    disclaimerText: "Some data sources are pending integration",
  },
  T3: {
    tier: "T3",
    name: "Simulated",
    description: "Demo/sandbox data, scenario-grounded AI, no real side effects",
    dataSource: "simulated",
    trustworthy: false,
    showInBoardroom: false,
    showInAdmin: true,
    requiresDisclaimer: true,
    disclaimerText: "This feature uses simulated data",
  },
  T4: {
    tier: "T4",
    name: "Presentational",
    description: "Static mockups, placeholder UI, not connected to any data",
    dataSource: "static_presentational",
    trustworthy: false,
    showInBoardroom: false,
    showInAdmin: true,
    requiresDisclaimer: true,
    disclaimerText: "This is a visual preview only — not connected to real data",
  },
};

export function getTierDefinition(tier: ProductRealityTier): ProductRealityTierDefinition {
  return PRODUCT_REALITY_TIERS[tier];
}

export function isTrustworthy(tier: ProductRealityTier): boolean {
  return PRODUCT_REALITY_TIERS[tier].trustworthy;
}

export function requiresDisclaimer(tier: ProductRealityTier): boolean {
  return PRODUCT_REALITY_TIERS[tier].requiresDisclaimer;
}
