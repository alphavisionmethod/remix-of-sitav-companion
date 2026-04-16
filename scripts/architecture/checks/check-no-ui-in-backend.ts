#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No UI in Backend Check
// Ensures backend services don't import React/UI components
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const BACKEND_DIRS = ["src/lib/services", "src/lib/core-services"];

for (const dir of BACKEND_DIRS) {
  const files = scanDir(dir, [".ts"]);
  for (const file of files) {
    const content = readFileContent(file);
    if (/from\s+["']react["']/.test(content) || /from\s+["']@\/components\//.test(content)) {
      vc.add(file, "backend-imports-ui", "Backend services must not import React or UI components", "error");
    }
    if (/from\s+["']@\/pages\//.test(content)) {
      vc.add(file, "backend-imports-pages", "Backend services must not import pages", "error");
    }
  }
}

vc.report("check-no-ui-in-backend");
vc.exitIfErrors();
