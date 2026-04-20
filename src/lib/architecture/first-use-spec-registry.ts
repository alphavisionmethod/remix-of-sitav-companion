// ════════════════════════════════════════════════════════════════
// SITA OS — First-Use Master Spec Registry (Truth Source)
// ----------------------------------------------------------------
// Maps every one of the 29 master-spec screens (memory/features/
// first-use-master-spec) to the implementing component AND the
// SetupPhaseId(s) that deliver it inside OSSetupExperience.tsx.
//
// Why this exists:
//   The 29-screen master spec is delivered through ~50 finer-grained
//   phases. A single spec screen can decompose into multiple phases,
//   and a single phase can fulfil multiple spec screens. Without a
//   typed registry, audits cannot prove coverage and CI cannot block
//   silent regressions.
//
// Truth contract:
//   - Every spec screen 1..29 MUST have an entry here.
//   - Every entry MUST point to (a) a real component file on disk,
//     and (b) one or more SetupPhaseId values that exist in the
//     SetupPhaseId union (src/packages/contracts/specialized/
//     setup-orchestration.ts).
//
// Validator: scripts/architecture/checks/check-first-use-spec-coverage.ts
// Aggregator gate #23: scripts/architecture/checks/check-os-release-readiness.ts
// Static snapshot: src/lib/architecture/generated/first-use-spec-coverage.generated.ts
// ════════════════════════════════════════════════════════════════

import type { SetupPhaseId } from "@/packages/contracts/specialized/setup-orchestration";

export type FirstUseSpecStatus = "implemented" | "partial" | "planned";
export type FirstUseSpecPhase = 0 | 1 | 2 | 3 | 4;

export interface FirstUseSpecScreen {
  /** Stable id for the spec screen (kebab-case). */
  specScreenId: string;
  /** Sequential number 1..29 from the master spec. */
  specScreenNumber: number;
  /** Master-spec phase number 0..4. */
  phase: FirstUseSpecPhase;
  /** Human display name from the spec. */
  displayName: string;
  /** Implementation status for this screen. */
  status: FirstUseSpecStatus;
  /** Implementation pointer. Null only when status === "planned". */
  implementedBy: {
    /** Path of the component file delivering this screen (relative to repo root). */
    component: string;
    /** SetupPhaseId(s) that render the spec screen inside OSSetupExperience. */
    phaseIds: SetupPhaseId[];
  } | null;
  /** Optional supporting evidence references (file paths, registry ids). */
  evidence: string[];
  /** Free-form context. */
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────
// Phase 0 — Boot & Foundation (1 screen)
// Phase 1 — Machine Readiness (5 screens)
// Phase 2 — Identity & Trust (5 screens)
// Phase 3 — Personalization Ceremony (18 screens, #11–#28)
// Phase 4 — Post-Arrival Continuity (1 screen, #29)
// ─────────────────────────────────────────────────────────────────

export const FIRST_USE_SPEC_SCREENS: readonly FirstUseSpecScreen[] = [
  // ── Phase 0 ──────────────────────────────────────────────────
  {
    specScreenId: "boot-foundation",
    specScreenNumber: 1,
    phase: 0,
    displayName: "Boot & Secure Foundation",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["boot", "secure-foundation"] },
    evidence: ["src/lib/architecture/onboarding-surface-registry.ts#os-first-boot"],
  },
  // ── Phase 1 — Machine Readiness ───────────────────────────────
  {
    specScreenId: "language-region",
    specScreenNumber: 2,
    phase: 1,
    displayName: "Language & Region",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["language-region"] },
    evidence: [],
  },
  {
    specScreenId: "network-setup",
    specScreenNumber: 3,
    phase: 1,
    displayName: "Network Setup",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["network-setup"] },
    evidence: [],
  },
  {
    specScreenId: "device-readiness",
    specScreenNumber: 4,
    phase: 1,
    displayName: "Device Readiness",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["device-readiness", "system-check"] },
    evidence: [],
  },
  {
    specScreenId: "device-ownership",
    specScreenNumber: 5,
    phase: 1,
    displayName: "Device Ownership",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["device-ownership"] },
    evidence: [],
  },
  {
    specScreenId: "updates-readiness",
    specScreenNumber: 6,
    phase: 1,
    displayName: "Update Readiness",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["system-check"] },
    evidence: ["src/hooks/useUpdateDaemon.ts"],
    notes: "System-check phase verifies update channel and patch baseline.",
  },
  // ── Phase 2 — Identity & Trust ────────────────────────────────
  {
    specScreenId: "account-environment",
    specScreenNumber: 7,
    phase: 2,
    displayName: "Account & Environment",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["account-environment"] },
    evidence: [],
  },
  {
    specScreenId: "restore-preview",
    specScreenNumber: 8,
    phase: 2,
    displayName: "Restore Preview",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["restore-preview", "recover-first"] },
    evidence: [],
  },
  {
    specScreenId: "access-protection",
    specScreenNumber: 9,
    phase: 2,
    displayName: "Access & Protection",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["access-protection", "trust-certificate"] },
    evidence: [],
  },
  {
    specScreenId: "privacy-transparency",
    specScreenNumber: 10,
    phase: 2,
    displayName: "Privacy & Transparency",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["privacy-transparency", "memory-consent"] },
    evidence: [],
  },
  // ── Phase 3 — Personalization Ceremony (18 screens) ──────────
  {
    specScreenId: "personalization-transition",
    specScreenNumber: 11,
    phase: 3,
    displayName: "Personalization Transition",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["personalization-pivot"] },
    evidence: [],
  },
  {
    specScreenId: "onboarding-depth-choice",
    specScreenNumber: 12,
    phase: 3,
    displayName: "Onboarding Depth Choice",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["setup-style"] },
    evidence: ["src/lib/setup/emotional-arc.ts"],
  },
  {
    specScreenId: "quick-life-snapshot",
    specScreenNumber: 13,
    phase: 3,
    displayName: "Quick Life Snapshot",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["quick-identity"] },
    evidence: [],
  },
  {
    specScreenId: "current-operating-context",
    specScreenNumber: 14,
    phase: 3,
    displayName: "Current Operating Context",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["operating-context"] },
    evidence: [],
  },
  {
    specScreenId: "life-rhythm-discovery",
    specScreenNumber: 15,
    phase: 3,
    displayName: "Life Rhythm Discovery",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["life-rhythm", "rituals"] },
    evidence: [],
  },
  {
    specScreenId: "stress-slippage-mapping",
    specScreenNumber: 16,
    phase: 3,
    displayName: "Stress & Slippage Mapping",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["stress-slippage", "want-less-of", "protect-most"] },
    evidence: [],
  },
  {
    specScreenId: "household-context",
    specScreenNumber: 17,
    phase: 3,
    displayName: "Household Context (conditional)",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["household-graph", "home-composition"] },
    evidence: [],
    notes: "Conditional branch — gated by domain selection in operating-context.",
  },
  {
    specScreenId: "work-business-context",
    specScreenNumber: 18,
    phase: 3,
    displayName: "Work / Business Context (conditional)",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["deep-world-modeling", "primary-use-mode"] },
    evidence: [],
    notes: "Conditional — only when work/business domain selected.",
  },
  {
    specScreenId: "money-context",
    specScreenNumber: 19,
    phase: 3,
    displayName: "Money Context (conditional)",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["deep-world-modeling"] },
    evidence: ["src/lib/architecture/onboarding-surface-registry.ts#money-introduction"],
    notes: "Light-touch in OS first-boot; full Money introduction is the separate money-introduction surface.",
  },
  {
    specScreenId: "communications-context",
    specScreenNumber: 20,
    phase: 3,
    displayName: "Communications Context",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["communications-context", "interruption-style"] },
    evidence: [],
  },
  {
    specScreenId: "planning-style",
    specScreenNumber: 21,
    phase: 3,
    displayName: "Planning Style & Surface Preference",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["planning-style"] },
    evidence: [],
  },
  {
    specScreenId: "relationship-people-mapping",
    specScreenNumber: 22,
    phase: 3,
    displayName: "Relationship & People Mapping",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["relationship-sensitivity"] },
    evidence: [],
  },
  {
    specScreenId: "support-style-presence",
    specScreenNumber: 23,
    phase: 3,
    displayName: "Support Style & Presence",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["explanation-style", "presence-style"] },
    evidence: [],
  },
  {
    specScreenId: "trust-autonomy-calibration",
    specScreenNumber: 24,
    phase: 3,
    displayName: "Trust & Autonomy Calibration",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["trust-calibration"] },
    evidence: [],
  },
  {
    specScreenId: "advisor-activation",
    specScreenNumber: 25,
    phase: 3,
    displayName: "Advisor Activation",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["advisor-activation"] },
    evidence: [],
  },
  {
    specScreenId: "first-connections",
    specScreenNumber: 26,
    phase: 3,
    displayName: "Connect What Matters First",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["first-connections"] },
    evidence: [],
  },
  {
    specScreenId: "first-win-recommendation",
    specScreenNumber: 27,
    phase: 3,
    displayName: "First Win Recommendation",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["first-win-setup", "first-simulation", "first-actions"] },
    evidence: [],
  },
  {
    specScreenId: "environment-shaping-summary",
    specScreenNumber: 28,
    phase: 3,
    displayName: "Environment Shaping Summary",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["environment-summary", "desktop-preview", "arrival-prep"] },
    evidence: [],
  },
  // ── Phase 4 — Post-Arrival Continuity ─────────────────────────
  {
    specScreenId: "desktop-arrival",
    specScreenNumber: 29,
    phase: 4,
    displayName: "Desktop Arrival",
    status: "implemented",
    implementedBy: { component: "src/components/sita/OSSetupExperience.tsx", phaseIds: ["desktop-transition"] },
    evidence: ["src/components/sita/DesktopEntryCeremony.tsx"],
  },
] as const;

export const FIRST_USE_SPEC_TOTAL = 29;

export function getFirstUseSpecScreen(specScreenNumber: number): FirstUseSpecScreen | undefined {
  return FIRST_USE_SPEC_SCREENS.find((s) => s.specScreenNumber === specScreenNumber);
}

export function getFirstUseSpecCoverageByPhase(): Record<FirstUseSpecPhase, { implemented: number; partial: number; planned: number; total: number }> {
  const init = (): { implemented: number; partial: number; planned: number; total: number } => ({ implemented: 0, partial: 0, planned: 0, total: 0 });
  const out: Record<FirstUseSpecPhase, ReturnType<typeof init>> = { 0: init(), 1: init(), 2: init(), 3: init(), 4: init() };
  for (const s of FIRST_USE_SPEC_SCREENS) {
    out[s.phase].total += 1;
    out[s.phase][s.status] += 1;
  }
  return out;
}
