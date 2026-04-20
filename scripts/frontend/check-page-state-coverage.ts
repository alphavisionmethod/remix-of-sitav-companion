#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend Page State Coverage Validator (ADVISORY)
// Cross-references page-state-registry with page-state-contract.
// ═══════════════════════════════════════════════════════════════
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import {
  PAGE_STATE_REGISTRY,
  pageStateCoverageStats,
  findUncoveredStates,
} from "../../src/lib/reality/page-state-registry";

const issues: GateIssue[] = [];
const stats = pageStateCoverageStats();
const uncovered = findUncoveredStates();

// 1. Check registry floor
if (PAGE_STATE_REGISTRY.length < 40) {
  issues.push({ severity: "warning", area: "registry-size", message: `Page state registry has ${PAGE_STATE_REGISTRY.length} entries; expected ≥40` });
}

// 2. Flag uncovered states
for (const u of uncovered) {
  issues.push({ severity: "warning", area: "uncovered-state", message: `${u.route} missing: ${u.missing.join(", ")}` });
}

// 3. Check coverage threshold
if (stats.coveragePct < 90) {
  issues.push({ severity: "warning", area: "coverage-low", message: `Page state coverage is ${stats.coveragePct.toFixed(1)}%; target ≥90%` });
}

const file = emitGateReport({
  gate: "frontend-page-state-coverage",
  ok: true, // advisory only
  issues,
  extra: {
    totalPages: stats.total,
    fullyCovered: stats.fullyCovered,
    partial: stats.partial,
    coveragePct: parseFloat(stats.coveragePct.toFixed(1)),
  },
});

console.log(`Page state coverage: ${stats.fullyCovered}/${stats.total} (${stats.coveragePct.toFixed(1)}%) → ${file}`);