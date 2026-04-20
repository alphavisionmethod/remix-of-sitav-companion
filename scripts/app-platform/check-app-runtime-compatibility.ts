#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — App Runtime Compatibility Validator (Advisory)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const requiredFiles = [
  "src/lib/app-platform/runtime-boundaries.ts",
  "src/lib/app-platform/runtime.ts",
  "src/lib/app-platform/launch-resolver.ts",
];

for (const f of requiredFiles) {
  if (!fs.existsSync(f)) {
    vc.add(f, "missing-runtime-file", `Runtime compatibility file missing: ${f}`, "warning");
  }
}

// Check runtime compatibility matrix artifact
if (!fs.existsSync("generated/app-lifecycle-closure/runtime-compatibility-matrix.json")) {
  vc.add("generated/app-lifecycle-closure/runtime-compatibility-matrix.json", "missing-artifact", "Runtime compatibility matrix not generated", "warning");
}

const report = {
  gate: "app-runtime-compatibility",
  tier: "Advisory",
  ok: vc.errors.length === 0,
  warnings: vc.warnings.length,
  checkedAt: new Date().toISOString(),
};
writeJsonOutput("generated/app-runtime-compatibility-report.json", report);

vc.report("check-app-runtime-compatibility");
vc.exitIfErrors();