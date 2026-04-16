#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Page Classification Coverage
//
// Every page file under src/pages/admin/ must either:
//   (a) have an explicit entry in admin-page-consolidation-map.ts, or
//   (b) be inferable via a known cluster prefix.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir } from "../lib/utils";
import {
  ADMIN_PAGE_CONSOLIDATION_MAP,
  CLUSTER_DOMAIN_MAP,
  isClassifiable,
} from "../../../src/lib/architecture/admin-page-consolidation-map";

const vc = new ViolationCollector();
const PAGES_DIR = "src/pages/admin";

if (!fs.existsSync(PAGES_DIR)) {
  vc.add(PAGES_DIR, "missing-pages-dir", "src/pages/admin not found");
  vc.report("check-admin-page-classification-coverage");
  vc.exitIfErrors();
  process.exit(0);
}

const curated = new Set(ADMIN_PAGE_CONSOLIDATION_MAP.map((e) => e.component));
const pageFiles = scanDir(PAGES_DIR, [".tsx"]);
let curatedCount = 0;
let inferableCount = 0;
const unknownPages: string[] = [];

for (const file of pageFiles) {
  const base = path.basename(file, ".tsx");
  if (curated.has(base)) { curatedCount++; continue; }
  if (isClassifiable(base)) { inferableCount++; continue; }
  unknownPages.push(`${base} (${path.relative(PAGES_DIR, file)})`);
}

const total = pageFiles.length;
const pctCurated = total > 0 ? Math.round((curatedCount / total) * 100) : 0;
const pctCovered = total > 0 ? Math.round(((curatedCount + inferableCount) / total) * 100) : 0;

console.log(`  📊 ${total} admin pages`);
console.log(`  ✏️  ${curatedCount} curated (${pctCurated}%)`);
console.log(`  🤖 ${inferableCount} auto-classified by prefix (${Object.keys(CLUSTER_DOMAIN_MAP).length} prefixes known)`);
console.log(`  ✅ ${pctCovered}% total coverage`);
console.log(`  ❓ ${unknownPages.length} unknown`);

const SHOW_LIMIT = 15;
for (const p of unknownPages.slice(0, SHOW_LIMIT)) {
  vc.add(p, "unclassified-page", `No curated entry and no known prefix — extend CLUSTER_DOMAIN_MAP.`, "warning");
}
if (unknownPages.length > SHOW_LIMIT) {
  console.log(`  … and ${unknownPages.length - SHOW_LIMIT} more`);
}

if (total > 0 && pctCovered < 90) {
  vc.add("admin-page-consolidation-map.ts", "coverage-below-floor", `Coverage ${pctCovered}% < 90%`);
}

vc.report("check-admin-page-classification-coverage");
vc.exitIfErrors();
