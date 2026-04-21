// ═══════════════════════════════════════════════════════════════
// SITA OS — Design Token Bridge
// Maps token systems to visual tiers; flags overlapping values.
// ═══════════════════════════════════════════════════════════════

import type { VisualTierId } from "./visual-tier-system";

export interface TokenBridgeEntry {
  readonly tokenSource: string;
  readonly filePath: string;
  readonly tiers: readonly VisualTierId[];
  readonly exports: readonly string[];
  readonly overlapsWith?: readonly string[];
}

export const DESIGN_TOKEN_BRIDGE: readonly TokenBridgeEntry[] = [
  {
    tokenSource: "nova-os",
    filePath: "src/platform/design-system/nova-os.ts",
    tiers: ["TIER_SYSTEM_SHELL"],
    exports: ["MATERIALS", "DEPTH_LAYERS", "ICON_GRADIENTS", "SHAPES", "NOVA_MOTION"],
    overlapsWith: ["app-window-system (shadow values)"],
  },
  {
    tokenSource: "app-window-system",
    filePath: "src/platform/design-system/app-window-system.ts",
    tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],
    exports: ["SPACE", "TYPE", "APP_TYPE", "APP_MATERIALS", "APP_SHADOWS", "APP_CHROME", "APP_COMPONENTS"],
    overlapsWith: ["nova-os (shadow values)"],
  },
  {
    tokenSource: "sita-design-tokens",
    filePath: "src/platform/design-system/sita-design-tokens.ts",
    tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN", "TIER_SUPPORT_TRUST", "TIER_DEGRADED_RECOVERY"],
    exports: ["SURFACE_TOKENS", "DOMAIN_ATMOSPHERE", "SITA_TYPE", "SITA_MOTION", "BADGE_STYLES"],
    overlapsWith: ["domain-atmospheres (DomainAtmosphere type overlap)"],
  },
  {
    tokenSource: "design-tokens-package",
    filePath: "src/packages/design-tokens/index.ts",
    tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN", "TIER_SUPPORT_TRUST", "TIER_DEGRADED_RECOVERY"],
    exports: ["COLORS", "SPACING", "TYPOGRAPHY", "RADIUS", "SHADOWS", "MOTION", "TRUST_STATES", "WORKFLOW_STATES", "PROOF_STATES"],
  },
  {
    tokenSource: "domain-atmospheres",
    filePath: "src/platform/design-system/domain-atmospheres.ts",
    tiers: ["TIER_PRODUCT_APP"],
    exports: ["DOMAIN_ATMOSPHERES"],
    overlapsWith: ["sita-design-tokens (DomainAtmosphere type overlap — known drift point)"],
  },
  {
    tokenSource: "trust-explanation-layer",
    filePath: "src/platform/product/trust-explanation-layer.ts",
    tiers: ["TIER_SUPPORT_TRUST"],
    exports: ["TRUST_BADGES", "TrustBadgeLevel", "ExplanationKind"],
  },
  {
    tokenSource: "state-grammar",
    filePath: "src/platform/product/state-grammar.ts",
    tiers: ["TIER_DEGRADED_RECOVERY"],
    exports: ["ProductState", "STATE_METADATA_DEFAULTS", "getStateMetadata"],
  },
] as const;