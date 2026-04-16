#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No Runtime in Shared Check
// Ensures src/packages/ files are pure types with no runtime imports
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const PACKAGE_DIRS = [
  "src/packages/protocols",
  "src/packages/release-contracts",
  "src/packages/graph-contracts",
  "src/packages/ai-contracts",
  "src/packages/simulation-contracts",
];

for (const dir of PACKAGE_DIRS) {
  const files = scanDir(dir, [".ts"]);
  for (const file of files) {
    if (file.endsWith("index.ts")) continue;
    const content = readFileContent(file);
    if (/from\s+["']@\/lib\//.test(content)) {
      vc.add(file, "shared-imports-runtime", "Shared packages must not import from src/lib/", "error");
    }
    if (/from\s+["']react/.test(content)) {
      vc.add(file, "shared-imports-react", "Shared packages must not import React", "error");
    }
    if (/from\s+["']@\/integrations\//.test(content)) {
      vc.add(file, "shared-imports-integration", "Shared packages must not import integrations", "error");
    }
    if (/from\s+["']@\/components\//.test(content)) {
      vc.add(file, "shared-imports-ui", "Shared packages must not import UI components", "error");
    }
    if (/from\s+["']@\/pages\//.test(content)) {
      vc.add(file, "shared-imports-pages", "Shared packages must not import pages", "error");
    }
  }
}

vc.report("check-no-runtime-in-shared");
vc.exitIfErrors();
