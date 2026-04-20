// ═══════════════════════════════════════════════════════════════
// SITA OS — Primitive Deprecation Registry
// Explicit enforcement paths for deprecated component copies.
// ═══════════════════════════════════════════════════════════════

export type EnforcementLevel = "warn" | "block";

export interface DeprecationEntry {
  readonly familyId: string;
  readonly deprecatedPath: string;
  readonly canonicalReplacement: string;
  readonly enforcementLevel: EnforcementLevel;
  readonly migrationGuidance: string;
}

/**
 * All actively deprecated component paths with their canonical replacements.
 * Sourced from component-duplication-map MIGRATING families.
 */
export const DEPRECATION_REGISTRY: readonly DeprecationEntry[] = [
  {
    familyId: "primitive-status-badge",
    deprecatedPath: "src/components/sita/admin/StatusBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/StatusBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives StatusBadge.",
  },
  {
    familyId: "primitive-trust-badge",
    deprecatedPath: "src/components/sita/TrustBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/TrustBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives TrustBadge.",
  },
  {
    familyId: "primitive-trust-badge",
    deprecatedPath: "src/components/sita/badges/TrustBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/TrustBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives TrustBadge.",
  },
  {
    familyId: "primitive-urgency-badge",
    deprecatedPath: "src/components/sita/badges/UrgencyBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/UrgencyBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives UrgencyBadge.",
  },
  {
    familyId: "primitive-proof-badge",
    deprecatedPath: "src/components/sita/badges/ProofBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/ProofBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives ProofBadge.",
  },
  {
    familyId: "primitive-freshness-badge",
    deprecatedPath: "src/components/sita/badges/FreshnessBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/FreshnessBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives FreshnessBadge.",
  },
  {
    familyId: "primitive-mode-badge",
    deprecatedPath: "src/components/sita/badges/ModeBadge.tsx",
    canonicalReplacement: "src/components/primitives/status/ModeBadge.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives ModeBadge.",
  },
  {
    familyId: "primitive-empty-state",
    deprecatedPath: "src/components/sita/EmptyState.tsx",
    canonicalReplacement: "src/components/primitives/feedback/EmptyState.tsx",
    enforcementLevel: "warn",
    migrationGuidance: "Replace import with @/components/primitives EmptyState.",
  },
] as const;

/** Total deprecated entries. */
export const DEPRECATED_COUNT = DEPRECATION_REGISTRY.length;

/** Block-level deprecations that fail CI. */
export function getBlockingDeprecations(): readonly DeprecationEntry[] {
  return DEPRECATION_REGISTRY.filter(d => d.enforcementLevel === "block");
}

/** Check if a path is deprecated. */
export function isDeprecatedPath(filePath: string): DeprecationEntry | undefined {
  const normalized = filePath.replace(/\\/g, "/");
  return DEPRECATION_REGISTRY.find(d => d.deprecatedPath === normalized);
}