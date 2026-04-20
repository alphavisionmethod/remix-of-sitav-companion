#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Workflow Failure Injection Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

try {
  const { WORKFLOW_PROOF_REGISTRY, WORKFLOW_FAMILY_IDS } = require("../../src/lib/workflows/workflow-proof-registry");
  const { INJECTION_POINTS } = require("../../src/lib/workflows/workflow-failure-injection");

  for (const id of WORKFLOW_FAMILY_IDS) {
    const family = WORKFLOW_PROOF_REGISTRY[id];
    if (family.deploymentCriticality === "critical" && family.failureInjectionPoints.length === 0) {
      issues.push({ severity: "warning", area: id, message: `${id}: critical family with no failure injection points` });
    }
  }

  console.log(`  💉 ${INJECTION_POINTS.length} injection points across ${WORKFLOW_FAMILY_IDS.length} families`);
} catch (e) {
  issues.push({ severity: "error", area: "import", message: `Failed: ${e}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "workflow-failure-injection", ok, issues });
console.log(`Workflow failure injection: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);