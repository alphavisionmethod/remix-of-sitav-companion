#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — App Supportability Validator (Advisory)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const requiredFiles = [
  "src/lib/app-platform/app-support-bundle.ts",
  "src/lib/app-platform/app-observability.ts",
];

for (const f of requiredFiles) {
  if (!fs.existsSync(f)) {
    vc.add(f, "missing-support-file", `Supportability file missing: ${f}`, "warning");
  }
}

// Check support bundle has required exports
const sbFile = "src/lib/app-platform/app-support-bundle.ts";
if (fs.existsSync(sbFile)) {
  const content = fs.readFileSync(sbFile, "utf-8");
  for (const fn of ["generateBundle", "generateSystemBundle"]) {
    if (!content.includes(`export function ${fn}`)) {
      vc.add(sbFile, "missing-support-fn", `Support function missing: ${fn}`, "warning");
    }
  }
}

if (!fs.existsSync("generated/app-lifecycle-closure/supportability-report.json")) {
  vc.add("generated/app-lifecycle-closure/supportability-report.json", "missing-artifact", "Supportability report not generated", "warning");
}

const report = {
  gate: "app-supportability",
  tier: "Advisory",
  ok: vc.errors.length === 0,
  warnings: vc.warnings.length,
  checkedAt: new Date().toISOString(),
};
writeJsonOutput("generated/app-supportability-report.json", report);

vc.report("check-app-supportability");
vc.exitIfErrors();