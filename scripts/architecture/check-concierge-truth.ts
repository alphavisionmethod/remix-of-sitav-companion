#!/usr/bin/env -S node --loader tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Production-Truth Checker
//
// Mirror of scripts/architecture/check-business-truth.ts for the
// Concierge module. Scans every page under
// src/modules/concierge/pages/*.tsx and validates against the
// CONCIERGE_TRUTH_MANIFEST. Same eight rules as the business
// checker, including the `// truth-allow: ia-config` escape hatch
// for static IA descriptors.
//
// Run locally:
//   bunx tsx scripts/architecture/check-concierge-truth.ts
// ═══════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  CONCIERGE_TRUTH_MANIFEST,
  type PageTruthEntry,
} from "../../src/modules/concierge/PRODUCTION_TRUTH_MANIFEST";
import {
  hasFakeLiveArray,
  hasAuditStrippedFilter,
  findUngatedMockImports,
  hasFakeExecutePattern,
  hasEmptyStateGrammar,
  findFetchedButUnusedQueries,
} from "./check-business-truth";

const PAGES_DIR = join(process.cwd(), "src/modules/concierge/pages");

interface Violation {
  page: string;
  rule: string;
  detail: string;
  severity?: "error" | "warning";
}

const violations: Violation[] = [];
const warnings: Violation[] = [];

function listPageFiles(): string[] {
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""));
}

function getEntry(page: string): PageTruthEntry | undefined {
  return CONCIERGE_TRUTH_MANIFEST.find((e) => e.page === page);
}

/** Concierge-specific data-import detector — accepts concierge hooks/services. */
export function hasConciergeDataImports(src: string): boolean {
  if (/from\s+["']@\/hooks\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/lib\/services\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/data\/repositories\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/integrations\/supabase\/client["']/.test(src)) return true;
  if (/from\s+["']@\/contexts\/[^"']+["']/.test(src)) return true;
  if (/import\s*\{[^}]*\buse[A-Z]\w+\b[^}]*\}\s*from/.test(src)) return true;
  return false;
}

function check() {
  const manifestPages = new Set(CONCIERGE_TRUTH_MANIFEST.map((e) => e.page));
  const filePages = new Set(listPageFiles());

  // Rule 1: file present, manifest missing
  for (const page of filePages) {
    if (!manifestPages.has(page)) {
      violations.push({
        page,
        rule: "manifest-missing",
        detail: `File src/modules/concierge/pages/${page}.tsx exists but no entry in CONCIERGE_TRUTH_MANIFEST.`,
      });
    }
  }

  // Rule 2: manifest entry, file missing
  for (const entry of CONCIERGE_TRUTH_MANIFEST) {
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

  // Rules 3..8
  for (const entry of CONCIERGE_TRUTH_MANIFEST) {
    // Degraded contract first
    if (entry.state === "degraded") {
      const path = join(PAGES_DIR, `${entry.page}.tsx`);
      if (!existsSync(path)) continue;
      const src = readFileSync(path, "utf8");
      if (!hasEmptyStateGrammar(src)) {
        violations.push({
          page: entry.page,
          rule: "degraded-must-render-empty",
          detail:
            "Page declared `degraded` but does not render an EmptyStateCard / PremiumEmptyState / LegacyEmptyStateCard / ConciergeEmptyState / setup-required state, nor a PageTruthBanner with truthState='partial|degraded|connecting'. Render an honest setup-required UI.",
        });
      }
      if (hasFakeLiveArray(src)) {
        violations.push({
          page: entry.page,
          rule: "degraded-fake-live-array",
          detail:
            "Page declared `degraded` still contains a top-level hardcoded fixture array. Move to a demo fixture under src/data/fixtures/ and gate via reality mode, or replace with descriptive setup copy.",
        });
      }
      continue;
    }

    if (entry.state !== "fully-wired") continue;
    const path = join(PAGES_DIR, `${entry.page}.tsx`);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");

    if (hasFakeLiveArray(src)) {
      violations.push({
        page: entry.page,
        rule: "fake-live-array",
        detail:
          'Top-level hardcoded fixture array detected. Move to a demo fixture under src/data/fixtures/ and gate via reality mode, or replace with a real query.',
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
    if (!hasConciergeDataImports(src)) {
      violations.push({
        page: entry.page,
        rule: "no-data-imports",
        detail:
          "Page declared fully-wired but imports zero hooks / services / repositories. Wire to a canonical data source or reclassify.",
      });
    }
    const ungatedMocks = findUngatedMockImports(src);
    if (ungatedMocks.length > 0) {
      violations.push({
        page: entry.page,
        rule: "no-mock-fixture-import",
        detail: `Imports demo fixtures without an isDemo / useRealityModeSafe gate: ${ungatedMocks.join(", ")}.`,
      });
    }
    if (hasFakeExecutePattern(src)) {
      violations.push({
        page: entry.page,
        rule: "no-fake-execute",
        detail:
          'Detected `setTimeout(() => setXxx("done"|"complete"|"success"))` masquerading as real async work. Replace with a real action / mutation.',
      });
    }
    const unused = findFetchedButUnusedQueries(src);
    if (unused.length > 0) {
      warnings.push({
        page: entry.page,
        rule: "fetched-but-unused-query",
        severity: "warning",
        detail: `Fetched query result(s) destructured but never referenced: ${unused.join(", ")}.`,
      });
    }
  }
}

function report(): number {
  const total = CONCIERGE_TRUTH_MANIFEST.length;
  console.log(`\n📋 Concierge Production-Truth Check`);
  console.log(`   Manifest entries: ${total}`);
  console.log(`   Page files:       ${listPageFiles().length}`);
  console.log(`   Violations:       ${violations.length}`);
  console.log(`   Warnings:         ${warnings.length}\n`);

  if (warnings.length > 0) {
    const grouped = new Map<string, Violation[]>();
    for (const w of warnings) {
      if (!grouped.has(w.page)) grouped.set(w.page, []);
      grouped.get(w.page)!.push(w);
    }
    for (const [page, ws] of [...grouped.entries()].sort()) {
      console.log(`⚠️  ${page}`);
      for (const w of ws) console.log(`   • [${w.rule}] ${w.detail}`);
      console.log("");
    }
  }

  if (violations.length === 0) {
    console.log("✅ All Concierge pages pass production-truth checks.\n");
    return 0;
  }

  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    if (!grouped.has(v.page)) grouped.set(v.page, []);
    grouped.get(v.page)!.push(v);
  }

  for (const [page, vs] of [...grouped.entries()].sort()) {
    console.log(`❌ ${page}`);
    const entry = getEntry(page);
    if (entry) console.log(`   declared state: ${entry.state}`);
    for (const v of vs) console.log(`   • [${v.rule}] ${v.detail}`);
    console.log("");
  }

  console.log(`Found ${violations.length} violation(s) across ${grouped.size} page(s).`);
  return 1;
}

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith("check-concierge-truth.ts");

if (invokedDirectly) {
  check();
  process.exit(report());
}

export { check, report };
