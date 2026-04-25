// ════════════════════════════════════════════════════════════
// SITA OS — Module Decision Queue (Phase 4 resolutions)
// ════════════════════════════════════════════════════════════
// Single source of truth for ambiguous-area placements decided
// during the 4-pillar re-architecture. Consumed by the launcher,
// nav, and validator so every legacy surface has an explicit owner.

import type { PillarId } from "@/modules";

export type SurfaceOwner = PillarId | "trust" | "shared";

export interface DecisionEntry {
  /** Legacy route prefix or canonical surface label */
  readonly surface: string;
  /** Decided owner */
  readonly owner: SurfaceOwner;
  /** Short justification (used in the blueprint and admin UI) */
  readonly rationale: string;
  /** "default" = applied automatically; "needs-confirmation" = surfaced in admin UI */
  readonly status: "default" | "needs-confirmation" | "confirmed";
}

export const DECISION_QUEUE: readonly DecisionEntry[] = [
  {
    surface: "/owner",
    owner: "trust",
    rationale:
      "OwnerCenter is an authority/governance plane (approvals, autonomy, releases). Belongs to Trust + Shared admin, not a 5th pillar.",
    status: "default",
  },
  {
    surface: "/atlas",
    owner: "shared",
    rationale:
      "Atlas is cross-tenant analytics — shared admin plane. Reuses Mission Control's chrome but is not pillar-owned.",
    status: "default",
  },
  {
    surface: "/enterprise",
    owner: "shared",
    rationale: "Tenant + enterprise pages are platform admin, not pillar features.",
    status: "default",
  },
  {
    surface: "LifeSimulator",
    owner: "finance",
    rationale:
      "Financial-scenario simulator. Lives under Finance OS as a planning surface; the underlying engine stays in Shared.",
    status: "default",
  },
  {
    surface: "LifeDashboard",
    owner: "concierge",
    rationale:
      "Daily-life coordination summary. Concierge owns the surface; Shared keeps the data fabric.",
    status: "default",
  },
  {
    surface: "PersonalBrain",
    owner: "shared",
    rationale:
      "Conversational AI surface usable across all pillars. Stays in Shared so every pillar can summon it.",
    status: "default",
  },
  {
    surface: "CalendarWorkspace",
    owner: "concierge",
    rationale:
      "Concierge owns the primary calendar surface; the scheduling engine remains a Shared service.",
    status: "default",
  },
  {
    surface: "SimulationEngine",
    owner: "shared",
    rationale:
      "Engine is shared; Finance UI (LifeSimulator/ScenarioLab) consumes it. No engine duplication per pillar.",
    status: "default",
  },
  {
    surface: "BoardroomGlobal",
    owner: "shared",
    rationale:
      "Cross-pillar boardroom is Shared; pillar-specific boardrooms (Business/Money/Concierge) stay in their pillars.",
    status: "default",
  },
  {
    surface: "naming.finance",
    owner: "finance",
    rationale:
      "URL prefix remains /money/* for stability; user-facing label is 'Finance OS' across launcher and nav.",
    status: "confirmed",
  },
  {
    surface: "naming.health",
    owner: "health",
    rationale:
      "Domain-specific health (CRM health, fleet health, money health) stays in those pillars. Health OS owns only personal health.",
    status: "confirmed",
  },
];

export function getDecisionFor(surface: string): DecisionEntry | undefined {
  return DECISION_QUEUE.find((d) => d.surface === surface);
}
