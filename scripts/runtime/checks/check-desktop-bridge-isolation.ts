#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Bridge Isolation Check
// Web pages must not import Electron preload or main modules directly.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, extractImports } from "../../architecture/lib/utils";

const vc = new ViolationCollector();

const FORBIDDEN_IMPORTS = [
  "electron/main",
  "electron/preload",
  "electron/fs-bridge",
  "../../../electron/",
  "../../electron/",
  "../electron/",
];

const pageFiles = scanDir("src/pages", [".tsx", ".ts"]);
const componentFiles = scanDir("src/components", [".tsx", ".ts"]);

let scanned = 0;
let violations = 0;

for (const file of [...pageFiles, ...componentFiles]) {
  scanned++;
  const imports = extractImports(file);
  for (const imp of imports) {
    for (const forbidden of FORBIDDEN_IMPORTS) {
      if (imp.source.includes(forbidden)) {
        violations++;
        vc.add(file, "desktop-bridge-leak", `Imports forbidden Electron module "${imp.source}". Use @/lib/runtime/desktop/electron-bridge-contract instead.`);
      }
    }
  }
}

console.log(`  🔒 ${scanned} files scanned, ${violations} desktop-bridge leaks`);

vc.report("check-desktop-bridge-isolation");
vc.exitIfErrors();
