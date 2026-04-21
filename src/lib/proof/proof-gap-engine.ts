// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Gap Engine
// Detects missing proof coverage per subsystem per category.
// ═══════════════════════════════════════════════════════════════

import { PROOF_CATEGORIES, type HardProofCategory } from "./proof-category-model";
import { SYSTEM_PROOF_REGISTRY, type SubsystemId, type ProofStatus } from "./system-proof-registry";

export interface ProofGap {
  readonly subsystem: SubsystemId;
  readonly category: HardProofCategory;
  readonly status: ProofStatus;
  readonly severity: "BLOCK" | "ADVISORY";
  readonly notes?: string;
}

export interface ProofGapSummary {
  readonly totalGaps: number;
  readonly blockingGaps: number;
  readonly advisoryGaps: number;
  readonly gaps: readonly ProofGap[];
  readonly subsystemsWithBlockers: readonly SubsystemId[];
}

export function detectProofGaps(): ProofGapSummary {
  const gaps: ProofGap[] = [];

  for (const entry of SYSTEM_PROOF_REGISTRY) {
    if (entry.status === "present") continue;

    const catDef = PROOF_CATEGORIES.find((c) => c.category === entry.category);
    const severity: "BLOCK" | "ADVISORY" =
      entry.status === "missing" && catDef?.blockerIfMissing ? "BLOCK" : "ADVISORY";

    gaps.push({
      subsystem: entry.subsystem,
      category: entry.category,
      status: entry.status,
      severity,
      notes: entry.notes,
    });
  }

  const blockingGaps = gaps.filter((g) => g.severity === "BLOCK");
  const subsystemsWithBlockers = [...new Set(blockingGaps.map((g) => g.subsystem))];

  return {
    totalGaps: gaps.length,
    blockingGaps: blockingGaps.length,
    advisoryGaps: gaps.length - blockingGaps.length,
    gaps,
    subsystemsWithBlockers,
  };
}