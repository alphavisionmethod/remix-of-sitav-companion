// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Barrel: Setup
// Canonical import: @/platform/setup
//
// Aggregates platform-level setup hooks AND re-exports the canonical
// onboarding surface registry (truth source for onboarding intents).
//
// NOTE: useOnboardingDaemon is DEPRECATED — see ONBOARDING_DEPRECATED_SURFACES.
// New code MUST use OSSetupExperience or the registry below.
// Truth source: src/lib/architecture/onboarding-surface-registry.ts
// ═══════════════════════════════════════════════════════════════

export * from "@/hooks/use-session-restore";
export * from "@/platform/orchestration/hooks/useSetupOrchestration";
export * from "@/platform/setup/hooks/useOnboardingDaemon";
export * from "@/platform/runtime/hooks/useUpdateDaemon";

// Canonical onboarding surface registry.
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
