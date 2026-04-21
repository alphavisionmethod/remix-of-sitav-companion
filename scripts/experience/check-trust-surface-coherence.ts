#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { TRUST_VISUAL_MAP, TRUST_VISUAL_COUNT } from "../../src/platform/experience/trust-visual-grammar";

const issues: GateIssue[] = [];
const EXPECTED_LEVELS = 6;

if (TRUST_VISUAL_COUNT !== EXPECTED_LEVELS) {
  issues.push({ severity: "error", area: "trust-count", message: `Expected ${EXPECTED_LEVELS} trust level mappings, found ${TRUST_VISUAL_COUNT}` });
}

for (const [level, mapping] of Object.entries(TRUST_VISUAL_MAP)) {
  if (!mapping.canonicalComponentRef) issues.push({ severity: "warning", area: "missing-component", message: `Trust level "${level}" has no canonical component ref` });
  if (!mapping.badgeIntent) issues.push({ severity: "error", area: "missing-intent", message: `Trust level "${level}" has no badge intent` });
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "trust-surface-coherence", ok: errorCount === 0, issues, extra: { trustLevelCount: TRUST_VISUAL_COUNT } });
console.log(`Trust surface coherence: ${TRUST_VISUAL_COUNT}/${EXPECTED_LEVELS} levels mapped → ${file}`);