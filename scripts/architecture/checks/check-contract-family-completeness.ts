#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Family Completeness Check
// Validates every contract family/package has barrel export & types
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDirShallow, extractExports } from "./lib/utils";

const vc = new ViolationCollector();
const CONTRACT_DIRS = ["src/packages/contracts", "src/packages/business-contracts", "src/packages/finance-contracts", "src/packages/concierge-contracts"];

for (const contractDir of CONTRACT_DIRS) {
  if (!fs.existsSync(contractDir)) continue;

  // Check barrel export exists
  const barrelPath = path.join(contractDir, "index.ts");
  if (!fs.existsSync(barrelPath)) {
    vc.add(contractDir, "missing-barrel", `No index.ts barrel export found`);
    continue;
  }

  const exports = extractExports(barrelPath);
  if (exports.length === 0) {
    vc.add(barrelPath, "empty-barrel", `Barrel export has no exports`);
  }

  // Check sub-modules have barrel exports
  const subDirs = scanDirShallow(contractDir);
  for (const sub of subDirs) {
    if (sub.startsWith("_") || sub === "node_modules" || sub === "lib") continue;
    const subBarrel = path.join(contractDir, sub, "index.ts");
    if (fs.existsSync(subBarrel)) {
      const subExports = extractExports(subBarrel);
      if (subExports.length === 0) {
        vc.add(subBarrel, "empty-sub-barrel", `Sub-module barrel has no exports`, "warning");
      }
    }
  }

  // Check re-exports from barrel cover sub-modules
  const barrelContent = fs.readFileSync(barrelPath, "utf-8");
  for (const sub of subDirs) {
    if (sub.startsWith("_") || sub === "node_modules" || sub === "lib") continue;
    const subBarrel = path.join(contractDir, sub, "index.ts");
    if (fs.existsSync(subBarrel)) {
      const reExportPattern = new RegExp(`from\\s+["']./${sub}["']|from\\s+["']./${sub}/`);
      if (!reExportPattern.test(barrelContent)) {
        vc.add(barrelPath, "missing-re-export", `Barrel does not re-export sub-module: ${sub}`, "warning");
      }
    }
  }
}

vc.report("check-contract-family-completeness");
vc.exitIfErrors();
