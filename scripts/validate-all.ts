#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Run All Validators
// Master script that runs all validation/check scripts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";

const validators = [
  "scripts/architecture/boundary-check.ts",
  "scripts/check-single-brain.ts",
  "scripts/check-import-boundaries.ts",
  "scripts/check-edge-function-health.ts",
  "scripts/check-package-exports.ts",
  "scripts/check-contract-completeness.ts",
  "scripts/validation/generated-truth.ts",
  "scripts/validation/schema-compliance.ts",
  "scripts/check-no-page-mocks.ts",
];

console.log(`\n🔍 Running ${validators.length} validators...\n`);

let failed = 0;
for (const v of validators) {
  try {
    execSync(`npx tsx ${v}`, { stdio: "inherit" });
  } catch {
    failed++;
  }
}

console.log(`\n${failed === 0 ? "✅" : "⚠️"} ${validators.length - failed}/${validators.length} validators passed\n`);
if (failed > 0) process.exit(1);
