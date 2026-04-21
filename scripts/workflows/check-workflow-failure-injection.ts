#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Workflow Failure Injection Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { WORKFLOW_PROOF_REGISTRY, WORKFLOW_FAMILY_IDS } from "../../src/lib/workflows/workflow-proof-registry";
import { INJECTION_POINTS } from "../../src/lib/workflows/workflow-failure-injection";

const issues: GateIssue[] = [];

for (const id of WORKFLOW_FAMILY_IDS) {
  const family = WORKFLOW_PROOF_REGISTRY[id];
  if (family.deploymentCriticality === "critical" && family.failureInjectionPoints.length === 0) {
    issues.push({ severity: "warning", area: id, message: `${id}: critical family with no failure injection points` });
  }
}

console.log(`  💉 ${INJECTION_POINTS.length} injection points across ${WORKFLOW_FAMILY_IDS.length} families`);

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "workflow-failure-injection", ok, issues });
console.log(`Workflow failure injection: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);