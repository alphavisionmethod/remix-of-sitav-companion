// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Umbrella Integrity (in-memory)
// Pure validation of registry shape; filesystem check lives in CI script.
// ═══════════════════════════════════════════════════════════════

import { CI_GATE_REGISTRY } from "./ci-gate-registry";
import type { CIUmbrellaIntegrityReport, CIUmbrellaIntegrityIssue } from "./ci-gate-types";

export function validateCIUmbrellaIntegrity(): CIUmbrellaIntegrityReport {
  const issues: CIUmbrellaIntegrityIssue[] = [];
  const seen = new Set<string>();

  for (const g of CI_GATE_REGISTRY) {
    if (seen.has(g.id)) {
      issues.push({ severity: "error", gateId: g.id, message: "Duplicate gate id" });
    }
    seen.add(g.id);

    if (!g.script || !g.script.endsWith(".ts")) {
      issues.push({ severity: "error", gateId: g.id, message: `Invalid script path: ${g.script}` });
    }
    if (!g.title || g.title.length < 4) {
      issues.push({ severity: "warning", gateId: g.id, message: "Title too short" });
    }
    if (!g.description || g.description.length < 10) {
      issues.push({ severity: "warning", gateId: g.id, message: "Description too short" });
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
