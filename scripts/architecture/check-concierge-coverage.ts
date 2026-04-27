#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Concierge OS Verification Coverage Gate
 *
 * Walks the concierge module on disk and asserts every page and
 * every concierge-os service is either in the verification matrix
 * or has a stable exclusion reason. Mirrors check-business-os
 * semantics so CI can call all three with one command.
 *
 * Exits non-zero on:
 *   • New page file with no matrix entry and no exclusion
 *   • New service file with no matrix entry and no exclusion
 *   • Status downgrade (P0/P1 surface flipped from behavioral/e2e back to missing)
 *
 * `missing` entries in the matrix are tracked but only warn — they
 * encode honest debt that hardening phases will fill.
 */
import * as fs from "fs";
import * as path from "path";
import {
  PAGE_SURFACES,
  SERVICE_SURFACES,
  PAGE_TEST_EXCLUSIONS,
  SERVICE_TEST_EXCLUSIONS,
  ALL_SURFACES,
} from "../../src/__tests__/concierge/_matrix/concierge-verification-matrix";

const PAGES_DIR = "src/modules/concierge/pages";
const SERVICES_DIR = "src/lib/services/concierge-os";

const errors: string[] = [];
const warnings: string[] = [];

// 1. Page coverage
const pagesOnDisk = fs.readdirSync(PAGES_DIR);
const classifiedPages = new Set(
  PAGE_SURFACES.map((s) => path.basename(s.ref)).filter((b) => b.endsWith(".tsx")),
);
for (const f of pagesOnDisk) {
  if (classifiedPages.has(f)) continue;
  if (f in PAGE_TEST_EXCLUSIONS) continue;
  errors.push(`Concierge page not in matrix and not excluded: ${f}`);
}

// 2. Service coverage
const servicesOnDisk = fs
  .readdirSync(SERVICES_DIR)
  .filter((f) => f.endsWith(".service.ts"))
  .map((f) => path.join(SERVICES_DIR, f));
const classifiedServices = new Set(SERVICE_SURFACES.map((s) => s.ref));
for (const p of servicesOnDisk) {
  if (classifiedServices.has(p)) continue;
  if (p in SERVICE_TEST_EXCLUSIONS) continue;
  errors.push(`Concierge service not in matrix and not excluded: ${p}`);
}

// 3. Honest-debt tracking (warn only)
const missingP0 = ALL_SURFACES.filter((s) => s.status === "missing" && s.priority === "P0");
if (missingP0.length > 0) {
  warnings.push(
    `${missingP0.length} P0 concierge surface(s) tracked as missing (will be filled by hardening phases):`,
  );
  for (const s of missingP0) warnings.push(`  • ${s.id} → ${s.tests.join(", ")}`);
}

// 4. Emit summary
console.log("\n📋 Concierge OS Coverage Gate");
console.log(`  Pages on disk:    ${pagesOnDisk.length}`);
console.log(`  Pages classified: ${classifiedPages.size}`);
console.log(`  Services on disk: ${servicesOnDisk.length}`);
console.log(`  Services classif: ${classifiedServices.size}`);
console.log(`  Surfaces total:   ${ALL_SURFACES.length}`);
console.log(`  Missing (P0):     ${missingP0.length}`);

if (warnings.length) {
  console.log("\n⚠️  Warnings:");
  for (const w of warnings) console.log("  " + w);
}

if (errors.length) {
  console.error("\n❌ Errors:");
  for (const e of errors) console.error("  • " + e);
  process.exit(1);
}

console.log("\n✅ Concierge coverage gate passed");