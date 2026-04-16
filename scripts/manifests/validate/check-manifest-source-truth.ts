#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Source Truth Check
// Ensures each generated manifest has a corresponding generator
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const generatedDir = "generated";

if (!fs.existsSync(generatedDir)) {
  vc.add(generatedDir, "missing-generated", "Generated directory not found");
} else {
  const jsonFiles = fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"));
  const generators = scanDir("scripts", [".ts"]).filter(f => f.includes("generate-") || f.includes("generate/"));

  const generatorOutputs = new Set<string>();
  // Build a rough mapping of generator names to output files
  for (const gen of generators) {
    const base = gen.split("/").pop()!.replace(/\.ts$/, "").replace("generate-", "");
    generatorOutputs.add(base);
  }

  let orphaned = 0;
  for (const file of jsonFiles) {
    const base = file.replace(".json", "").replace(/-/g, "-");
    // Skip known non-generated files
    if (["script-registry", "script-classification-report"].includes(base)) continue;
    // Very loose match - check if any generator name relates to this output
    const hasGenerator = generators.some(g => {
      const gBase = g.split("/").pop()!.replace(/\.ts$/, "").replace("generate-", "");
      return base.includes(gBase) || gBase.includes(base.split("-").slice(0, 2).join("-"));
    });
    if (!hasGenerator) {
      orphaned++;
      vc.add(file, "orphaned-artifact", `Generated file "${file}" has no identifiable generator script`, "warning");
    }
  }

  console.log(`  📦 ${jsonFiles.length} generated files, ${orphaned} potentially orphaned`);
}

vc.report("check-manifest-source-truth");
vc.exitIfErrors();
