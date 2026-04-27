#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Finance OS Verification Coverage Gate
 *
 * Walks the finance module across {root, money, investment-office}
 * and asserts every page and every finance-os service is either in
 * the verification matrix or has a stable exclusion reason. Mirrors
 * the concierge/business gates.
 */
import * as fs from "fs";
import * as path from "path";
import {
  PAGE_SURFACES,
  SERVICE_SURFACES,
  PAGE_TEST_EXCLUSIONS,
  SERVICE_TEST_EXCLUSIONS,
  ALL_SURFACES,
} from "../../src/__tests__/finance/_matrix/finance-verification-matrix";

const PAGES_ROOT = "src/modules/finance/pages";
const PAGES_SUBDIRS = ["", "money", "investment-office"] as const;
const SERVICES_DIR = "src/lib/services/finance-os";

const errors: string[] = [];
const warnings: string[] = [];

function listPages(): string[] {
  const out: string[] = [];
  for (const sub of PAGES_SUBDIRS) {
    const dir = sub ? path.join(PAGES_ROOT, sub) : PAGES_ROOT;
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) continue;
      out.push(f);
    }
  }
  return out;
}

const pagesOnDisk = listPages();
const classifiedPages = new Set(
  PAGE_SURFACES.map((s) => path.basename(s.ref)).filter((b) => b.endsWith(".tsx")),
);
for (const f of pagesOnDisk) {
  if (classifiedPages.has(f)) continue;
  if (f in PAGE_TEST_EXCLUSIONS) continue;
  errors.push(`Finance page not in matrix and not excluded: ${f}`);
}

const servicesOnDisk = fs
  .readdirSync(SERVICES_DIR)
  .filter((f) => f.endsWith(".service.ts") || f === "investment-office-runtime.ts")
  .map((f) => path.join(SERVICES_DIR, f));
const classifiedServices = new Set(SERVICE_SURFACES.map((s) => s.ref));
for (const p of servicesOnDisk) {
  if (classifiedServices.has(p)) continue;
  if (p in SERVICE_TEST_EXCLUSIONS) continue;
  errors.push(`Finance service not in matrix and not excluded: ${p}`);
}

const missingP0 = ALL_SURFACES.filter((s) => s.status === "missing" && s.priority === "P0");
if (missingP0.length > 0) {
  warnings.push(
    `${missingP0.length} P0 finance surface(s) tracked as missing (will be filled by hardening phases):`,
  );
  for (const s of missingP0) warnings.push(`  • ${s.id} → ${s.tests.join(", ")}`);
}

console.log("\n📋 Finance OS Coverage Gate");
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

console.log("\n✅ Finance coverage gate passed");