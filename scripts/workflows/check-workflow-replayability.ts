#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Workflow Replayability Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

try {
  const { WORKFLOW_FAMILY_IDS } = require("../../src/lib/workflows/workflow-proof-registry");
  const { REPLAY_DECLARATIONS } = require("../../src/lib/workflows/workflow-replay-engine");

  for (const id of WORKFLOW_FAMILY_IDS) {
    const decl = REPLAY_DECLARATIONS[id];
    if (!decl) {
      issues.push({ severity: "warning", area: id, message: `${id}: no replay declaration` });
      continue;
    }
    if (decl.replayable && decl.replaySafetyRules.length === 0) {
      issues.push({ severity: "warning", area: id, message: `${id}: replayable but no safety rules` });
    }
  }

  const replayable = Object.values(REPLAY_DECLARATIONS).filter((d: any) => d.replayable).length;
  console.log(`  🔄 ${replayable}/${WORKFLOW_FAMILY_IDS.length} families replayable`);
} catch (e) {
  issues.push({ severity: "error", area: "import", message: `Failed: ${e}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "workflow-replayability", ok, issues });
console.log(`Workflow replayability: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);