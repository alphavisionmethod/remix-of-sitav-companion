#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Capability Matrix Check
// Validates runtime-capability-matrix.ts completeness
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";

if (!fs.existsSync(matrixPath)) {
  vc.add(matrixPath, "missing-matrix", "Runtime capability matrix file not found");
} else {
  const content = fs.readFileSync(matrixPath, "utf-8");
  const requiredRuntimes = ["web", "desktop", "mobilePwa", "appliance"];
  for (const rt of requiredRuntimes) {
    if (!content.includes(rt)) {
      vc.add(matrixPath, "missing-runtime", `Runtime "${rt}" not found in capability matrix`, "warning");
    }
  }
  const capabilityCount = (content.match(/capabilityId/g) || []).length;
  console.log(`  🔧 ${capabilityCount} capability entries found in matrix`);
  console.log(`  ℹ  Phase 2: also run check-runtime-capability-completeness.ts for 8-surface feature coverage`);
}

// Check generated artifact exists
const generatedMatrix = readJsonSafe("generated/runtime-capability-matrix.json");
if (!generatedMatrix) {
  vc.add("generated/runtime-capability-matrix.json", "missing-generated", "Generated runtime capability matrix not found — run generate-runtime-capability-matrix", "warning");
}

vc.report("check-runtime-capability-matrix");
vc.exitIfErrors();
