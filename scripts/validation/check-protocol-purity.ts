#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Protocol Purity Check
// Ensures src/packages/protocols/ imports nothing from src/lib/
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const files = scanDir("src/packages/protocols", [".ts"]);

for (const file of files) {
  if (file.endsWith("index.ts")) continue;
  const content = readFileContent(file);
  if (/from\s+["']@\/lib\//.test(content)) {
    vc.add(file, "protocol-imports-lib", "Protocols must not import from src/lib/", "error");
  }
  if (/from\s+["']@\/pages\//.test(content) || /from\s+["']@\/components\//.test(content)) {
    vc.add(file, "protocol-imports-ui", "Protocols must not import UI code", "error");
  }
}

vc.report("check-protocol-purity");
vc.exitIfErrors();
