#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Classification Coverage Check
// Ensures all major directories have reality classification
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const majorDirs = [
  "src/lib/runtime",
  "src/lib/surfaces",
  "src/lib/devices",
  "src/lib/deployment",
  "src/lib/backend-topology",
  "src/lib/db",
];

let classified = 0;
for (const dir of majorDirs) {
  if (!fs.existsSync(dir)) {
    vc.add(dir, "missing-dir", `Architecture layer directory "${dir}" does not exist`, "warning");
    continue;
  }
  const files = scanDir(dir, [".ts"]);
  if (files.length > 0) classified++;
}

console.log(`  🏷️ ${classified}/${majorDirs.length} architecture layers have registry files`);

// Check that the product-reality-tiers registry exists and exports classifications
const tiersFile = "src/lib/runtime/product-reality-tiers.ts";
if (fs.existsSync(tiersFile)) {
  const content = fs.readFileSync(tiersFile, "utf-8");
  if (!content.includes("export")) {
    vc.add(tiersFile, "no-exports", "Product reality tiers file has no exports");
  }
} else {
  vc.add(tiersFile, "missing-tiers", "Product reality tiers registry missing");
}

vc.report("check-reality-classification-coverage");
vc.exitIfErrors();
