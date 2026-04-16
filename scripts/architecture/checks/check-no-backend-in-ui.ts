#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No Backend in UI Check
// Ensures UI pages don't import backend internals directly
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();
const UI_DIRS = ["src/pages", "src/components"];

for (const dir of UI_DIRS) {
  const files = scanDir(dir, [".ts", ".tsx"]);
  for (const file of files) {
    const content = readFileContent(file);
    if (/from\s+["']@\/lib\/core-services\//.test(content)) {
      vc.add(file, "ui-imports-core-services", "UI must not import core-services directly; use services layer", "warning");
    }
  }
}

vc.report("check-no-backend-in-ui");
vc.exitIfErrors();
