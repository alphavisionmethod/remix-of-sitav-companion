#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { RESPONSIVE_COHERENCE_MAP } from "../../src/platform/experience/responsive-coherence-map";
import { SHELL_APP_MERGE_RULES } from "../../src/platform/experience/shell-app-merge-grammar";

const issues: GateIssue[] = [];

// Every shell mode should have a responsive coherence entry
const responsiveModes = new Set(RESPONSIVE_COHERENCE_MAP.map(r => r.mode));
for (const rule of SHELL_APP_MERGE_RULES) {
  if (!responsiveModes.has(rule.mode)) {
    issues.push({ severity: "error", area: "missing-mode", message: `Shell mode "${rule.mode}" has no responsive coherence entry` });
  }
}

if (RESPONSIVE_COHERENCE_MAP.length < 4) {
  issues.push({ severity: "warning", area: "mode-count", message: `Expected ≥4 responsive modes, found ${RESPONSIVE_COHERENCE_MAP.length}` });
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "responsive-coherence", ok: errorCount === 0, issues, extra: { modeCount: RESPONSIVE_COHERENCE_MAP.length } });
console.log(`Responsive coherence: ${RESPONSIVE_COHERENCE_MAP.length} modes → ${file}`);