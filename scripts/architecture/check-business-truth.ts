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
//   5) A page declared "fully-wired" unconditionally imports from
//      @/data/fixtures/mock-data/* without an isDemo gate
//   6) A page declared "fully-wired" contains `setTimeout(...)` →
//      `setStatus("done"|"complete"|"success")` fake-execute pattern
//   7) A page declared "degraded" must render an empty/setup state
//      and must not contain top-level fake-live arrays
//   8) (advisory) A page fetches a `useXxx()` query and never
//      references the destructured value — informational warning
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
  severity?: "error" | "warning";
}

const violations: Violation[] = [];
const warnings: Violation[] = [];

function listPageFiles(): string[] {
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""));
}

export function hasFakeLiveArray(src: string): boolean {
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

export function hasAuditStrippedFilter(src: string): boolean {
  return /\(\s*\[\s*\]\s+as\s+any\s*\[\s*\]\s*\)\s*\.(filter|map|length|find|some|every|reduce)/.test(src);
}

export function hasDataImports(src: string): boolean {
  // Any hook import (use*) or service import counts as data wiring.
  if (/from\s+["']@\/hooks\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/lib\/services\/business-os\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/data\/repositories\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/integrations\/supabase\/client["']/.test(src)) return true;
  if (/import\s*\{[^}]*\buse[A-Z]\w+\b[^}]*\}\s*from/.test(src)) return true;
  return false;
}

/**
 * Rule 5: detect imports from @/data/fixtures/mock-data/* that are
 * not gated behind an `isDemo` reality-mode check.
 * Returns the offending import lines, or an empty array if all
 * fixture imports are properly gated (or absent).
 */
export function findUngatedMockImports(src: string): string[] {
  const importRe = /import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+["'](@\/data\/fixtures\/mock-data\/[^"']+)["']/g;
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) {
    matches.push(m[1]);
  }
  if (matches.length === 0) return [];
  // If the file exposes any reality-mode demo gate, treat fixture
  // imports as gated. The runtime contract is that demo branches
  // render fixtures only when isDemo === true.
  const hasDemoGate =
    /useRealityModeSafe\s*\(/.test(src) ||
    /\bisDemo\b/.test(src) ||
    /useRealityMode\s*\(/.test(src);
  if (hasDemoGate) return [];
  return matches;
}

/**
 * Rule 6: detect fake-execute patterns where a page schedules a
 * setTimeout that flips a status setter to "done"/"complete"/"success".
 * This masquerades as real async work and is forbidden in fully-wired
 * pages.
 */
export function hasFakeExecutePattern(src: string): boolean {
  // setTimeout(() => setStatus("done"), …) or
 //  setTimeout(() => { setStatus("complete"); }, …)
  const re = /setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{?\s*set[A-Z]\w*\s*\(\s*["'](?:done|complete|success|completed|finished)["']/;
  return re.test(src);
}

/**
 * Rule 7: degraded pages must render an honest empty/setup-required
 * surface and must not contain fake-live arrays.
 */
export function hasEmptyStateGrammar(src: string): boolean {
  if (/EmptyStateCard|PremiumEmptyState|LegacyEmptyStateCard|ConciergeEmptyState|<EmptyState\b/.test(src)) return true;
  if (/setup-required|setupRequired|connect-an-integration|"connect"/i.test(src)) return true;
  if (/PageTruthBanner[^>]*truthState=["'](?:partial|degraded|connecting)["']/.test(src)) return true;
  return false;
}

/**
 * Rule 8 (advisory): destructure a `useXxx` result into a name that
 * never appears again in the file body.
 */
export function findFetchedButUnusedQueries(src: string): string[] {
  const offenders: string[] = [];
  const decl = /const\s*\{\s*data\s*:\s*(\w+)[\s\S]*?\}\s*=\s*use[A-Z]\w*\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = decl.exec(src)) !== null) {
    const varName = m[1];
    // Skip well-known unused destructure names
    if (varName === "_" || varName.startsWith("_")) continue;
    // Search for any further reference to the variable after its
    // declaration. Account for the declaration itself by counting
    // total appearances of the identifier (must be > 1).
    const ref = new RegExp(`\\b${varName}\\b`, "g");
    const hits = src.match(ref) ?? [];
    if (hits.length <= 1) offenders.push(varName);
  }
  return offenders;
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
    // Apply degraded-only rules first (Rule 7).
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
    const ungatedMocks = findUngatedMockImports(src);
    if (ungatedMocks.length > 0) {
      violations.push({
        page: entry.page,
        rule: "no-mock-fixture-import",
        detail: `Imports demo fixtures without an isDemo / useRealityModeSafe gate: ${ungatedMocks.join(", ")}. Gate fixture branches behind the reality mode check.`,
      });
    }
    if (hasFakeExecutePattern(src)) {
      violations.push({
        page: entry.page,
        rule: "no-fake-execute",
        detail:
          'Detected `setTimeout(() => setXxx("done"|"complete"|"success"))` masquerading as real async work. Replace with a real action / mutation backed by the canonical action kernel.',
      });
    }
    const unused = findFetchedButUnusedQueries(src);
    if (unused.length > 0) {
      warnings.push({
        page: entry.page,
        rule: "fetched-but-unused-query",
        severity: "warning",
        detail: `Fetched query result(s) destructured but never referenced: ${unused.join(", ")}. Either consume the data or stop fetching it.`,
      });
    }
  }
}

function report() {
  const total = BUSINESS_OS_TRUTH_MANIFEST.length;
  console.log(`\n📋 Business OS Production-Truth Check`);
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