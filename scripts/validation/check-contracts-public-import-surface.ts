#!/usr/bin/env node
// SITA OS — Contracts Public Import Surface Check
import * as fs from "fs";
import { ViolationCollector, extractExports } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const barrels = ["src/packages/contracts/index.ts", "src/packages/business-contracts/index.ts", "src/packages/finance-contracts/index.ts", "src/packages/concierge-contracts/index.ts"];
for (const barrel of barrels) {
  if (!fs.existsSync(barrel)) continue;
  const exports = extractExports(barrel);
  if (exports.length === 0) {
    vc.add(barrel, "empty-public-surface", "Contract barrel exports nothing");
  } else {
    console.log(`  📦 ${barrel}: ${exports.length} public exports`);
  }
}
vc.report("check-contracts-public-import-surface");
vc.exitIfErrors();
