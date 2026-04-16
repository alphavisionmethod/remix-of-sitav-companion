#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Runtime Contract Check
// Validates Electron/desktop runtime requirements
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

// Check electron main entry exists
const electronMain = "electron/main.cjs";
if (!fs.existsSync(electronMain)) {
  vc.add(electronMain, "missing-electron-main", "Electron main entry not found", "warning");
} else {
  console.log("  🖥️ Electron main entry found");
}

// Check desktop build scripts exist
const desktopBuildScripts = [
  "scripts/release/build-electron.sh",
  "scripts/release/desktop",
];
let found = 0;
for (const s of desktopBuildScripts) {
  if (fs.existsSync(s)) found++;
}
console.log(`  📦 ${found}/${desktopBuildScripts.length} desktop build artifacts found`);

// Check runtime capability matrix references desktop
const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";
if (fs.existsSync(matrixPath)) {
  const content = fs.readFileSync(matrixPath, "utf-8");
  if (!content.includes("desktop")) {
    vc.add(matrixPath, "no-desktop-in-matrix", "Desktop runtime not referenced in capability matrix", "warning");
  }
}

// Check package.json has electron main
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
if (!pkg.main || !pkg.main.includes("electron")) {
  vc.add("package.json", "no-electron-main", "package.json missing electron main entry", "warning");
}

vc.report("check-desktop-runtime-contract");
vc.exitIfErrors();
