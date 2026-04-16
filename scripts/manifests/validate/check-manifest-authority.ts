#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Authority Check
// Validates that generated manifests have declared source truth
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const generatedDir = "generated";

if (!fs.existsSync(generatedDir)) {
  vc.add(generatedDir, "missing-generated", "Generated directory not found");
} else {
  const jsonFiles = fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"));
  let withVersion = 0;
  let withTimestamp = 0;

  for (const file of jsonFiles) {
    const data = readJsonSafe(`${generatedDir}/${file}`);
    if (!data) continue;
    if (data.version) withVersion++;
    if (data.generatedAt) withTimestamp++;
    if (!data.version && !data.generatedAt) {
      vc.add(file, "no-authority", `Generated file "${file}" has no version or timestamp — cannot verify authority`, "warning");
    }
  }

  console.log(`  📋 ${jsonFiles.length} generated JSON files`);
  console.log(`  🏷️ ${withVersion} with version, ${withTimestamp} with timestamp`);
}

vc.report("check-manifest-authority");
vc.exitIfErrors();
