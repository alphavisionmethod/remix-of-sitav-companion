// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Barrel: src/domains/setup
// Re-exports the canonical onboarding surface registry so any code
// importing from "@/domains/setup" lands on the truth source.
// See: src/lib/architecture/onboarding-surface-registry.ts
// ═══════════════════════════════════════════════════════════════

export {
  ONBOARDING_SURFACES,
  ONBOARDING_NON_ENTRYPOINTS,
  ONBOARDING_DEPRECATED_SURFACES,
  ONBOARDING_SURFACE_TIERS,
  getOnboardingSurface,
  getOnboardingSurfacesByTier,
  type OnboardingSurface,
  type OnboardingSurfaceTier,
  type OnboardingSurfaceStatus,
} from "@/lib/architecture/onboarding-surface-registry";
