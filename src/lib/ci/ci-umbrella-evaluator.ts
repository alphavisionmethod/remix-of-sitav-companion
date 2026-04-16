// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Umbrella Evaluator
// Aggregates per-gate evaluation status into release-readiness signal.
// ═══════════════════════════════════════════════════════════════

import { CI_GATE_REGISTRY } from "./ci-gate-registry";
import type { CIGateEntry, CIGateEvaluation } from "./ci-gate-types";

export interface ReleaseReadiness {
  readonly evaluatedAt: string;
  readonly totalGates: number;
  readonly blockerGates: number;
  readonly passing: number;
  readonly failing: number;
  readonly skipped: number;
  readonly unknown: number;
  readonly readyToRelease: boolean;
  readonly failingBlockers: readonly string[];
}

export function evaluateReleaseReadiness(
  evaluations: readonly CIGateEvaluation[],
): ReleaseReadiness {
  const map = new Map(evaluations.map((e) => [e.gateId, e]));
  let passing = 0;
  let failing = 0;
  let skipped = 0;
  let unknown = 0;
  const failingBlockers: string[] = [];

  for (const gate of CI_GATE_REGISTRY) {
    const ev = map.get(gate.id);
    if (!ev) {
      unknown++;
      if (gate.severity === "blocker") failingBlockers.push(gate.id);
      continue;
    }
    switch (ev.status) {
      case "pass": passing++; break;
      case "fail":
        failing++;
        if (gate.severity === "blocker") failingBlockers.push(gate.id);
        break;
      case "skip": skipped++; break;
      case "unknown":
        unknown++;
        if (gate.severity === "blocker") failingBlockers.push(gate.id);
        break;
    }
  }

  return {
    evaluatedAt: new Date().toISOString(),
    totalGates: CI_GATE_REGISTRY.length,
    blockerGates: CI_GATE_REGISTRY.filter((g) => g.severity === "blocker").length,
    passing,
    failing,
    skipped,
    unknown,
    readyToRelease: failingBlockers.length === 0,
    failingBlockers,
  };
}

export function gatesPendingEvaluation(
  evaluations: readonly CIGateEvaluation[],
): readonly CIGateEntry[] {
  const seen = new Set(evaluations.map((e) => e.gateId));
  return CI_GATE_REGISTRY.filter((g) => !seen.has(g.id));
}
