#!/usr/bin/env -S node --loader tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin (Mission Control) Production-Truth Checker
//
// Scans every page under src/pages/admin/**.tsx and validates
// against the admin production-truth manifest. Fails CI if:
//
//   1) A page file exists but is missing from the manifest
//   2) A page is in the manifest but the file is missing
//   3) A page declared "fully-wired" contains fake-live patterns:
//        - top-level `const X = [ { ... }, { ... } ]` arrays
//        - `([] as any[])` filter/map/length shortcuts
//   4) A page declared "fully-wired" imports zero hooks/services
//      (purely presentational with no data wiring)
//
// Run locally:
//   bunx tsx scripts/architecture/check-admin-truth.ts
//
// CI gate: see .github/workflows/check-boundaries.yml — the gate is
// advisory by default and flips to blocking when the repo variable
// ADMIN_TRUTH_ENFORCE=true.
// ═══════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  ADMIN_TRUTH_MANIFEST,
  getAdminTruthEntry,
} from "../../src/pages/admin/PRODUCTION_TRUTH_MANIFEST";

const PAGES_DIR = join(process.cwd(), "src/pages/admin");

interface Violation {
  page: string;
  rule: string;
  detail: string;
}

const violations: Violation[] = [];

function listPageFiles(): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      // Skip tests + co-located config buckets — they are not pages.
      if (name === "__tests__" || name === "_config") continue;
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
      } else if (name.endsWith(".tsx")) {
        const id = relative(PAGES_DIR, full).replace(/\\/g, "/").replace(/\.tsx$/, "");
        out.push(id);
      }
    }
  }
  walk(PAGES_DIR);
  return out;
}

function hasFakeLiveArray(src: string): boolean {
  // Top-level UPPER_SNAKE const assigned to an array of object literals.
  // Same heuristic as check-business-truth.ts.
  const pattern = /^(?:export\s+)?const\s+[A-Z_][A-Z0-9_]*(?:\s*:\s*[^=]+)?\s*=\s*\[\s*\{[\s\S]*?\}\s*,?/m;
  return pattern.test(src);
}

function hasAuditStrippedFilter(src: string): boolean {
  return /\(\s*\[\s*\]\s+as\s+any\s*\[\s*\]\s*\)\s*\.(filter|map|length|find|some|every|reduce)/.test(src);
}

function hasDataImports(src: string): boolean {
  if (/from\s+["']@\/hooks\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/lib\/services\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/data\/repositories\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/integrations\/supabase\/client["']/.test(src)) return true;
  // Any named hook import (`use*`) counts as data wiring.
  if (/import\s*\{[^}]*\buse[A-Z]\w+\b[^}]*\}\s*from/.test(src)) return true;
  return false;
}

function check() {
  const manifestPages = new Set(ADMIN_TRUTH_MANIFEST.map((e) => e.page));
  const filePages = new Set(listPageFiles());

  // Rule 1: file present, manifest missing
  for (const page of filePages) {
    if (!manifestPages.has(page)) {
      violations.push({
        page,
        rule: "manifest-missing",
        detail: `File src/pages/admin/${page}.tsx exists but no entry in PRODUCTION_TRUTH_MANIFEST.`,
      });
    }
  }

  // Rule 2: manifest entry, file missing
  for (const entry of ADMIN_TRUTH_MANIFEST) {
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
  for (const entry of ADMIN_TRUTH_MANIFEST) {
    if (entry.state !== "fully-wired") continue;
    const path = join(PAGES_DIR, `${entry.page}.tsx`);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");

    if (hasFakeLiveArray(src)) {
      violations.push({
        page: entry.page,
        rule: "fake-live-array",
        detail:
          'Top-level hardcoded fixture array detected. Move to demo fixture under src/data/fixtures/ and gate via reality mode, or replace with a real query.',
      });
    }
    if (hasAuditStrippedFilter(src)) {
      violations.push({
        page: entry.page,
        rule: "audit-stripped-filter",
        detail:
          '`([] as any[]).filter/map/length/...` shortcut detected — page renders an empty list while looking live. Replace with the real data source or reclassify as degraded.',
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

  // Rule 5: degraded entries must carry an honest reason
  for (const entry of ADMIN_TRUTH_MANIFEST) {
    if (entry.state === "degraded" && !entry.degradedReason) {
      violations.push({
        page: entry.page,
        rule: "degraded-without-reason",
        detail: 'Manifest declares "degraded" but no `degradedReason` was provided.',
      });
    }
    if (entry.state === "hidden" && !entry.hiddenReason) {
      violations.push({
        page: entry.page,
        rule: "hidden-without-reason",
        detail: 'Manifest declares "hidden" but no `hiddenReason` was provided.',
      });
    }
  }
}

function report() {
  const total = ADMIN_TRUTH_MANIFEST.length;
  const fileCount = listPageFiles().length;
  console.log(`\n📋 Admin (Mission Control) Production-Truth Check`);
  console.log(`   Manifest entries: ${total}`);
  console.log(`   Page files:       ${fileCount}`);
  console.log(`   Violations:       ${violations.length}\n`);

  if (violations.length === 0) {
    console.log("✅ All admin pages pass production-truth checks.\n");
    return 0;
  }

  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    if (!grouped.has(v.page)) grouped.set(v.page, []);
    grouped.get(v.page)!.push(v);
  }

  // Cap noisy output — show first 60 pages, summarize the rest.
  const entries = [...grouped.entries()].sort();
  const shown = entries.slice(0, 60);
  const hidden = entries.length - shown.length;

  for (const [page, vs] of shown) {
    console.log(`❌ ${page}`);
    const entry = getAdminTruthEntry(page);
    if (entry) console.log(`   declared state: ${entry.state}`);
    for (const v of vs) {
      console.log(`   • [${v.rule}] ${v.detail}`);
    }
    console.log("");
  }
  if (hidden > 0) {
    console.log(`… and ${hidden} more page(s) with violations (run with grep on the rule name to see them all).\n`);
  }

  console.log(`Found ${violations.length} violation(s) across ${grouped.size} page(s).`);
  return 1;
}

check();
process.exit(report());