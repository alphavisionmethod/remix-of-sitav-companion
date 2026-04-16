// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Duplication Map
//
// Declares the canonical winner for each true duplicate family
// AND records false-positive name collisions (different APIs that
// share a name but are not interchangeable).
// ═══════════════════════════════════════════════════════════════

export type DuplicateStatus =
  | "WRAPPED"             // legacy paths are thin re-exports of canonical
  | "MIGRATING"           // dual implementations exist; consumers being moved
  | "REMOVED"             // legacy paths deleted
  | "FALSE_POSITIVE";     // shared name only — APIs are intentionally different

export interface DuplicateFamily {
  id: string;
  description: string;
  canonical: string;
  wrappers: string[];
  status: DuplicateStatus;
  /** When FALSE_POSITIVE: why these can't be merged */
  rationale?: string;
}

/**
 * Real consolidation work happens in `src/components/primitives/**`
 * (the canonical visual layer). Domain components keep their richer
 * APIs and are NOT force-merged — that would break consumers.
 *
 * This file's primary job is to:
 *   1. Track shared-name collisions so they don't grow.
 *   2. Identify true wrapper opportunities for future migration.
 */
export const DUPLICATE_FAMILIES: DuplicateFamily[] = [
  // ── True consolidations (canonical primitive layer) ─────────
  {
    id: "primitive-trust-badge",
    description:
      "Canonical TrustBadge primitive. Domain-specific richer variants " +
      "(`sita/TrustBadge` 9-level, `sita/badges/TrustBadge` 3-level) coexist " +
      "with their own vocabularies and remain valid until consumers opt in.",
    canonical: "src/components/primitives/status/TrustBadge.tsx",
    wrappers: [],
    status: "MIGRATING",
  },
  {
    id: "primitive-status-badge",
    description: "Canonical StatusBadge primitive. Replaces ad-hoc badge styling.",
    canonical: "src/components/primitives/status/StatusBadge.tsx",
    wrappers: [],
    status: "MIGRATING",
  },
  {
    id: "primitive-base-card",
    description:
      "Canonical BaseCard primitive. Domain *Card components should " +
      "compose this for consistent surface treatment.",
    canonical: "src/components/primitives/display/BaseCard.tsx",
    wrappers: [],
    status: "MIGRATING",
  },

  // ── Documented false positives (NOT to be merged) ───────────
  {
    id: "fp-trust-badge-vocabulary-split",
    description:
      "Two TrustBadge files share a name but have intentionally different " +
      "trust vocabularies (9-level execution trust vs 3-level data trust).",
    canonical: "src/components/sita/TrustBadge.tsx",
    wrappers: ["src/components/sita/badges/TrustBadge.tsx"],
    status: "FALSE_POSITIVE",
    rationale:
      "Different trust ontologies. Consolidation would lose semantic precision. " +
      "Both should eventually compose `primitives/status/StatusBadge`.",
  },
  {
    id: "fp-proof-card-data-shape",
    description:
      "ProofCard exists in `mobile/` (item-shaped API) and `sita/cards/` " +
      "(chain-shaped API). Different consumers, different data models.",
    canonical: "src/components/sita/cards/ProofCard.tsx",
    wrappers: ["src/components/mobile/ProofCard.tsx"],
    status: "FALSE_POSITIVE",
    rationale:
      "Mobile uses a flat ProofItem shape for list rows; desktop uses a " +
      "chain-of-steps shape for full proof timelines. Wrapping would break both.",
  },
  {
    id: "fp-concierge-app-shell-scope",
    description:
      "ConciergeAppShell exists in `concierge/` (simple sidebar) and " +
      "`sita/apps/concierge/` (full 19-page windowed app).",
    canonical: "src/components/sita/apps/concierge/ConciergeAppShell.tsx",
    wrappers: ["src/components/concierge/ConciergeAppShell.tsx"],
    status: "FALSE_POSITIVE",
    rationale:
      "Different surface scopes. The simple shell is used in lightweight " +
      "embeddings; the full shell powers the standalone app.",
  },
  {
    id: "fp-advisor-debate-view-domain-split",
    description:
      "AdvisorDebateView has a council-level version (`advisors/`) and a " +
      "business-board version (`business/advisor-board/`).",
    canonical: "src/components/business/advisor-board/AdvisorDebateView.tsx",
    wrappers: ["src/components/advisors/AdvisorDebateView.tsx"],
    status: "FALSE_POSITIVE",
    rationale:
      "Different prop shapes (AdvisorConfig[] vs AIRecommendation[]). " +
      "Consolidation requires a unified debate model first.",
  },
  {
    id: "fp-sparkline-chart-styling",
    description:
      "SparklineChart exists in `sita/` (positive flag) and " +
      "`business/advisor-board/` (color/fillOpacity props).",
    canonical: "src/components/sita/SparklineChart.tsx",
    wrappers: ["src/components/business/advisor-board/SparklineChart.tsx"],
    status: "FALSE_POSITIVE",
    rationale:
      "Different visual treatments and prop APIs. Future work: extract a " +
      "shared `primitives/charts/Sparkline` and let both forks compose it.",
  },
];

export function findDuplicateFamily(filePath: string): DuplicateFamily | null {
  const normalized = filePath.replace(/\\/g, "/");
  return (
    DUPLICATE_FAMILIES.find(
      f => f.canonical === normalized || f.wrappers.includes(normalized)
    ) ?? null
  );
}

export function allDeclaredWrappers(): string[] {
  return DUPLICATE_FAMILIES.filter(f => f.status === "WRAPPED").flatMap(f => f.wrappers);
}

export function allCanonicalPaths(): string[] {
  return DUPLICATE_FAMILIES.map(f => f.canonical);
}

export function allKnownNameCollisions(): string[] {
  return DUPLICATE_FAMILIES.filter(f => f.status === "FALSE_POSITIVE").flatMap(f => [
    f.canonical,
    ...f.wrappers,
  ]);
}
