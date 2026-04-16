#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Owner Coverage Check
// Validates manifests declare ownership information
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const generatedDir = "generated";

if (!fs.existsSync(generatedDir)) {
  vc.add(generatedDir, "missing", "Generated directory not found");
} else {
  const jsonFiles = fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"));
  let withOwnership = 0;

  for (const file of jsonFiles) {
    const data = readJsonSafe(`${generatedDir}/${file}`);
    if (!data) continue;
    const str = JSON.stringify(data);
    if (str.includes("owner") || str.includes("ownedBy") || str.includes("ownerService") || str.includes("team")) {
      withOwnership++;
    }
  }

  console.log(`  👤 ${withOwnership}/${jsonFiles.length} generated files contain ownership data`);
  if (withOwnership < jsonFiles.length * 0.3) {
    vc.add(generatedDir, "low-ownership-coverage", `Only ${withOwnership}/${jsonFiles.length} manifests contain ownership data`, "warning");
  }
}

vc.report("check-manifest-owner-coverage");
vc.exitIfErrors();
