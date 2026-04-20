#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — App Lifecycle Coverage Validator (BLOCK gate)
// Checks: state machine coverage, handler existence, proof artifacts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, readJsonSafe, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

// Check state machine file
const smFile = "src/lib/app-platform/app-lifecycle-state-machine.ts";
if (!fs.existsSync(smFile)) {
  vc.add(smFile, "missing-state-machine", "Lifecycle state machine file missing");
} else {
  const content = fs.readFileSync(smFile, "utf-8");
  const requiredStates = ["DISCOVERED", "AVAILABLE", "INSTALLING", "INSTALLED", "RUNNING", "CRASHED", "RECOVERING", "REMOVED"];
  for (const state of requiredStates) {
    if (!content.includes(`"${state}"`)) {
      vc.add(smFile, "missing-state", `Required lifecycle state missing: ${state}`);
    }
  }
  const requiredExports = ["isValidTransition", "getTransition", "validateTransition", "getNextStates"];
  for (const exp of requiredExports) {
    if (!content.includes(`export function ${exp}`)) {
      vc.add(smFile, "missing-export", `Required export missing: ${exp}`);
    }
  }
}

// Check lifecycle manager
const lmFile = "src/lib/app-platform/app-lifecycle-manager.ts";
if (!fs.existsSync(lmFile)) {
  vc.add(lmFile, "missing-lifecycle-manager", "Lifecycle manager file missing");
} else {
  const content = fs.readFileSync(lmFile, "utf-8");
  const requiredMethods = ["discoverApp", "installApp", "launchApp", "removeApp", "detectCrash", "recoverApp"];
  for (const method of requiredMethods) {
    if (!content.includes(method)) {
      vc.add(lmFile, "missing-method", `Required lifecycle method missing: ${method}`);
    }
  }
}

// Check proof artifacts
const proofDir = "generated/app-lifecycle-closure";
const requiredArtifacts = [
  "lifecycle-state-matrix.json",
  "trust-tier-audit.json",
  "permission-enforcement-report.json",
  "recovery-closure.json",
  "runtime-compatibility-matrix.json",
  "supportability-report.json",
  "window-policy-matrix.json",
  "install-state-coverage.json",
  "upgrade-compatibility-report.json",
];
for (const artifact of requiredArtifacts) {
  const p = `${proofDir}/${artifact}`;
  if (!fs.existsSync(p)) {
    vc.add(p, "missing-proof-artifact", `Required proof artifact missing: ${artifact}`, "warning");
  }
}

console.log(`  🔄 ${requiredArtifacts.length} proof artifacts checked`);

const report = {
  gate: "app-lifecycle-coverage",
  tier: "BLOCK",
  ok: vc.errors.length === 0,
  errors: vc.errors.length,
  warnings: vc.warnings.length,
  checkedAt: new Date().toISOString(),
};
writeJsonOutput("generated/app-lifecycle-coverage-report.json", report);

vc.report("check-app-lifecycle-coverage");
vc.exitIfErrors();