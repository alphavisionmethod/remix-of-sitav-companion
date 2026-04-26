#!/usr/bin/env -S node --loader tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Production-Truth Checker
//
// Mirror of scripts/architecture/check-business-truth.ts and
// check-concierge-truth.ts for the Finance module. Recurses
// src/modules/finance/pages/{root, money, investment-office} and
// validates each page against the FINANCE_TRUTH_MANIFEST. Reuses
// the same eight rules as the business / concierge checkers,
// including the `// truth-allow: ia-config` escape hatch for
// static IA descriptors (mode wizards, primary-tab manifests).
//
// Run locally:
//   bunx tsx scripts/architecture/check-finance-truth.ts
// ═══════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  FINANCE_TRUTH_MANIFEST,
  type PageTruthEntry,
} from "../../src/modules/finance/PRODUCTION_TRUTH_MANIFEST";
import {
  hasFakeLiveArray,
  hasAuditStrippedFilter,
  findUngatedMockImports,
  hasFakeExecutePattern,
  hasEmptyStateGrammar,
  findFetchedButUnusedQueries,
} from "./check-business-truth";

const PAGES_ROOT = join(process.cwd(), "src/modules/finance/pages");
const SUBDIRS: ReadonlyArray<"" | "money" | "investment-office"> = [
  "",
  "money",
  "investment-office",
];

interface Violation {
  page: string;
  rule: string;
  detail: string;
  severity?: "error" | "warning";
}

const violations: Violation[] = [];
const warnings: Violation[] = [];

interface FoundFile {
  page: string;
  subdir: "" | "money" | "investment-office";
  path: string;
}

function listPageFiles(): FoundFile[] {
  const out: FoundFile[] = [];
  for (const sub of SUBDIRS) {
    const dir = sub ? join(PAGES_ROOT, sub) : PAGES_ROOT;
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) continue;
      if (!name.endsWith(".tsx")) continue;
      out.push({ page: name.replace(/\.tsx$/, ""), subdir: sub, path: full });
    }
  }
  return out;
}

function getEntry(page: string, subdir: "" | "money" | "investment-office"): PageTruthEntry | undefined {
  return FINANCE_TRUTH_MANIFEST.find((e) => e.page === page && e.subdir === subdir);
}

/** Finance-specific data-import detector — accepts finance hooks/services. */
export function hasFinanceDataImports(src: string): boolean {
  if (/from\s+["']@\/hooks\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/lib\/services\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/data\/repositories\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/integrations\/supabase\/client["']/.test(src)) return true;
  if (/from\s+["']@\/contexts\/[^"']+["']/.test(src)) return true;
  if (/import\s*\{[^}]*\buse[A-Z]\w+\b[^}]*\}\s*from/.test(src)) return true;
  return false;
}

function check() {
  const manifestKeys = new Set(
    FINANCE_TRUTH_MANIFEST.map((e) => `${e.subdir}::${e.page}`)
  );
  const files = listPageFiles();
  const fileKeys = new Set(files.map((f) => `${f.subdir}::${f.page}`));

  // Rule 1: file present, manifest missing
  for (const f of files) {
    if (!manifestKeys.has(`${f.subdir}::${f.page}`)) {
      violations.push({
        page: `${f.subdir || "<root>"}/${f.page}`,
        rule: "manifest-missing",
        detail: `File ${f.path} exists but no entry in FINANCE_TRUTH_MANIFEST.`,
      });
    }
  }

  // Rule 2: manifest entry, file missing
  for (const entry of FINANCE_TRUTH_MANIFEST) {
    const key = `${entry.subdir}::${entry.page}`;
    if (!fileKeys.has(key)) {
      violations.push({
        page: `${entry.subdir || "<root>"}/${entry.page}`,
        rule: "file-missing",
        detail: `Manifest declares ${entry.page} (subdir=${entry.subdir || "<root>"}) but no file present.`,
      });
    }
  }

  // Rules 3..8
  for (const entry of FINANCE_TRUTH_MANIFEST) {
    const dir = entry.subdir ? join(PAGES_ROOT, entry.subdir) : PAGES_ROOT;
    const path = join(dir, `${entry.page}.tsx`);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");
    const label = `${entry.subdir || "<root>"}/${entry.page}`;

    if (entry.state === "degraded") {
      if (!hasEmptyStateGrammar(src)) {
        violations.push({
          page: label,
          rule: "degraded-must-render-empty",
          detail:
            "Page declared `degraded` but does not render an EmptyStateCard / PremiumEmptyState / LegacyEmptyStateCard / setup-required state, nor a PageTruthBanner with truthState='partial|degraded|connecting'. Render an honest setup-required UI.",
        });
      }
      if (hasFakeLiveArray(src)) {
        violations.push({
          page: label,
          rule: "degraded-fake-live-array",
          detail:
            "Page declared `degraded` still contains a top-level hardcoded fixture array. Move to a demo fixture under src/data/fixtures/ and gate via reality mode, or replace with descriptive setup copy.",
        });
      }
      continue;
    }

    if (entry.state !== "fully-wired") continue;

    if (hasFakeLiveArray(src)) {
      violations.push({
        page: label,
        rule: "fake-live-array",
        detail:
          'Top-level hardcoded fixture array detected. Move to a demo fixture under src/data/fixtures/ and gate via reality mode, or replace with a real query.',
      });
    }
    if (hasAuditStrippedFilter(src)) {
      violations.push({
        page: label,
        rule: "audit-stripped-filter",
        detail:
          '`([] as any[]).filter/map/...` shortcut detected — page renders an empty list while looking live. Replace with the real data source.',
      });
    }
    if (!hasFinanceDataImports(src)) {
      violations.push({
        page: label,
        rule: "no-data-imports",
        detail:
          "Page declared fully-wired but imports zero hooks / services / repositories. Wire to a canonical data source or reclassify.",
      });
    }
    const ungatedMocks = findUngatedMockImports(src);
    if (ungatedMocks.length > 0) {
      violations.push({
        page: label,
        rule: "no-mock-fixture-import",
        detail: `Imports demo fixtures without an isDemo / useRealityModeSafe gate: ${ungatedMocks.join(", ")}.`,
      });
    }
    if (hasFakeExecutePattern(src)) {
      violations.push({
        page: label,
        rule: "no-fake-execute",
        detail:
          'Detected `setTimeout(() => setXxx("done"|"complete"|"success"))` masquerading as real async work. Replace with a real action / mutation.',
      });
    }
    const unused = findFetchedButUnusedQueries(src);
    if (unused.length > 0) {
      warnings.push({
        page: label,
        rule: "fetched-but-unused-query",
        severity: "warning",
        detail: `Fetched query result(s) destructured but never referenced: ${unused.join(", ")}.`,
      });
    }
  }
}

function report(): number {
  const total = FINANCE_TRUTH_MANIFEST.length;
  console.log(`\n📋 Finance Production-Truth Check`);
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
    console.log("✅ All Finance pages pass production-truth checks.\n");
    return 0;
  }

  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    if (!grouped.has(v.page)) grouped.set(v.page, []);
    grouped.get(v.page)!.push(v);
  }

  for (const [page, vs] of [...grouped.entries()].sort()) {
    console.log(`❌ ${page}`);
    for (const v of vs) console.log(`   • [${v.rule}] ${v.detail}`);
    console.log("");
  }

  console.log(`Found ${violations.length} violation(s) across ${grouped.size} page(s).`);
  return 1;
}

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith("check-finance-truth.ts");

if (invokedDirectly) {
  check();
  process.exit(report());
}

export { check, report };