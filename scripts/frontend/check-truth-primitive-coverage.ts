#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Primitive Coverage Validator (ADVISORY)
// Verifies truth-sensitive routes declare required primitives.
// ═══════════════════════════════════════════════════════════════
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { TRUTH_SURFACE_REGISTRY } from "../../src/lib/frontend/truth-surface-registry";

const issues: GateIssue[] = [];

// 1. Verify registry has expanded entries
if (TRUTH_SURFACE_REGISTRY.length < 15) {
  issues.push({ severity: "warning", area: "registry-size", message: `Truth surface registry has only ${TRUTH_SURFACE_REGISTRY.length} entries; expected ≥15` });
}

// 2. Verify every entry with requiresDisclosure has requiredPrimitives
for (const entry of TRUTH_SURFACE_REGISTRY) {
  if (entry.requiresDisclosure && entry.requiredPrimitives.length === 0) {
    issues.push({ severity: "warning", area: "missing-primitives", message: `${entry.pageId} requires disclosure but has no requiredPrimitives` });
  }
}

// 3. Verify AI-generated surfaces require AITruthDisclosure
for (const entry of TRUTH_SURFACE_REGISTRY) {
  if (entry.disclosureType === "ai-generated" && !entry.requiredPrimitives.includes("AITruthDisclosure")) {
    issues.push({ severity: "warning", area: "ai-disclosure-gap", message: `${entry.pageId} is ai-generated but does not require AITruthDisclosure` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const coveredRoutes = TRUTH_SURFACE_REGISTRY.filter(e => e.requiredPrimitives.length > 0).length;
const totalRoutes = TRUTH_SURFACE_REGISTRY.length;
const coveragePct = totalRoutes > 0 ? ((coveredRoutes / totalRoutes) * 100).toFixed(1) : "0";

const file = emitGateReport({
  gate: "truth-primitive-coverage",
  ok: errorCount === 0,
  issues,
  extra: {
    totalEntries: totalRoutes,
    coveredEntries: coveredRoutes,
    coveragePct: parseFloat(coveragePct),
    entries: TRUTH_SURFACE_REGISTRY.map(e => ({
      pageId: e.pageId,
      route: e.route,
      disclosureType: e.disclosureType,
      requiredPrimitives: e.requiredPrimitives,
    })),
  },
});

console.log(`Truth primitive coverage: ${coveragePct}% (${coveredRoutes}/${totalRoutes}) → ${file}`);