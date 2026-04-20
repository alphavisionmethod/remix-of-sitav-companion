// ════════════════════════════════════════════════════════════════
// SITA OS — Canonical Onboarding Surface Registry
// ----------------------------------------------------------------
// SINGLE TRUTH SOURCE for all onboarding entrypoints in the project.
//
// Resolves the historical "multiple onboarding entrypoints" P2
// audit finding (MISSING_AUDIT.md Part XIV) by declaring exactly
// THREE non-overlapping tiers of onboarding intent:
//
//   1. OS    — device-wide first-boot personalization (29-screen master spec)
//   2. BUSINESS — per-business workspace formation (runs AFTER os-first-boot)
//   3. MONEY — optional Finance-app introduction (runs inside Money app)
//
// Any additional surface that *appears* to be onboarding is either:
//   - a UI primitive   (src/components/sita/setup/**, src/lib/setup/**)
//   - a façade barrel  (src/features/onboarding, src/domains/setup, src/platform/setup)
//   - a config helper  (src/lib/business-journey-config.ts)
//   - DEPRECATED       (src/lib/services/onboarding-daemon, useOnboardingDaemon)
//
// Validator:   scripts/architecture/checks/check-onboarding-surface-truth.ts
// ════════════════════════════════════════════════════════════════

export type OnboardingSurfaceTier = "os" | "business" | "money";
export type OnboardingSurfaceStatus = "canonical" | "deprecated" | "library" | "facade";

export interface OnboardingSurface {
  /** Stable registry id. */
  id: string;
  /** Human display name. */
  displayName: string;
  /** Tier — one of the 3 legitimate onboarding intents. */
  tier: OnboardingSurfaceTier;
  /** One-line scope statement. */
  scope: string;
  /** Where the surface mounts in the UX. */
  intent: string;
  /** Canonical entrypoint file path (must exist on disk). */
  entrypointFile: string;
  /** User-visible route that invokes the surface (if any). */
  route?: string;
  /** Declared screen / phase count (informational). */
  screenCount: number;
  /** Owning domain. */
  ownerDomain: "os" | "business" | "money";
  /** Lifecycle status. */
  status: OnboardingSurfaceStatus;
  /** Optional banner sentinel that must appear in the entrypoint file. */
  intentBannerToken: string;
  /** Predecessor that must complete before this surface can run. */
  prerequisite?: string;
  /** Notes for future readers and audits. */
  notes?: string;
}

export const ONBOARDING_SURFACES: readonly OnboardingSurface[] = [
  {
    id: "os-first-boot",
    displayName: "OS First-Boot Personalization",
    tier: "os",
    scope: "Device-wide first-boot personalization, identity, trust calibration, advisor activation.",
    intent: "Runs once per device when no OS profile exists. Implements the 29-screen master spec via ~50 phases.",
    entrypointFile: "src/components/sita/OSSetupExperience.tsx",
    route: "/onboarding",
    screenCount: 50,
    ownerDomain: "os",
    status: "canonical",
    intentBannerToken: "ONBOARDING SURFACE: os-first-boot",
    notes: "29-screen master spec is delivered through ~50 finer-grained phases (each spec screen may decompose into multiple phases).",
  },
  {
    id: "business-formation",
    displayName: "Business Workspace Formation",
    tier: "business",
    scope: "Per-business workspace formation: revenue model, journey, intake, delivery, friction, team.",
    intent: "Runs inside BusinessAppShell when business_onboarding.completed_at is null — strictly after os-first-boot.",
    entrypointFile: "src/pages/revenue-office/onboarding/FormationShell.tsx",
    screenCount: 22,
    ownerDomain: "business",
    status: "canonical",
    intentBannerToken: "ONBOARDING SURFACE: business-formation",
    prerequisite: "os-first-boot",
    notes: "Domain-specific. NOT a duplicate of os-first-boot — different intent, different lifecycle, different data model.",
  },
  {
    id: "money-introduction",
    displayName: "Money Office Introduction",
    tier: "money",
    scope: "Optional Finance-app onboarding: identity, priorities, account connection, operating mode.",
    intent: "Runs inside Money app on first visit when money_onboarding state is incomplete.",
    entrypointFile: "src/components/sita/money-onboarding/MoneyOnboardingFlow.tsx",
    screenCount: 11,
    ownerDomain: "money",
    status: "canonical",
    intentBannerToken: "ONBOARDING SURFACE: money-introduction",
    prerequisite: "os-first-boot",
    notes: "Optional. Money app remains usable in 'lite' mode without completing this surface.",
  },
] as const;

/** Files that are intentionally onboarding-adjacent but are NOT entrypoints. */
export const ONBOARDING_NON_ENTRYPOINTS: readonly { path: string; kind: string; note: string }[] = [
  { path: "src/lib/business-journey-config.ts", kind: "config", note: "Journey recommendation lookup; pure data." },
  { path: "src/features/onboarding/index.ts", kind: "facade", note: "Re-exports OS onboarding atoms." },
  { path: "src/components/sita/setup/", kind: "ui-primitives", note: "Setup atoms used by os-first-boot." },
  { path: "src/lib/setup/", kind: "library", note: "Copy/data helpers (emotional-arc, reflection-copy, world-model-field-meta)." },
  { path: "src/domains/setup/index.ts", kind: "barrel", note: "Re-exports the canonical registry." },
  { path: "src/platform/setup/index.ts", kind: "barrel", note: "Re-exports legacy setup hooks + canonical registry." },
  { path: "src/lib/services/onboarding/index.ts", kind: "service", note: "OnboardingService — generic session tracker, not a UX entrypoint." },
] as const;

/** Surfaces marked DEPRECATED — must not be referenced by new code. */
export const ONBOARDING_DEPRECATED_SURFACES: readonly { path: string; replacement: string; reason: string }[] = [
  {
    path: "src/lib/services/onboarding-daemon/index.ts",
    replacement: "src/components/sita/OSSetupExperience.tsx",
    reason: "Parallel 11-step OS onboarding engine. Superseded by the canonical OSSetupExperience (~50 phases).",
  },
  {
    path: "src/hooks/useOnboardingDaemon.ts",
    replacement: "OSSetupExperience internal state + useSetupOrchestration",
    reason: "Reactive bridge for the deprecated daemon. Retained only for FirstBootSetup compat.",
  },
] as const;

/** Lookup helpers. */
export function getOnboardingSurface(id: string): OnboardingSurface | undefined {
  return ONBOARDING_SURFACES.find((s) => s.id === id);
}

export function getOnboardingSurfacesByTier(tier: OnboardingSurfaceTier): OnboardingSurface[] {
  return ONBOARDING_SURFACES.filter((s) => s.tier === tier);
}

export const ONBOARDING_SURFACE_TIERS: readonly OnboardingSurfaceTier[] = ["os", "business", "money"] as const;
