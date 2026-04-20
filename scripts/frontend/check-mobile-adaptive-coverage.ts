#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Adaptive Coverage Validator (ADVISORY)
// Verifies adaptive rules exist for all layout patterns.
// ═══════════════════════════════════════════════════════════════
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { LAYOUT_GRAMMAR_MAP } from "../../src/lib/frontend/layout-grammar-map";
import { MOBILE_ADAPTIVE_RULES } from "../../src/lib/frontend/mobile-adaptive-policy";

const issues: GateIssue[] = [];

// 1. Every layout pattern must have a mobile adaptive rule
const rulePatterns = new Set(MOBILE_ADAPTIVE_RULES.map(r => r.layoutPattern));
for (const layout of LAYOUT_GRAMMAR_MAP) {
  if (!rulePatterns.has(layout.patternId)) {
    issues.push({ severity: "warning", area: "missing-rule", message: `Layout "${layout.patternId}" has no mobile adaptive rule` });
  }
}

// 2. All rules must reference valid layout patterns
const validPatterns = new Set(LAYOUT_GRAMMAR_MAP.map(l => l.patternId));
for (const rule of MOBILE_ADAPTIVE_RULES) {
  if (!validPatterns.has(rule.layoutPattern)) {
    issues.push({ severity: "error", area: "invalid-pattern", message: `Adaptive rule references unknown layout "${rule.layoutPattern}"` });
  }
}

const coverage = LAYOUT_GRAMMAR_MAP.length > 0
  ? ((rulePatterns.size / LAYOUT_GRAMMAR_MAP.length) * 100).toFixed(1)
  : "0";

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({
  gate: "mobile-adaptive-coverage",
  ok: errorCount === 0,
  issues,
  extra: {
    layoutPatterns: LAYOUT_GRAMMAR_MAP.length,
    adaptiveRules: MOBILE_ADAPTIVE_RULES.length,
    coveragePct: parseFloat(coverage),
  },
});

console.log(`Mobile adaptive coverage: ${coverage}% (${MOBILE_ADAPTIVE_RULES.length}/${LAYOUT_GRAMMAR_MAP.length}) → ${file}`);