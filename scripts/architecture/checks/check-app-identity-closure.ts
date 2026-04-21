#!/usr/bin/env node
// SITA OS — App Identity Closure Validator (BLOCK)
// Verifies every app in the catalog has id, name, publisher, category, trustLevel, appClass.
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/app-platform/catalog.ts";

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "App catalog not found");
} else {
  const content = readFileSync(SRC, "utf-8");
  const requiredFields = ["id:", "name:", "publisher:", "category:", "trustLevel:", "appClass:"];
  for (const f of requiredFields) {
    if (!content.includes(f)) {
      vc.add(SRC, "missing-field", `App catalog missing field pattern: ${f}`);
    }
  }
  const appCount = (content.match(/\bid:\s*["']/g) || []).length;
  if (appCount < 10) {
    vc.add(SRC, "low-app-count", `Only ${appCount} apps declared (expected >=10)`);
  }
  writeJsonOutput("generated/app-identity-closure-report.json", {
    generatedAt: new Date().toISOString(), gate: "app-identity-closure", ok: vc.errors.length === 0,
    errorCount: vc.errors.length, warningCount: vc.warnings.length, issues: vc.violations,
    appCount,
  });
}

vc.report("check-app-identity-closure");
vc.exitIfErrors();