// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Umbrella Evaluator (Phase 8)
// Pure functions that compute the CI umbrella snapshot, resolve
// gates by phase/context, and produce release-readiness signals.
// No I/O, no React, no Supabase.
// ═══════════════════════════════════════════════════════════════

import type {
  CIGateEntry,
  CIPhase,
  CIPhaseSummary,
  CIUmbrellaSnapshot,
  CIGateHealth,
} from "./ci-gate-types";
import { CI_GATE_REGISTRY, CI_PHASE_DISPLAY } from "./ci-gate-registry";
import type { BoundedContextId } from "@/lib/architecture/bounded-context-types";

// ── Indexes ──────────────────────────────────────────────────
const GATES_BY_PHASE = new Map<CIPhase, CIGateEntry[]>();
for (const g of CI_GATE_REGISTRY) {
  const arr = GATES_BY_PHASE.get(g.phase) ?? [];
  arr.push(g);
  GATES_BY_PHASE.set(g.phase, arr);
}

const GATES_BY_CONTEXT = new Map<string, CIGateEntry[]>();
for (const g of CI_GATE_REGISTRY) {
  if (g.boundedContextId) {
    const arr = GATES_BY_CONTEXT.get(g.boundedContextId) ?? [];
    arr.push(g);
    GATES_BY_CONTEXT.set(g.boundedContextId, arr);
  }
}

const GATE_BY_ID = new Map<string, CIGateEntry>(
  CI_GATE_REGISTRY.map((g) => [g.gateId, g])
);

// ── Public API ──────────────────────────────────────────────

export function listAllGates(): readonly CIGateEntry[] {
  return CI_GATE_REGISTRY;
}

export function getGatesByPhase(phase: CIPhase): readonly CIGateEntry[] {
  return GATES_BY_PHASE.get(phase) ?? [];
}

export function getGatesForContext(contextId: BoundedContextId): readonly CIGateEntry[] {
  return GATES_BY_CONTEXT.get(contextId) ?? [];
}

export function resolveGateById(gateId: string): CIGateEntry | undefined {
  return GATE_BY_ID.get(gateId);
}

export function listPhases(): readonly CIPhase[] {
  return Array.from(GATES_BY_PHASE.keys());
}

/** Build per-phase rollup. */
export function buildPhaseSummaries(): readonly CIPhaseSummary[] {
  const out: CIPhaseSummary[] = [];
  for (const [phase, gates] of GATES_BY_PHASE.entries()) {
    const meta = CI_PHASE_DISPLAY[phase] ?? { name: phase, description: "" };
    out.push({
      phase,
      displayName: meta.name,
      description: meta.description,
      totalGates: gates.length,
      blockerGates: gates.filter((g) => g.severity === "blocker").length,
      releaseBlockingGates: gates.filter((g) => g.blocksRelease).length,
      mergeBlockingGates: gates.filter((g) => g.blocksMerge).length,
    });
  }
  // Stable order by phase key
  return out.sort((a, b) => a.phase.localeCompare(b.phase));
}

/** Compute the umbrella snapshot. Pure & deterministic. */
export function computeCIUmbrellaSnapshot(): CIUmbrellaSnapshot {
  const phases = buildPhaseSummaries();
  return {
    capturedAt: new Date().toISOString(),
    totals: {
      gates: CI_GATE_REGISTRY.length,
      blockers: CI_GATE_REGISTRY.filter((g) => g.severity === "blocker").length,
      releaseBlocking: CI_GATE_REGISTRY.filter((g) => g.blocksRelease).length,
      mergeBlocking: CI_GATE_REGISTRY.filter((g) => g.blocksMerge).length,
      phases: phases.length,
    },
    phases,
    gates: CI_GATE_REGISTRY,
  };
}

/**
 * Given a set of currently-failing gate IDs, produce a release readiness
 * signal: { canRelease, blockingGateIds, advisoryGateIds }.
 * Used by the release-gate evaluator and the META control plane.
 */
export function evaluateReleaseReadiness(
  failingGateIds: ReadonlySet<string>
): {
  canRelease: boolean;
  canMerge: boolean;
  blockingReleaseGates: readonly CIGateEntry[];
  blockingMergeGates: readonly CIGateEntry[];
  advisoryFailures: readonly CIGateEntry[];
} {
  const blockingRelease: CIGateEntry[] = [];
  const blockingMerge: CIGateEntry[] = [];
  const advisory: CIGateEntry[] = [];
  for (const id of failingGateIds) {
    const g = GATE_BY_ID.get(id);
    if (!g) continue;
    if (g.blocksRelease) blockingRelease.push(g);
    if (g.blocksMerge) blockingMerge.push(g);
    if (!g.blocksRelease && !g.blocksMerge) advisory.push(g);
  }
  return {
    canRelease: blockingRelease.length === 0,
    canMerge: blockingMerge.length === 0,
    blockingReleaseGates: blockingRelease,
    blockingMergeGates: blockingMerge,
    advisoryFailures: advisory,
  };
}

/** Classify a gate health from a result map. Defaults to "unknown". */
export function classifyGateHealth(
  gateId: string,
  results: ReadonlyMap<string, CIGateHealth>
): CIGateHealth {
  return results.get(gateId) ?? "unknown";
}
