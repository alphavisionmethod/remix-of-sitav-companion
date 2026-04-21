#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Workflow Proof Closure Validator (BLOCK)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { WORKFLOW_PROOF_REGISTRY, WORKFLOW_FAMILY_IDS } from "../../src/lib/workflows/workflow-proof-registry";
import { WORKFLOW_STEP_CONTRACTS } from "../../src/lib/workflows/workflow-step-contracts";
import { REPLAY_DECLARATIONS } from "../../src/lib/workflows/workflow-replay-engine";
import { WORKFLOW_ROLLBACK_MAP } from "../../src/lib/workflows/workflow-rollback-map";
import { INJECTION_POINTS } from "../../src/lib/workflows/workflow-failure-injection";

const issues: GateIssue[] = [];

if (WORKFLOW_FAMILY_IDS.length < 12) {
  issues.push({ severity: "error", area: "registry", message: `Only ${WORKFLOW_FAMILY_IDS.length}/12 workflow families registered` });
}

for (const id of WORKFLOW_FAMILY_IDS) {
  const family = WORKFLOW_PROOF_REGISTRY[id];
  if (!family.owner) issues.push({ severity: "error", area: id, message: `${id}: missing owner` });
  if (!family.stepIds.length) issues.push({ severity: "error", area: id, message: `${id}: no steps declared` });
  if (!family.evidenceSources.length) issues.push({ severity: "error", area: id, message: `${id}: no evidence sources` });

  const contracts = WORKFLOW_STEP_CONTRACTS.filter((s: any) => s.familyId === id);
  if (contracts.length < family.stepIds.length) {
    issues.push({ severity: "warning", area: id, message: `${id}: ${contracts.length}/${family.stepIds.length} steps contracted` });
  }

  if (!REPLAY_DECLARATIONS[id]) {
    issues.push({ severity: "warning", area: id, message: `${id}: no replay declaration` });
  }
  if (!WORKFLOW_ROLLBACK_MAP[id]) {
    issues.push({ severity: "warning", area: id, message: `${id}: no rollback entry` });
  }
}

const totalContracts = WORKFLOW_STEP_CONTRACTS.length;
const totalInjection = INJECTION_POINTS.length;
console.log(`  📋 ${WORKFLOW_FAMILY_IDS.length} families, ${totalContracts} step contracts, ${totalInjection} injection points`);

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "workflow-proof-closure", ok, issues });
console.log(`Workflow proof closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);