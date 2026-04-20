#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Layout Grammar Coverage Validator (ADVISORY)
// Verifies pages comply with canonical shell/layout patterns.
// ═══════════════════════════════════════════════════════════════
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { LAYOUT_GRAMMAR_MAP, LAYOUT_PATTERN_COUNT } from "../../src/lib/frontend/layout-grammar-map";
import { PAGE_SHELL_COMPLIANCE_MAP, COMPLIANCE_ENTRY_COUNT } from "../../src/lib/frontend/page-shell-compliance-map";

const issues: GateIssue[] = [];

// 1. Verify layout grammar has all patterns
if (LAYOUT_PATTERN_COUNT < 10) {
  issues.push({ severity: "warning", area: "grammar-size", message: `Layout grammar has ${LAYOUT_PATTERN_COUNT} patterns; expected ≥10` });
}

// 2. Verify shell compliance map has enough entries
if (COMPLIANCE_ENTRY_COUNT < 25) {
  issues.push({ severity: "warning", area: "compliance-size", message: `Shell compliance map has ${COMPLIANCE_ENTRY_COUNT} entries; expected ≥25` });
}

// 3. Verify all compliance entries reference valid layout patterns
const validPatterns = new Set(LAYOUT_GRAMMAR_MAP.map(l => l.patternId));
for (const entry of PAGE_SHELL_COMPLIANCE_MAP) {
  if (!validPatterns.has(entry.requiredLayout)) {
    issues.push({ severity: "error", area: "invalid-pattern", message: `Route "${entry.routePrefix}" references unknown layout pattern "${entry.requiredLayout}"` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({
  gate: "layout-grammar-coverage",
  ok: errorCount === 0,
  issues,
  extra: {
    layoutPatterns: LAYOUT_PATTERN_COUNT,
    complianceEntries: COMPLIANCE_ENTRY_COUNT,
    patterns: LAYOUT_GRAMMAR_MAP.map(l => ({ id: l.patternId, shell: l.shellComponent, nav: l.navRole })),
  },
});

console.log(`Layout grammar: ${LAYOUT_PATTERN_COUNT} patterns, ${COMPLIANCE_ENTRY_COUNT} route mappings → ${file}`);