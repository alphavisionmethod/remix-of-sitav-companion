#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Tier Coverage Check
// Validates product-reality-tiers.ts has all tiers defined
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const tiersPath = "src/lib/runtime/product-reality-tiers.ts";

if (!fs.existsSync(tiersPath)) {
  vc.add(tiersPath, "missing-tiers", "Product reality tiers file not found");
} else {
  const content = fs.readFileSync(tiersPath, "utf-8");
  const requiredTiers = ["real-executable-substrate", "architectural-simulation-layer", "testing-abstraction", "concept-scaffolding", "standard-app-code"];
  let found = 0;
  for (const tier of requiredTiers) {
    const normalized = tier.replace(/-/g, "[ _-]?");
    if (new RegExp(normalized, "i").test(content)) {
      found++;
    } else {
      vc.add(tiersPath, "missing-tier", `Reality tier "${tier}" not found in tiers registry`, "warning");
    }
  }
  console.log(`  🏗️ ${found}/${requiredTiers.length} reality tiers found`);
}

vc.report("check-runtime-tier-coverage");
vc.exitIfErrors();
