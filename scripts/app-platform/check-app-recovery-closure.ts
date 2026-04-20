#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — App Recovery Closure Validator (Advisory)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const requiredFiles = [
  "src/lib/app-platform/app-recovery-manager.ts",
  "src/lib/app-platform/app-lifecycle-manager.ts",
];

for (const f of requiredFiles) {
  if (!fs.existsSync(f)) {
    vc.add(f, "missing-recovery-file", `Recovery file missing: ${f}`, "warning");
  }
}

// Check recovery manager has required exports
const rmFile = "src/lib/app-platform/app-recovery-manager.ts";
if (fs.existsSync(rmFile)) {
  const content = fs.readFileSync(rmFile, "utf-8");
  for (const fn of ["recordAppCrash", "getRecoveryOffer", "acceptAppRecovery", "declineAppRecovery"]) {
    if (!content.includes(`export function ${fn}`)) {
      vc.add(rmFile, "missing-recovery-fn", `Recovery function missing: ${fn}`, "warning");
    }
  }
}

if (!fs.existsSync("generated/app-lifecycle-closure/recovery-closure.json")) {
  vc.add("generated/app-lifecycle-closure/recovery-closure.json", "missing-artifact", "Recovery closure artifact not generated", "warning");
}

const report = {
  gate: "app-recovery-closure",
  tier: "Advisory",
  ok: vc.errors.length === 0,
  warnings: vc.warnings.length,
  checkedAt: new Date().toISOString(),
};
writeJsonOutput("generated/app-recovery-closure-report.json", report);

vc.report("check-app-recovery-closure");
vc.exitIfErrors();