// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Duplication Map
// Tracks every shared-name component cluster with explicit policy.
// ═══════════════════════════════════════════════════════════════

export type DuplicateStatus =
  | "WRAPPED"          // legacy paths are thin re-exports of canonical
  | "MIGRATING"        // canonical exists; consumers being moved (no forced wrap)
  | "REMOVED"          // legacy paths deleted
  | "FALSE_POSITIVE";  // shared name only — APIs intentionally different

export interface DuplicateFamily {
  id: string;
  description: string;
  canonical: string;
  wrappers: string[];
  status: DuplicateStatus;
  rationale?: string;
}

export const DUPLICATE_FAMILIES: DuplicateFamily[] = [
  // ── Canonical primitives (MIGRATING — legacy domain copies remain valid) ──
  {
    id: "primitive-status-badge",
    description: "Canonical StatusBadge primitive.",
    canonical: "src/components/primitives/status/StatusBadge.tsx",
    wrappers: ["src/components/sita/admin/StatusBadge.tsx"],
    status: "MIGRATING",
  },
  {
    id: "primitive-trust-badge",
    description: "Canonical TrustBadge primitive (4-state).",
    canonical: "src/components/primitives/status/TrustBadge.tsx",
    wrappers: [
      "src/components/sita/TrustBadge.tsx",
      "src/components/sita/badges/TrustBadge.tsx",
    ],
    status: "MIGRATING",
    rationale: "Legacy 9-level and 3-level vocabularies preserved until consumers opt in.",
  },
  {
    id: "primitive-urgency-badge",
    description: "Canonical UrgencyBadge primitive.",
    canonical: "src/components/primitives/status/UrgencyBadge.tsx",
    wrappers: ["src/components/sita/badges/UrgencyBadge.tsx"],
    status: "MIGRATING",
  },
  {
    id: "primitive-proof-badge",
    description: "Canonical ProofBadge primitive.",
    canonical: "src/components/primitives/status/ProofBadge.tsx",
    wrappers: ["src/components/sita/badges/ProofBadge.tsx"],
    status: "MIGRATING",
  },
  {
    id: "primitive-freshness-badge",
    description: "Canonical FreshnessBadge primitive.",
    canonical: "src/components/primitives/status/FreshnessBadge.tsx",
    wrappers: ["src/components/sita/badges/FreshnessBadge.tsx"],
    status: "MIGRATING",
  },
  {
    id: "primitive-mode-badge",
    description: "Canonical ModeBadge primitive.",
    canonical: "src/components/primitives/status/ModeBadge.tsx",
    wrappers: ["src/components/sita/badges/ModeBadge.tsx"],
    status: "MIGRATING",
  },
  {
    id: "primitive-empty-state",
    description: "Canonical EmptyState primitive.",
    canonical: "src/components/primitives/feedback/EmptyState.tsx",
    wrappers: ["src/components/sita/EmptyState.tsx"],
    status: "MIGRATING",
  },
  {
    id: "primitive-skeleton",
    description: "Canonical Skeleton primitive (composes shadcn ui/skeleton).",
    canonical: "src/components/primitives/feedback/Skeleton.tsx",
    wrappers: ["src/components/ui/skeleton.tsx"],
    status: "FALSE_POSITIVE",
    rationale: "shadcn/ui skeleton is the underlying lib; primitive is the project-canonical wrapper.",
  },
  {
    id: "primitive-drawer",
    description: "Canonical Drawer primitive (composes shadcn ui/sheet).",
    canonical: "src/components/primitives/overlays/Drawer.tsx",
    wrappers: ["src/components/ui/drawer.tsx"],
    status: "FALSE_POSITIVE",
    rationale: "shadcn/ui drawer (vaul) is a different library; primitive uses Sheet for consistent grammar.",
  },

  // ── Documented false positives (NOT to be merged) ─────────────
  {
    id: "fp-proof-card-data-shape",
    description: "ProofCard exists in mobile/ (item-shaped) and sita/cards/ (chain-shaped).",
    canonical: "src/components/sita/cards/ProofCard.tsx",
    wrappers: ["src/components/mobile/ProofCard.tsx"],
    status: "FALSE_POSITIVE",
    rationale: "Different data models (flat ProofItem vs chain-of-steps). Wrapping would break both.",
  },
  {
    id: "fp-concierge-app-shell-scope",
    description: "ConciergeAppShell — simple sidebar vs full 19-page windowed app.",
    canonical: "src/components/sita/apps/concierge/ConciergeAppShell.tsx",
    wrappers: ["src/components/concierge/ConciergeAppShell.tsx"],
    status: "FALSE_POSITIVE",
    rationale: "Different surface scopes; both intentionally maintained.",
  },
  {
    id: "fp-advisor-debate-view-domain-split",
    description: "AdvisorDebateView — council version vs business-board version.",
    canonical: "src/components/business/advisor-board/AdvisorDebateView.tsx",
    wrappers: ["src/components/advisors/AdvisorDebateView.tsx"],
    status: "FALSE_POSITIVE",
    rationale: "Different prop shapes (AdvisorConfig[] vs AIRecommendation[]).",
  },
  {
    id: "fp-sparkline-chart-styling",
    description: "SparklineChart — sita (positive flag) vs business/advisor-board (color/fillOpacity).",
    canonical: "src/components/sita/SparklineChart.tsx",
    wrappers: ["src/components/business/advisor-board/SparklineChart.tsx"],
    status: "FALSE_POSITIVE",
    rationale: "Different prop APIs; future work: extract shared primitives/charts/Sparkline.",
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
  return DUPLICATE_FAMILIES.flatMap(f => [f.canonical, ...f.wrappers]);
}
