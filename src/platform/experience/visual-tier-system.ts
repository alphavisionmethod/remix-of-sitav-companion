// ═══════════════════════════════════════════════════════════════
// SITA OS — Visual Tier System
// Defines 5 canonical visual tiers and their token/behavior rules.
// ═══════════════════════════════════════════════════════════════

export type VisualTierId =
  | "TIER_SYSTEM_SHELL"
  | "TIER_PRODUCT_APP"
  | "TIER_OPERATOR_ADMIN"
  | "TIER_SUPPORT_TRUST"
  | "TIER_DEGRADED_RECOVERY";

export type ChromeIntensity = "full" | "standard" | "minimal" | "none";
export type SurfaceDensity = "compact" | "standard" | "spacious";
export type MotionProfile = "full" | "reduced" | "minimal";

export interface VisualTier {
  readonly tierId: VisualTierId;
  readonly description: string;
  readonly tokenSources: readonly string[];
  readonly spacingScale: string;
  readonly surfaceDensity: SurfaceDensity;
  readonly elevationRules: string;
  readonly typographyHierarchy: string;
  readonly chromeIntensity: ChromeIntensity;
  readonly motionProfile: MotionProfile;
  readonly contrastRequirements: string;
  readonly sharedWithOtherTiers: readonly string[];
  readonly intentionalDifferences: readonly string[];
}

export const VISUAL_TIERS: Record<VisualTierId, VisualTier> = {
  TIER_SYSTEM_SHELL: {
    tierId: "TIER_SYSTEM_SHELL",
    description: "OS desktop shell: menu bar, dock, windows, overlays",
    tokenSources: [
      "src/platform/design-system/nova-os.ts (MATERIALS, DEPTH_LAYERS, NOVA_MOTION, SHAPES)",
      "src/platform/design-system/sita-design-tokens.ts (SURFACE_TOKENS level 3)",
    ],
    spacingScale: "SPACE from app-window-system.ts (shared)",
    surfaceDensity: "standard",
    elevationRules: "Glassmorphic surfaces with backdrop-blur-xl; z-index per DEPTH_LAYERS",
    typographyHierarchy: "SITA_TYPE for system labels; APP_TYPE for window content",
    chromeIntensity: "full",
    motionProfile: "full",
    contrastRequirements: "Text over glass must pass WCAG AA on both light/dark backdrops",
    sharedWithOtherTiers: ["typography-scale", "domain-atmosphere", "trust-badges", "state-grammar", "motion-spring-defaults"],
    intentionalDifferences: ["backdrop-blur intensity (xl vs lg)", "z-index range (20-50)", "glassmorphic materials"],
  },
  TIER_PRODUCT_APP: {
    tierId: "TIER_PRODUCT_APP",
    description: "Domain app content inside windows",
    tokenSources: [
      "src/platform/design-system/app-window-system.ts (APP_MATERIALS, APP_SHADOWS, APP_CHROME, APP_TYPE)",
      "src/platform/design-system/sita-design-tokens.ts (SURFACE_TOKENS levels 0-2, DOMAIN_ATMOSPHERE)",
    ],
    spacingScale: "SPACE from app-window-system.ts",
    surfaceDensity: "standard",
    elevationRules: "Card-based surfaces with SURFACE_TOKENS shadows; no glassmorphism inside app content",
    typographyHierarchy: "APP_TYPE for all in-app text; heading/title/body/label scale",
    chromeIntensity: "standard",
    motionProfile: "full",
    contrastRequirements: "Standard WCAG AA on solid surfaces",
    sharedWithOtherTiers: ["typography-scale", "domain-atmosphere", "trust-badges", "state-grammar", "motion-spring-defaults"],
    intentionalDifferences: ["solid surfaces (no glass)", "card-based layout", "domain accent colors"],
  },
  TIER_OPERATOR_ADMIN: {
    tierId: "TIER_OPERATOR_ADMIN",
    description: "Admin/operator surfaces for system management",
    tokenSources: [
      "src/platform/design-system/app-window-system.ts (inherits APP tier)",
      "src/platform/design-system/sita-design-tokens.ts (SURFACE_TOKENS levels 0-1)",
    ],
    spacingScale: "SPACE from app-window-system.ts (tighter: micro=4, tight=8)",
    surfaceDensity: "compact",
    elevationRules: "Flat surfaces (level 0-1 only); minimal shadows for data density",
    typographyHierarchy: "APP_TYPE label/body preferred; reduced heading frequency",
    chromeIntensity: "minimal",
    motionProfile: "reduced",
    contrastRequirements: "WCAG AA; high contrast for audit/status indicators",
    sharedWithOtherTiers: ["typography-scale", "trust-badges", "state-grammar"],
    intentionalDifferences: ["higher density", "reduced chrome", "flatter surfaces", "neutral palette"],
  },
  TIER_SUPPORT_TRUST: {
    tierId: "TIER_SUPPORT_TRUST",
    description: "Trust, evidence, disclosure, and explanation surfaces",
    tokenSources: [
      "src/packages/design-tokens/index.ts (BADGE_STYLES, trust states)",
      "src/platform/product/trust-explanation-layer.ts (TRUST_BADGES)",
      "src/platform/design-system/sita-design-tokens.ts (BADGE_STYLES)",
    ],
    spacingScale: "Inherits parent tier spacing",
    surfaceDensity: "standard",
    elevationRules: "Inline or pinned to content top-right; subtle border emphasis",
    typographyHierarchy: "trustAnnotation from SITA_TYPE; smaller scale for inline badges",
    chromeIntensity: "minimal",
    motionProfile: "minimal",
    contrastRequirements: "Trust badges must be immediately legible; distinct from content",
    sharedWithOtherTiers: ["typography-scale", "state-grammar"],
    intentionalDifferences: ["badge-specific color palette", "annotation typography", "fixed placement rules"],
  },
  TIER_DEGRADED_RECOVERY: {
    tierId: "TIER_DEGRADED_RECOVERY",
    description: "Degraded, offline, error, and recovery states",
    tokenSources: [
      "src/platform/product/state-grammar.ts (STATE_METADATA_DEFAULTS)",
      "src/packages/design-tokens/index.ts (state colors)",
    ],
    spacingScale: "Inherits parent tier spacing",
    surfaceDensity: "spacious",
    elevationRules: "Centered card with muted background; reduced visual complexity",
    typographyHierarchy: "APP_TYPE heading for title; body for message; label for action",
    chromeIntensity: "none",
    motionProfile: "minimal",
    contrastRequirements: "Error/warning colors must pass WCAG AA on muted backgrounds",
    sharedWithOtherTiers: ["typography-scale", "state-grammar"],
    intentionalDifferences: ["muted palette", "reduced motion", "spacious layout", "no chrome distractions"],
  },
} as const;

export const VISUAL_TIER_COUNT = Object.keys(VISUAL_TIERS).length;

export function getVisualTier(tierId: VisualTierId): VisualTier {
  return VISUAL_TIERS[tierId];
}

export function getAllTierIds(): VisualTierId[] {
  return Object.keys(VISUAL_TIERS) as VisualTierId[];
}