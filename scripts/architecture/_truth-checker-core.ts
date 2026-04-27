// ═══════════════════════════════════════════════════════════════
// SITA OS — Generic Production-Truth Checker Core (Phase 6)
//
// Reusable engine that powers the per-module truth audits for
// Health, Trust, Mobile, Intelligence, and Personal Brain.
// Mirrors the logic of check-finance-truth.ts but accepts a
// pluggable manifest + page-root config.
//
// Reuses the already-canonical primitive detectors from
// scripts/architecture/check-business-truth.ts so all modules
// share the same eight rules.
// ═══════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  hasFakeLiveArray,
  hasAuditStrippedFilter,
  findUngatedMockImports,
  hasFakeExecutePattern,
  hasEmptyStateGrammar,
  findFetchedButUnusedQueries,
} from "./check-business-truth";

export type TruthState = "fully-wired" | "degraded" | "hidden";

export interface GenericTruthEntry {
  page: string;
  subdir: string;
  state: TruthState;
  sources?: ReadonlyArray<string>;
  degradedReason?: string;
}

export interface CheckerConfig {
  /** Display label used in CLI output (e.g. "Health"). */
  label: string;
  /** Absolute or repo-relative path to the pages root. */
  pagesRoot: string;
  /** Allowed subdirs (empty string for the root). */
  subdirs: ReadonlyArray<string>;
  /** The manifest entries to validate against. */
  manifest: ReadonlyArray<GenericTruthEntry>;
}

interface Violation {
  page: string;
  rule: string;
  detail: string;
  severity?: "error" | "warning";
}

/** Module-agnostic data-import detector. */
function hasModuleDataImports(src: string): boolean {
  if (/from\s+["']@\/hooks\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/services\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/lib\/services\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/data\/repositories\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/integrations\/supabase\/client["']/.test(src)) return true;
  if (/from\s+["']@\/contexts\/[^"']+["']/.test(src)) return true;
  if (/from\s+["']@\/platform\/[^"']+\/hooks/.test(src)) return true;
  if (/from\s+["']@\/modules\/[^"']+\/hooks/.test(src)) return true;
  if (/import\s*\{[^}]*\buse[A-Z]\w+\b[^}]*\}\s*from\s+["']@\//.test(src)) return true;
  return false;
}

function listPageFiles(cfg: CheckerConfig): { page: string; subdir: string; path: string }[] {
  const out: { page: string; subdir: string; path: string }[] = [];
  for (const sub of cfg.subdirs) {
    const dir = sub ? join(cfg.pagesRoot, sub) : cfg.pagesRoot;
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

export function runChecker(cfg: CheckerConfig): number {
  const violations: Violation[] = [];
  const warnings: Violation[] = [];
  const manifestKeys = new Set(cfg.manifest.map((e) => `${e.subdir}::${e.page}`));
  const files = listPageFiles(cfg);
  const fileKeys = new Set(files.map((f) => `${f.subdir}::${f.page}`));

  for (const f of files) {
    if (!manifestKeys.has(`${f.subdir}::${f.page}`)) {
      violations.push({
        page: `${f.subdir || "<root>"}/${f.page}`,
        rule: "manifest-missing",
        detail: `File ${f.path} exists but no entry in manifest.`,
      });
    }
  }

  for (const entry of cfg.manifest) {
    const key = `${entry.subdir}::${entry.page}`;
    if (!fileKeys.has(key)) {
      violations.push({
        page: `${entry.subdir || "<root>"}/${entry.page}`,
        rule: "file-missing",
        detail: `Manifest declares ${entry.page} (subdir=${entry.subdir || "<root>"}) but no file present.`,
      });
    }
  }

  for (const entry of cfg.manifest) {
    const dir = entry.subdir ? join(cfg.pagesRoot, entry.subdir) : cfg.pagesRoot;
    const path = join(dir, `${entry.page}.tsx`);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");
    const label = `${entry.subdir || "<root>"}/${entry.page}`;

    if (entry.state === "degraded") {
      if (!hasEmptyStateGrammar(src)) {
        violations.push({
          page: label,
          rule: "degraded-must-render-empty",
          detail: "Page declared `degraded` but does not render an EmptyStateCard / PremiumEmptyState / setup-required state, nor a PageTruthBanner with truthState='partial|degraded|connecting'.",
        });
      }
      if (hasFakeLiveArray(src)) {
        violations.push({
          page: label,
          rule: "degraded-fake-live-array",
          detail: "Page declared `degraded` still contains a top-level hardcoded fixture array. Move to a demo fixture and gate via reality mode.",
        });
      }
      continue;
    }

    if (entry.state !== "fully-wired") continue;

    if (hasFakeLiveArray(src)) {
      violations.push({
        page: label,
        rule: "fake-live-array",
        detail: "Top-level hardcoded fixture array detected. Move to a demo fixture and gate via reality mode, or replace with a real query.",
      });
    }
    if (hasAuditStrippedFilter(src)) {
      violations.push({
        page: label,
        rule: "audit-stripped-filter",
        detail: "`([] as any[]).filter/map/...` shortcut detected — page renders an empty list while looking live.",
      });
    }
    if (!hasModuleDataImports(src)) {
      violations.push({
        page: label,
        rule: "no-data-imports",
        detail: "Page declared fully-wired but imports zero hooks / services / repositories.",
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
        detail: "Detected `setTimeout(() => setXxx(\"done\"|\"complete\"|\"success\"))` masquerading as real async work.",
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

  console.log(`\n📋 ${cfg.label} Production-Truth Check`);
  console.log(`   Manifest entries: ${cfg.manifest.length}`);
  console.log(`   Page files:       ${files.length}`);
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
    console.log(`✅ All ${cfg.label} pages pass production-truth checks.\n`);
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