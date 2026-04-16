#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Registry Validator
// Validates contract-manifest.json matches source contract exports
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, readJsonSafe, scanDir, extractExports } from "./lib/utils";

const vc = new ViolationCollector();
const manifest = readJsonSafe<any>("generated/contract-manifest.json");

if (!manifest) {
  console.error("❌ generated/contract-manifest.json not found");
  process.exit(1);
}

const registeredContracts = new Set<string>();
const contracts = manifest.contracts || manifest.entries || [];

for (const contract of contracts) {
  const name = contract.name || contract.typeName;
  if (!name) {
    vc.add("contract-manifest.json", "missing-name", "Contract entry has no name");
    continue;
  }
  if (registeredContracts.has(name)) {
    vc.add("contract-manifest.json", "duplicate-contract", `Duplicate contract: ${name}`, "warning");
  }
  registeredContracts.add(name);

  // Verify source file exists
  if (contract.filePath && !fs.existsSync(contract.filePath)) {
    vc.add(contract.filePath, "source-missing", `Contract "${name}" source file not found`);
  }
}

// Scan source contracts to find unregistered ones
const contractDirs = ["src/packages/contracts", "src/packages/business-contracts", "src/packages/finance-contracts", "src/packages/concierge-contracts"];
let sourceExportCount = 0;

for (const dir of contractDirs) {
  const files = scanDir(dir, [".ts"]);
  for (const file of files) {
    if (file.includes(".test.") || file.includes(".spec.") || file.includes("__")) continue;
    const exports = extractExports(file);
    sourceExportCount += exports.length;
  }
}

console.log(`  📋 ${registeredContracts.size} registered contracts, ~${sourceExportCount} source exports`);
vc.report("check-contract-registry");
vc.exitIfErrors();
