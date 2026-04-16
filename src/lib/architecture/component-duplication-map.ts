// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Duplication Map
// Explicit canonical winners for known duplicate families.
//
// New duplicate detection happens in audit-components.ts.
// This file is the **policy** layer — it declares which copy wins.
// ═══════════════════════════════════════════════════════════════

export interface DuplicateFamily {
  /** Stable identifier */
  id: string;
  /** Human description of the duplicate cluster */
  description: string;
  /** The single canonical path that all imports should resolve to */
  canonical: string;
  /** Legacy paths kept as thin re-export wrappers */
  wrappers: string[];
  /** Migration status */
  status: "WRAPPED" | "MIGRATING" | "REMOVED";
}

/**
 * Known duplicate families identified by audit.
 *
 * Rule:
 *   - canonical = the file containing real code
 *   - wrappers  = thin re-export files preserving import paths
 *   - All wrappers must pass check-deprecated-wrappers.ts (≤ 20 LOC, only export/import statements)
 */
export const DUPLICATE_FAMILIES: DuplicateFamily[] = [
  {
    id: "dup-trust-badge",
    description: "TrustBadge — verified/pending/failed status indicator",
    canonical: "src/components/primitives/status/TrustBadge.tsx",
    wrappers: [
      "src/components/sita/TrustBadge.tsx",
      "src/components/sita/badges/TrustBadge.tsx",
    ],
    status: "WRAPPED",
  },
  {
    id: "dup-proof-card",
    description: "ProofCard — proof chain display with verified/pending/failed states",
    canonical: "src/components/sita/cards/ProofCard.tsx",
    wrappers: [
      "src/components/mobile/ProofCard.tsx",
    ],
    status: "MIGRATING",
  },
  {
    id: "dup-concierge-app-shell",
    description: "ConciergeAppShell — concierge surface frame",
    canonical: "src/components/sita/apps/concierge/ConciergeAppShell.tsx",
    wrappers: [
      "src/components/concierge/ConciergeAppShell.tsx",
    ],
    status: "MIGRATING",
  },
  {
    id: "dup-advisor-debate-view",
    description: "AdvisorDebateView — multi-advisor debate transcript view",
    canonical: "src/components/business/advisor-board/AdvisorDebateView.tsx",
    wrappers: [
      "src/components/advisors/AdvisorDebateView.tsx",
    ],
    status: "MIGRATING",
  },
  {
    id: "dup-sparkline-chart",
    description: "SparklineChart — small inline trend visualization",
    canonical: "src/components/sita/SparklineChart.tsx",
    wrappers: [
      "src/components/business/advisor-board/SparklineChart.tsx",
    ],
    status: "MIGRATING",
  },
];

/**
 * Lookup helper: returns the duplicate family for a given path, if any.
 */
export function findDuplicateFamily(filePath: string): DuplicateFamily | null {
  const normalized = filePath.replace(/\\/g, "/");
  return DUPLICATE_FAMILIES.find(
    f => f.canonical === normalized || f.wrappers.includes(normalized)
  ) ?? null;
}

/**
 * All paths declared as wrappers. Used by check-deprecated-wrappers.ts.
 */
export function allDeclaredWrappers(): string[] {
  return DUPLICATE_FAMILIES.flatMap(f => f.wrappers);
}

/**
 * All canonical paths. Used by check-duplicate-families.ts.
 */
export function allCanonicalPaths(): string[] {
  return DUPLICATE_FAMILIES.map(f => f.canonical);
}
