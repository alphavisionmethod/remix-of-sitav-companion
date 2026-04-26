#!/usr/bin/env -S node --loader tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS Production-Truth Checker
//
// Scans every page under src/modules/business/pages/*.tsx and
// validates against the production-truth manifest. Fails CI if:
//
//   1) A page file exists but is missing from the manifest
//   2) A page is in the manifest but the file is missing
//   3) A page declared "fully-wired" contains fake-live patterns:
//        - top-level `const X = [` arrays of object literals (>1 item)
//        - `([] as any[])` filter shortcuts (audit-stripped data)
//   4) A page declared "fully-wired" imports zero hooks/services
//      (purely presentational with no data wiring)
//
// Run locally:
//   bunx tsx scripts/architecture/check-business-truth.ts
// ═══════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import {
  BUSINESS_OS_TRUTH_MANIFEST,
  getTruthEntry,
} from "../../src/modules/business/PRODUCTION_TRUTH_MANIFEST";

const PAGES_DIR = join(process.cwd(), "src/modules/business/pages");

interface Violation {
  page: string;
  rule: string;
  detail: string;
}

const violations: Violation[] = [];

function listPageFiles(): string[] {
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""));
}

function hasFakeLiveArray(src: string): boolean {
  // top-level `const NAME: Type[] = [ {  ... } , {  ... } ]` or
  //              `const NAME = [ { ... }, { ... } ]`
  // Match a const at column 0 followed by an array literal containing
  // at least one object literal — the classic "hardcoded fixture" shape.
  // Allows export prefix.
  //
  // Escape hatch: a top-level `// truth-allow: ia-config` comment marks
  // the file as containing only static IA / navigation descriptors
  // (e.g. lists of route groups, icons, labels) — not telemetry rows.
  // These are presentation config, not fake-live data.
  if (/\/\/\s*truth-allow:\s*ia-config/.test(src)) return false;
  const pattern = /^(?:export\s+)?const\s+[A-Z_][A-Z0-9_]*(?:\s*:\s*[^=]+)?\s*=\s*\[\s*\{[\s\S]*?\}\s*,?/m;
  return pattern.test(src);
}

function hasAuditStrippedFilter(src: string): boolean {
  return /\(\s*\[\s*\]\s+as\s+any\s*\[\s*\]\s*\)\s*\.(filter|map|length|find|some|every|reduce)/.test(src);
}

function hasDataImports(src: string): boolean {
  // Any hook import (use*) or service import counts as data wiring.
  if (/from\s+["']@\/hooks\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/lib\/services\/business-os\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/data\/repositories\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/integrations\/supabase\/client["']/.test(src)) return true;
  if (/import\s*\{[^}]*\buse[A-Z]\w+\b[^}]*\}\s*from/.test(src)) return true;
  return false;
}

function check() {
  const manifestPages = new Set(BUSINESS_OS_TRUTH_MANIFEST.map((e) => e.page));
  const filePages = new Set(listPageFiles());

  // Rule 1: file present, manifest missing
  for (const page of filePages) {
    if (!manifestPages.has(page)) {
      violations.push({
        page,
        rule: "manifest-missing",
        detail: `File src/modules/business/pages/${page}.tsx exists but no entry in PRODUCTION_TRUTH_MANIFEST.`,
      });
    }
  }

  // Rule 2: manifest entry, file missing
  for (const entry of BUSINESS_OS_TRUTH_MANIFEST) {
    if (!filePages.has(entry.page)) {
      const path = join(PAGES_DIR, `${entry.page}.tsx`);
      if (!existsSync(path)) {
        violations.push({
          page: entry.page,
          rule: "file-missing",
          detail: `Manifest declares ${entry.page} but no file at ${path}.`,
        });
      }
    }
  }

  // Rules 3 + 4: fully-wired contracts
  for (const entry of BUSINESS_OS_TRUTH_MANIFEST) {
    if (entry.state !== "fully-wired") continue;
    const path = join(PAGES_DIR, `${entry.page}.tsx`);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");

    if (hasFakeLiveArray(src)) {
      violations.push({
        page: entry.page,
        rule: "fake-live-array",
        detail:
          'Top-level hardcoded fixture array detected (e.g. `const TASKS = [ { ... }, ... ]`). Move to demo fixture under src/data/fixtures/ and gate via reality mode, or replace with a real query.',
      });
    }
    if (hasAuditStrippedFilter(src)) {
      violations.push({
        page: entry.page,
        rule: "audit-stripped-filter",
        detail:
          '`([] as any[]).filter/map/...` shortcut detected — page renders an empty list while looking live. Replace with the real data source.',
      });
    }
    if (!hasDataImports(src)) {
      violations.push({
        page: entry.page,
        rule: "no-data-imports",
        detail:
          "Page declared fully-wired but imports zero hooks / services / repositories. Wire to a canonical data source or reclassify.",
      });
    }
  }
}

function report() {
  const total = BUSINESS_OS_TRUTH_MANIFEST.length;
  console.log(`\n📋 Business OS Production-Truth Check`);
  console.log(`   Manifest entries: ${total}`);
  console.log(`   Page files:       ${listPageFiles().length}`);
  console.log(`   Violations:       ${violations.length}\n`);

  if (violations.length === 0) {
    console.log("✅ All Business OS pages pass production-truth checks.\n");
    return 0;
  }

  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    if (!grouped.has(v.page)) grouped.set(v.page, []);
    grouped.get(v.page)!.push(v);
  }

  for (const [page, vs] of [...grouped.entries()].sort()) {
    console.log(`❌ ${page}`);
    const entry = getTruthEntry(page);
    if (entry) console.log(`   declared state: ${entry.state}`);
    for (const v of vs) {
      console.log(`   • [${v.rule}] ${v.detail}`);
    }
    console.log("");
  }

  console.log(`Found ${violations.length} violation(s) across ${grouped.size} page(s).`);
  return 1;
}

check();
process.exit(report());