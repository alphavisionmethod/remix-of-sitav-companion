#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Run All Generators
// Master script that runs all generation scripts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";

const generators = [
  "scripts/generate-service-manifest.ts",
  "scripts/generate-route-manifest.ts",
  "scripts/generate-capability-index.ts",
  "scripts/generate-prompt-index.ts",
  "scripts/generate-connector-catalog.ts",
  "scripts/generate-advisor-registry.ts",
  "scripts/generate-internal-agent-registry.ts",
  "scripts/generate-formula-registry.ts",
  "scripts/generate-outcome-index.ts",
  "scripts/generate-subject-manifest.ts",
  "scripts/generate-startup-order.ts",
  "scripts/generate-feature-integration-index.ts",
  "scripts/generate-boardroom-template-index.ts",
];

console.log(`\n🔄 Running ${generators.length} generators...\n`);

let failed = 0;
for (const g of generators) {
  try {
    execSync(`npx tsx ${g}`, { stdio: "inherit" });
  } catch {
    failed++;
  }
}

console.log(`\n${failed === 0 ? "✅" : "⚠️"} ${generators.length - failed}/${generators.length} generators succeeded\n`);
if (failed > 0) process.exit(1);
