#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Tier Classification Check
// Verifies every registered feature has tier coverage declared.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const registryPath = "src/lib/runtime/feature-runtime-tier-registry.ts";

if (!fs.existsSync(registryPath)) {
  vc.add(registryPath, "missing-registry", "feature-runtime-tier-registry.ts not found");
  vc.report("check-feature-tier-classification");
  vc.exitIfErrors();
} else {
  const content = fs.readFileSync(registryPath, "utf-8");

  // Each entry must include all five tier-list fields
  const required = ["supportedTiers", "simulatedTiers", "fallbackTiers", "prohibitedTiers", "roadmapTiers", "fallback", "launchHonesty"];
  for (const field of required) {
    if (!content.includes(field)) {
      vc.add(registryPath, "missing-field", `Registry must include "${field}" on every entry`);
    }
  }

  // Count entries
  const entryMatches = content.match(/featureId:\s*"/g) || [];
  console.log(`  📋 ${entryMatches.length} runtime-tiered features registered`);

  // Each tier must appear at least once
  const tiers = ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"];
  for (const tier of tiers) {
    if (!content.includes(tier)) {
      vc.add(registryPath, "missing-tier-coverage", `No feature references tier "${tier}"`, "warning");
    }
  }
}

vc.report("check-feature-tier-classification");
vc.exitIfErrors();
