#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { STATE_VISUAL_MAP, STATE_VISUAL_COUNT } from "../../src/platform/experience/state-visual-grammar";

const issues: GateIssue[] = [];
const EXPECTED_STATES = 13;

if (STATE_VISUAL_COUNT !== EXPECTED_STATES) {
  issues.push({ severity: "error", area: "state-count", message: `Expected ${EXPECTED_STATES} state mappings, found ${STATE_VISUAL_COUNT}` });
}

for (const [state, mapping] of Object.entries(STATE_VISUAL_MAP)) {
  if (!mapping.canonicalComponentRef) issues.push({ severity: "warning", area: "missing-component", message: `State "${state}" has no canonical component ref` });
  if (!mapping.iconRef) issues.push({ severity: "warning", area: "missing-icon", message: `State "${state}" has no icon ref` });
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "state-visual-coherence", ok: errorCount === 0, issues, extra: { stateCount: STATE_VISUAL_COUNT } });
console.log(`State visual coherence: ${STATE_VISUAL_COUNT}/${EXPECTED_STATES} states mapped → ${file}`);