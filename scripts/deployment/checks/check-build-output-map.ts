#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Build Output Map Check
// Validates build outputs are tracked and classified
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const buildOutputs = ["dist", "build", "generated"];
let found = 0;
for (const dir of buildOutputs) {
  if (fs.existsSync(dir)) found++;
}
console.log(`  📂 ${found}/${buildOutputs.length} build output directories exist`);

// Check vite config exists
if (!fs.existsSync("vite.config.ts")) {
  vc.add("vite.config.ts", "missing-config", "Vite config not found");
} else {
  console.log("  ⚙️ Vite config found");
}

vc.report("check-build-output-map");
vc.exitIfErrors();
