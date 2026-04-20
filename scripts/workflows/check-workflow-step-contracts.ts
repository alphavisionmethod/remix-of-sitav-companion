#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Workflow Step Contracts Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

try {
  const { WORKFLOW_PROOF_REGISTRY, WORKFLOW_FAMILY_IDS } = require("../../src/lib/workflows/workflow-proof-registry");
  const { WORKFLOW_STEP_CONTRACTS } = require("../../src/lib/workflows/workflow-step-contracts");

  for (const id of WORKFLOW_FAMILY_IDS) {
    const family = WORKFLOW_PROOF_REGISTRY[id];
    for (const stepId of family.stepIds) {
      const contract = WORKFLOW_STEP_CONTRACTS.find((s: any) => s.stepId === stepId);
      if (!contract) {
        issues.push({ severity: "warning", area: id, message: `${stepId}: missing step contract` });
      }
    }
  }

  console.log(`  📋 ${WORKFLOW_STEP_CONTRACTS.length} step contracts validated`);
} catch (e) {
  issues.push({ severity: "error", area: "import", message: `Failed to import: ${e}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "workflow-step-contracts", ok, issues });
console.log(`Workflow step contracts: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);