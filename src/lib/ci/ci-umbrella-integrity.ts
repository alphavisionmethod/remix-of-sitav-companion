// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Umbrella Integrity Validator (Phase 8)
// Pure validator that confirms the CI gate registry is internally
// coherent. Used by both the in-app surface and the CI gate
// `check-ci-umbrella-integrity.ts`.
// ═══════════════════════════════════════════════════════════════

import { CI_GATE_REGISTRY } from "./ci-gate-registry";
import { BOUNDED_CONTEXT_REGISTRY } from "@/lib/architecture/bounded-context-registry";
import type {
  CIGateIntegrityIssue,
  CIGateIntegrityReport,
} from "./ci-gate-types";

const CONTEXT_IDS = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));

/**
 * Validate the CI gate registry.
 * @param scriptExists Optional async-free predicate for script existence
 *                     (provided by the Node-side checker so this module
 *                     can stay browser-safe).
 */
export function validateCIUmbrellaIntegrity(
  scriptExists?: (path: string) => boolean
): CIGateIntegrityReport {
  const issues: CIGateIntegrityIssue[] = [];

  // 1. Duplicate IDs
  const seen = new Set<string>();
  for (const g of CI_GATE_REGISTRY) {
    if (seen.has(g.gateId)) {
      issues.push({
        severity: "error",
        gateId: g.gateId,
        kind: "duplicate-id",
        message: `Duplicate gate id "${g.gateId}"`,
      });
    }
    seen.add(g.gateId);
  }

  // 2. Bounded context references resolve
  for (const g of CI_GATE_REGISTRY) {
    if (g.boundedContextId && !CONTEXT_IDS.has(g.boundedContextId as any)) {
      issues.push({
        severity: "error",
        gateId: g.gateId,
        kind: "unknown-context",
        message: `Gate "${g.gateId}" references unknown bounded context "${g.boundedContextId}"`,
      });
    }
  }

  // 3. Script existence (optional, Node-only)
  if (scriptExists) {
    for (const g of CI_GATE_REGISTRY) {
      if (!scriptExists(g.scriptPath)) {
        issues.push({
          severity: "error",
          gateId: g.gateId,
          kind: "missing-script",
          message: `Script not found: ${g.scriptPath}`,
        });
      }
    }
  }

  // 4. Phase coherence — release-gate triggers should not block merge
  for (const g of CI_GATE_REGISTRY) {
    if (g.trigger === "release-gate" && g.blocksMerge) {
      issues.push({
        severity: "warning",
        gateId: g.gateId,
        kind: "phase-mismatch",
        message: `Gate "${g.gateId}" is release-gate but also blocks merge — confirm intent`,
      });
    }
    if (g.trigger === "manual" && (g.blocksRelease || g.blocksMerge)) {
      issues.push({
        severity: "warning",
        gateId: g.gateId,
        kind: "phase-mismatch",
        message: `Manual-trigger gate "${g.gateId}" is marked as blocking — confirm automation`,
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    checkedAt: new Date().toISOString(),
    gateCount: CI_GATE_REGISTRY.length,
    issues,
    errorCount,
    warningCount,
    ok: errorCount === 0,
  };
}
