// ═══════════════════════════════════════════════════════════════
// AUTO-GENERATED snapshot of first-use spec coverage.
// Source: src/lib/architecture/first-use-spec-registry.ts
// Generator: scripts/architecture/checks/check-first-use-spec-coverage.ts
// Last refreshed: 2026-04-20
//
// Re-import this in admin dashboards to render the coverage matrix
// without re-deriving from the registry at runtime.
// ═══════════════════════════════════════════════════════════════

export interface FirstUseSpecCoverageRow {
  specScreenNumber: number;
  specScreenId: string;
  phase: 0 | 1 | 2 | 3 | 4;
  displayName: string;
  status: "implemented" | "partial" | "planned";
  component: string | null;
  phaseIds: string[];
}

export const FIRST_USE_SPEC_COVERAGE_SNAPSHOT: readonly FirstUseSpecCoverageRow[] = [
  { specScreenNumber: 1, specScreenId: "boot-foundation", phase: 0, displayName: "Boot & Secure Foundation", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["boot", "secure-foundation"] },
  { specScreenNumber: 2, specScreenId: "language-region", phase: 1, displayName: "Language & Region", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["language-region"] },
  { specScreenNumber: 3, specScreenId: "network-setup", phase: 1, displayName: "Network Setup", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["network-setup"] },
  { specScreenNumber: 4, specScreenId: "device-readiness", phase: 1, displayName: "Device Readiness", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["device-readiness", "system-check"] },
  { specScreenNumber: 5, specScreenId: "device-ownership", phase: 1, displayName: "Device Ownership", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["device-ownership"] },
  { specScreenNumber: 6, specScreenId: "updates-readiness", phase: 1, displayName: "Update Readiness", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["system-check"] },
  { specScreenNumber: 7, specScreenId: "account-environment", phase: 2, displayName: "Account & Environment", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["account-environment"] },
  { specScreenNumber: 8, specScreenId: "restore-preview", phase: 2, displayName: "Restore Preview", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["restore-preview", "recover-first"] },
  { specScreenNumber: 9, specScreenId: "access-protection", phase: 2, displayName: "Access & Protection", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["access-protection", "trust-certificate"] },
  { specScreenNumber: 10, specScreenId: "privacy-transparency", phase: 2, displayName: "Privacy & Transparency", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["privacy-transparency", "memory-consent"] },
  { specScreenNumber: 11, specScreenId: "personalization-transition", phase: 3, displayName: "Personalization Transition", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["personalization-pivot"] },
  { specScreenNumber: 12, specScreenId: "onboarding-depth-choice", phase: 3, displayName: "Onboarding Depth Choice", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["setup-style"] },
  { specScreenNumber: 13, specScreenId: "quick-life-snapshot", phase: 3, displayName: "Quick Life Snapshot", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["quick-identity"] },
  { specScreenNumber: 14, specScreenId: "current-operating-context", phase: 3, displayName: "Current Operating Context", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["operating-context"] },
  { specScreenNumber: 15, specScreenId: "life-rhythm-discovery", phase: 3, displayName: "Life Rhythm Discovery", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["life-rhythm", "rituals"] },
  { specScreenNumber: 16, specScreenId: "stress-slippage-mapping", phase: 3, displayName: "Stress & Slippage Mapping", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["stress-slippage", "want-less-of", "protect-most"] },
  { specScreenNumber: 17, specScreenId: "household-context", phase: 3, displayName: "Household Context (conditional)", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["household-graph", "home-composition"] },
  { specScreenNumber: 18, specScreenId: "work-business-context", phase: 3, displayName: "Work / Business Context (conditional)", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["deep-world-modeling", "primary-use-mode"] },
  { specScreenNumber: 19, specScreenId: "money-context", phase: 3, displayName: "Money Context (conditional)", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["deep-world-modeling"] },
  { specScreenNumber: 20, specScreenId: "communications-context", phase: 3, displayName: "Communications Context", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["communications-context", "interruption-style"] },
  { specScreenNumber: 21, specScreenId: "planning-style", phase: 3, displayName: "Planning Style & Surface Preference", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["planning-style"] },
  { specScreenNumber: 22, specScreenId: "relationship-people-mapping", phase: 3, displayName: "Relationship & People Mapping", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["relationship-sensitivity"] },
  { specScreenNumber: 23, specScreenId: "support-style-presence", phase: 3, displayName: "Support Style & Presence", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["explanation-style", "presence-style"] },
  { specScreenNumber: 24, specScreenId: "trust-autonomy-calibration", phase: 3, displayName: "Trust & Autonomy Calibration", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["trust-calibration"] },
  { specScreenNumber: 25, specScreenId: "advisor-activation", phase: 3, displayName: "Advisor Activation", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["advisor-activation"] },
  { specScreenNumber: 26, specScreenId: "first-connections", phase: 3, displayName: "Connect What Matters First", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["first-connections"] },
  { specScreenNumber: 27, specScreenId: "first-win-recommendation", phase: 3, displayName: "First Win Recommendation", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["first-win-setup", "first-simulation", "first-actions"] },
  { specScreenNumber: 28, specScreenId: "environment-shaping-summary", phase: 3, displayName: "Environment Shaping Summary", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["environment-summary", "desktop-preview", "arrival-prep"] },
  { specScreenNumber: 29, specScreenId: "desktop-arrival", phase: 4, displayName: "Desktop Arrival", status: "implemented", component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["desktop-transition"] },
] as const;

export const FIRST_USE_SPEC_COVERAGE_META = {
  totalScreens: 29,
  implementedCount: 29,
  partialCount: 0,
  plannedCount: 0,
  perPhase: {
    0: { implemented: 1, total: 1 },
    1: { implemented: 5, total: 5 },
    2: { implemented: 4, total: 4 },
    3: { implemented: 18, total: 18 },
    4: { implemented: 1, total: 1 },
  },
  generatedAt: "2026-04-20T00:00:00.000Z",
} as const;
