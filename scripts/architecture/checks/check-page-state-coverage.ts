/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Page State Coverage (Phase 9)
// Asserts every registered page declares the loading/empty/error/
// degraded states required for its class.
// ═══════════════════════════════════════════════════════════════

import { existsSync } from "node:fs";
import {
  PAGE_STATE_REGISTRY,
  PAGE_STATE_REGISTRY_FLOOR,
  findUncoveredStates,
  pageStateCoverageStats,
} from "../../../src/lib/reality/page-state-registry";

const issues: string[] = [];

// 0. Floor: enough critical+admin pages registered
if (PAGE_STATE_REGISTRY.length < PAGE_STATE_REGISTRY_FLOOR) {
  issues.push(
    `Page state registry has only ${PAGE_STATE_REGISTRY.length} entries; floor is ${PAGE_STATE_REGISTRY_FLOOR}.`,
  );
}

// 1. Each registered page file exists
for (const entry of PAGE_STATE_REGISTRY) {
  if (!existsSync(entry.file)) {
    issues.push(`Page file missing for ${entry.route}: ${entry.file}`);
  }
}

// 2. Each registered page declares all required states
for (const u of findUncoveredStates()) {
  issues.push(`${u.route} missing required states: ${u.missing.join(", ")}`);
}

const stats = pageStateCoverageStats();

console.log(`Page state coverage: ${stats.fullyCovered}/${stats.total} fully covered (${stats.coveragePct.toFixed(1)}%)`);

if (issues.length > 0) {
  console.error("❌ Issues:");
  for (const i of issues) console.error(`   - ${i}`);
  process.exit(1);
}
console.log("✅ Pass");
