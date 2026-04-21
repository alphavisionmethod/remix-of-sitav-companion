// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust / Explanation Visual Grammar
// Unifies trust badge rendering across all shell and app surfaces.
// ═══════════════════════════════════════════════════════════════

import type { TrustBadgeLevel } from "@/platform/product/trust-explanation-layer";

export interface TrustVisualMapping {
  readonly level: TrustBadgeLevel;
  readonly badgeIntent: string;
  readonly colorToken: string;
  readonly iconRef: string;
  readonly surfacePlacement: string;
  readonly typographyRef: string;
  readonly canonicalComponentRef: string;
}

export const TRUST_VISUAL_MAP: Record<TrustBadgeLevel, TrustVisualMapping> = {
  "verified": {
    level: "verified",
    badgeIntent: "success",
    colorToken: "hsl(var(--success, 152 55% 48%))",
    iconRef: "shield-check",
    surfacePlacement: "top-right of content area, z-index above content",
    typographyRef: "SITA_TYPE.trustAnnotation / text-[10px] font-medium tracking-wider",
    canonicalComponentRef: "TrustBadge / TrustStateBadge",
  },
  "ai-generated": {
    level: "ai-generated",
    badgeIntent: "ai",
    colorToken: "hsl(var(--accent, 265 55% 58%))",
    iconRef: "sparkles",
    surfacePlacement: "top-right of content area, z-index above content",
    typographyRef: "SITA_TYPE.trustAnnotation / text-[10px] font-medium tracking-wider",
    canonicalComponentRef: "AIConfidenceDisclosure / SourceOfTruthDisclosure",
  },
  "user-provided": {
    level: "user-provided",
    badgeIntent: "neutral",
    colorToken: "hsl(var(--muted-foreground))",
    iconRef: "user",
    surfacePlacement: "inline with content attribution",
    typographyRef: "SITA_TYPE.trustAnnotation / text-[10px] font-medium tracking-wider",
    canonicalComponentRef: "TrustBadge",
  },
  "external": {
    level: "external",
    badgeIntent: "info",
    colorToken: "hsl(var(--info, 210 80% 55%))",
    iconRef: "external-link",
    surfacePlacement: "inline with source attribution",
    typographyRef: "SITA_TYPE.trustAnnotation / text-[10px] font-medium tracking-wider",
    canonicalComponentRef: "TrustBadge / ProvenanceChip",
  },
  "simulated": {
    level: "simulated",
    badgeIntent: "warning",
    colorToken: "hsl(var(--warning, 38 92% 50%))",
    iconRef: "flask",
    surfacePlacement: "top-right of content area, prominent",
    typographyRef: "SITA_TYPE.trustAnnotation / text-[10px] font-medium tracking-wider",
    canonicalComponentRef: "TrustBadge / SurfaceTrustStrip",
  },
  "unverified": {
    level: "unverified",
    badgeIntent: "destructive",
    colorToken: "hsl(var(--destructive))",
    iconRef: "alert-triangle",
    surfacePlacement: "top-right of content area, prominent with border emphasis",
    typographyRef: "SITA_TYPE.trustAnnotation / text-[10px] font-medium tracking-wider",
    canonicalComponentRef: "TrustBadge / SurfaceTrustStrip",
  },
} as const;

export const TRUST_VISUAL_COUNT = Object.keys(TRUST_VISUAL_MAP).length;

// ── Trust Surface Placement Rules ───────────────────────────────

export const TRUST_PLACEMENT_RULES = {
  defaultPosition: "top-right of content area" as const,
  zIndexAboveContent: true,
  consistentTypography: "text-[10px] font-medium tracking-wider uppercase",
  maxBadgesPerSurface: 3,
  stackDirection: "horizontal" as const,
  spacing: "gap-1.5",
} as const;