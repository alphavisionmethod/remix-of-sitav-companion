#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Protocol & Contract Purity Check
// Ensures all contract packages import nothing from src/lib/ or UI
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const CONTRACT_DIRS = [
  "src/packages/protocols",
  "src/packages/release-contracts",
  "src/packages/graph-contracts",
  "src/packages/ai-contracts",
  "src/packages/simulation-contracts",
];

for (const dir of CONTRACT_DIRS) {
  const files = scanDir(dir, [".ts"]);
  for (const file of files) {
    if (file.endsWith("index.ts")) continue;
    const content = readFileContent(file);
    if (/from\s+["']@\/lib\//.test(content)) {
      vc.add(file, "contract-imports-lib", `Contract packages must not import from src/lib/ (${dir})`, "error");
    }
    if (/from\s+["']@\/pages\//.test(content) || /from\s+["']@\/components\//.test(content)) {
      vc.add(file, "contract-imports-ui", `Contract packages must not import UI code (${dir})`, "error");
    }
    if (/from\s+["']@\/integrations\//.test(content)) {
      vc.add(file, "contract-imports-integration", `Contract packages must not import integrations (${dir})`, "error");
    }
    if (/from\s+["']@\/hooks\//.test(content)) {
      vc.add(file, "contract-imports-hooks", `Contract packages must not import hooks (${dir})`, "error");
    }
  }
}

vc.report("check-protocol-purity");
vc.exitIfErrors();
