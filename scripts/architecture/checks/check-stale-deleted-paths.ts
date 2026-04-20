#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Stale Deleted-Path Reference Check (Wave 2 hardening)
// After Wave 2, the following five folders were physically deleted
// from src/lib/ and their canonical homes adopted:
//   src/lib/canonical-backend/  → src/integrations/canonical-backend/
//   src/lib/simulation/         → src/domains/simulation/
//   src/lib/mock-data/          → src/data/fixtures/mock-data/
//   src/lib/demo-data/          → src/data/fixtures/demo-data/
//   src/lib/seed/               → src/data/fixtures/seed/
// This gate scans src/, tests/, generated/*.json, and docs/ for
// any string literal still referencing the deleted shim paths so
// regressions cannot silently reintroduce phantom references.
// Allowlist: archived migration scripts that document the move.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const DELETED_PATHS = [
  "src/lib/canonical-backend/",
  "src/lib/simulation/",
  "src/lib/mock-data/",
  "src/lib/demo-data/",
  "src/lib/seed/",
];

// Files that document the historical migration are allowed to mention
// the deleted paths (codemod sources, archival migration scripts, this
// gate itself, the audit log, and the resolution log artifact).
const ALLOWLIST_PATTERNS: RegExp[] = [
  /^scripts\/architecture\/perform-real-migration-wave\d+\.ts$/,
  /^scripts\/architecture\/rewire-consumers-wave\d+\.ts$/,
  /^scripts\/architecture\/checks\/check-stale-deleted-paths\.ts$/,
  /^scripts\/architecture\/checks\/check-cosmetic-debt-closure\.ts$/,
  /^scripts\/architecture\/checks\/check-lib-ownership-drift\.ts$/,
  /^scripts\/architecture\/checks\/check-residual-lib-canonicality\.ts$/,
  /^scripts\/migrate\//,
  /^public\/generated\/PROJECT_TREE_AUDIT\.md$/,
  /^docs\/architecture\/MIGRATION-BLUEPRINT\.md$/,
  /^docs\/refactor\//,
  // Generated artifacts (regenerated from disk by their producers; stale snapshots are
  // expected here until the next architecture mapping run rewrites them).
  /^generated\//,
];

const SCAN_DIRS = ["src", "tests", "docs"];
const SCAN_FILES_IN: { dir: string; ext: RegExp }[] = [
  { dir: "generated", ext: /\.json$/ },
];
const SOURCE_EXT = /\.(ts|tsx|js|jsx|md|json)$/;

interface Violation {
  file: string;
  line: number;
  match: string;
  excerpt: string;
}

const violations: Violation[] = [];

function isAllowlisted(rel: string): boolean {
  return ALLOWLIST_PATTERNS.some((re) => re.test(rel));
}

function scanFile(filePath: string) {
  const rel = relative(".", filePath).replaceAll("\\", "/");
  if (isAllowlisted(rel)) return;
  let content: string;
  try { content = readFileSync(filePath, "utf8"); } catch { return; }
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const dp of DELETED_PATHS) {
      if (lines[i].includes(dp)) {
        violations.push({
          file: rel,
          line: i + 1,
          match: dp,
          excerpt: lines[i].trim().slice(0, 200),
        });
      }
    }
  }
}

function walk(dir: string, extFilter?: RegExp) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      walk(full, extFilter);
    } else if (st.isFile()) {
      const filter = extFilter ?? SOURCE_EXT;
      if (filter.test(entry)) scanFile(full);
    }
  }
}

for (const d of SCAN_DIRS) walk(d);
for (const { dir, ext } of SCAN_FILES_IN) walk(dir, ext);

const report = {
  generatedAt: new Date().toISOString(),
  gate: "stale-deleted-paths",
  description: "Detects string-literal references to physically deleted Wave 2 shim folders.",
  deletedPaths: DELETED_PATHS,
  allowlistPatterns: ALLOWLIST_PATTERNS.map((r) => r.source),
  violations,
  ok: violations.length === 0,
  errorCount: violations.length,
};

writeFileSync(join(OUT_DIR, "stale-deleted-paths-report.json"), JSON.stringify(report, null, 2));

console.log(`stale-deleted-paths: ${violations.length} stale reference(s) found`);
if (violations.length > 0) {
  for (const v of violations.slice(0, 50)) {
    console.log(`  ❌ ${v.file}:${v.line} — ${v.match}`);
    console.log(`       ${v.excerpt}`);
  }
  if (violations.length > 50) console.log(`  ... and ${violations.length - 50} more`);
  process.exit(1);
}
console.log("✅ No stale references to deleted shim folders.");
process.exit(0);
