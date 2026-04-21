#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Workflow Rollback Coverage Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { WORKFLOW_FAMILY_IDS } from "../../src/lib/workflows/workflow-proof-registry";
import { WORKFLOW_ROLLBACK_MAP } from "../../src/lib/workflows/workflow-rollback-map";

const issues: GateIssue[] = [];

for (const id of WORKFLOW_FAMILY_IDS) {
  const entry = WORKFLOW_ROLLBACK_MAP[id];
  if (!entry) {
    issues.push({ severity: "warning", area: id, message: `${id}: no rollback entry` });
    continue;
  }
  if (entry.reversibleSteps.length === 0 && entry.irreversibleSteps.length === 0) {
    issues.push({ severity: "warning", area: id, message: `${id}: no step reversibility declared` });
  }
}

const total = Object.values(WORKFLOW_ROLLBACK_MAP).reduce((a: number, e: any) => a + e.reversibleSteps.length, 0);
console.log(`  ↩️  ${total} reversible steps across ${WORKFLOW_FAMILY_IDS.length} families`);

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "workflow-rollback-coverage", ok, issues });
console.log(`Workflow rollback coverage: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);