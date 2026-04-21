#!/usr/bin/env node
// SITA OS — App Lifecycle Coverage Validator (BLOCK)
// Verifies app lifecycle manager covers install, update, uninstall, launch states.
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/app-platform/app-lifecycle-manager.ts";

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "App lifecycle manager not found");
} else {
  const content = readFileSync(SRC, "utf-8");
  const requiredStates = ["install", "uninstall", "update", "launch"];
  const missing = requiredStates.filter(s => !content.toLowerCase().includes(s));
  if (missing.length > 0) {
    vc.add(SRC, "missing-states", `Lifecycle manager missing states: ${missing.join(", ")}`);
  }
}

writeJsonOutput("generated/app-lifecycle-coverage-report.json", {
  generatedAt: new Date().toISOString(), gate: "app-lifecycle-coverage", ok: vc.errors.length === 0,
  errorCount: vc.errors.length, warningCount: vc.warnings.length, issues: vc.violations,
});

vc.report("check-app-lifecycle-coverage");
vc.exitIfErrors();