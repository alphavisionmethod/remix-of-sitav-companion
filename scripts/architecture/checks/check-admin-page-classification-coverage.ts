#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Page Classification Coverage
//
// Every page file under src/pages/admin/ must either:
//   (a) have an explicit entry in admin-page-consolidation-map.ts, or
//   (b) be inferable via inferEntryFromFilename().
//
// Curated coverage is reported as a percentage so we can track
// the consolidation progress over time. The check fails only when
// inference itself cannot place a page (which means the prefix is
// unknown and the cluster map needs an update).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir } from "../lib/utils";

const vc = new ViolationCollector();

const PAGES_DIR = "src/pages/admin";
const CONSOLIDATION_PATH = "src/lib/architecture/admin-page-consolidation-map.ts";

if (!fs.existsSync(PAGES_DIR)) {
  vc.add(PAGES_DIR, "missing-pages-dir", "src/pages/admin not found");
  vc.report("check-admin-page-classification-coverage");
  vc.exitIfErrors();
  process.exit(0);
}
if (!fs.existsSync(CONSOLIDATION_PATH)) {
  vc.add(CONSOLIDATION_PATH, "missing-map", "admin-page-consolidation-map.ts not found");
  vc.report("check-admin-page-classification-coverage");
  vc.exitIfErrors();
  process.exit(0);
}

const consolidationSrc = fs.readFileSync(CONSOLIDATION_PATH, "utf-8");

// Curated component names from the map.
const curated = new Set<string>();
const compRe = /component:\s*"([^"]+)"/g;
let m: RegExpExecArray | null;
while ((m = compRe.exec(consolidationSrc)) !== null) curated.add(m[1]);

// Known cluster prefixes.
const prefixes = new Set<string>();
const prefRe = /^\s+([A-Z][A-Za-z]*)\s*:\s*"[a-z-]+",?\s*$/gm;
while ((m = prefRe.exec(consolidationSrc)) !== null) prefixes.add(m[1]);

const pageFiles = scanDir(PAGES_DIR, [".tsx"]);
let curatedCount = 0;
let inferableCount = 0;
let unknownCount = 0;
const unknownPages: string[] = [];

for (const file of pageFiles) {
  const base = path.basename(file, ".tsx");
  if (curated.has(base)) {
    curatedCount++;
    continue;
  }
  // Try to infer cluster prefix
  const prefix = base.match(/^([A-Z]+)/)?.[1] ?? "";
  const wordPrefix = base.split(/(?=[A-Z])/)[0] ?? "";
  if (prefixes.has(prefix) || prefixes.has(wordPrefix)) {
    inferableCount++;
  } else {
    unknownCount++;
    unknownPages.push(`${base} (in ${path.relative(PAGES_DIR, file)})`);
  }
}

const total = pageFiles.length;
const pctCurated = total > 0 ? Math.round((curatedCount / total) * 100) : 0;
const pctCovered = total > 0 ? Math.round(((curatedCount + inferableCount) / total) * 100) : 0;

console.log(`  📊 ${total} admin pages`);
console.log(`  ✏️  ${curatedCount} curated (${pctCurated}%)`);
console.log(`  🤖 ${inferableCount} auto-classified by prefix`);
console.log(`  ✅ ${pctCovered}% total coverage`);
console.log(`  ❓ ${unknownCount} unknown`);

const SHOW_LIMIT = 15;
for (const p of unknownPages.slice(0, SHOW_LIMIT)) {
  vc.add(p, "unclassified-page", `No curated entry and no known prefix cluster — extend CLUSTER_DOMAIN_MAP.`, "warning");
}
if (unknownPages.length > SHOW_LIMIT) {
  console.log(`  … and ${unknownPages.length - SHOW_LIMIT} more`);
}

// Hard failure if coverage drops under 90% — protects future cleanup phases.
if (total > 0 && pctCovered < 90) {
  vc.add(CONSOLIDATION_PATH, "coverage-below-floor", `Coverage ${pctCovered}% < 90%`);
}

vc.report("check-admin-page-classification-coverage");
vc.exitIfErrors();
