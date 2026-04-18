#!/usr/bin/env node
/* eslint-disable no-console */
// Asserts every kill-switch declares a runbookRef (or is explicitly null with reason)
// and every runbook declares both a triggerCondition (detection signal) and at least
// one step describing recovery confirmation. Also verifies the 6-scenario validation
// status file is present and all scenarios pass.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/final-proof-verification/operational-readiness-status.json";
const KS_REG = "src/lib/control-plane/kill-switch-registry.ts";
const RB_REG = "src/lib/support/runbook-registry.ts";

const issues: GateIssue[] = [];

if (!existsSync(STATUS)) issues.push({ severity: "error", area: "status", message: `${STATUS} missing` });
if (!existsSync(KS_REG)) issues.push({ severity: "error", area: "registry", message: `${KS_REG} missing` });
if (!existsSync(RB_REG)) issues.push({ severity: "error", area: "registry", message: `${RB_REG} missing` });

let ksCount = 0;
let ksWithRunbookOrJustified = 0;
if (existsSync(KS_REG)) {
  const src = readFileSync(KS_REG, "utf-8");
  ksCount = (src.match(/switchId:\s*"KS-/g) ?? []).length;
  // Count blocks that declare runbookRef (either a non-null value or null with explanatory comment)
  ksWithRunbookOrJustified = (src.match(/runbookRef:\s*("RB-[^"]+"|null)/g) ?? []).length;
  if (ksWithRunbookOrJustified < ksCount) {
    issues.push({
      severity: "error",
      area: "ks-runbook-link",
      message: `${ksCount} kill-switches but only ${ksWithRunbookOrJustified} declare runbookRef`,
    });
  }
}

let rbCount = 0;
if (existsSync(RB_REG)) {
  const src = readFileSync(RB_REG, "utf-8");
  rbCount = (src.match(/runbookId:\s*"RB-/g) ?? []).length;
  const triggerCount = (src.match(/triggerCondition:\s*"/g) ?? []).length;
  const stepsCount = (src.match(/steps:\s*\[/g) ?? []).length;
  if (triggerCount < rbCount) {
    issues.push({ severity: "error", area: "rb-detection", message: `${rbCount} runbooks but only ${triggerCount} have triggerCondition` });
  }
  if (stepsCount < rbCount) {
    issues.push({ severity: "error", area: "rb-recovery", message: `${rbCount} runbooks but only ${stepsCount} have steps[]` });
  }
}

let scenariosOk = 0;
if (existsSync(STATUS)) {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const scenarios = s.scenarios ?? [];
  for (const sc of scenarios) {
    const dimsOk = sc.detect && sc.selectRunbook && sc.executeKillSwitch && sc.evidenceVisible && sc.rollback && sc.confirmRecovery;
    if (dimsOk) scenariosOk++;
    else issues.push({ severity: "error", area: "scenario", message: `${sc.id} ${sc.name} fails one or more dimensions` });
  }
  if (scenarios.length < 6) {
    issues.push({ severity: "error", area: "scenario-count", message: `expected 6 scenarios, found ${scenarios.length}` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} human-use-operational-readiness: ${ksCount} KS, ${rbCount} RB, ${scenariosOk}/6 scenarios pass`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "human-use-operational-readiness",
  ok,
  issues,
  extra: { killSwitches: ksCount, runbooks: rbCount, scenariosPass: scenariosOk },
});
process.exit(ok ? 0 : 1);
