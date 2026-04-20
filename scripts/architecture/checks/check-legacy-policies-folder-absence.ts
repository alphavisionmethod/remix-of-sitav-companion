#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Legacy `src/lib/policies/` Absence Gate
// Asserts that the phantom legacy folder `src/lib/policies/` does
// NOT exist on disk. The canonical home for policy logic is the
// singular `src/lib/policy/` (10 canonical files: actor-registry,
// approval-map, domain-map, enforcement-map, proof-requirements,
// reversibility-map, surface-map, trust-thresholds, unified-
// policy-matrix, plus index barrel).
//
// This gate also forbids string-literal references to the legacy
// path in source/scripts so the folder cannot be re-hallucinated
// via stale imports, docs, or codemods.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const LEGACY = "src/lib/policies";
const CANONICAL = "src/lib/policy";
const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

interface Violation {
  kind: "folder-present" | "canonical-missing" | "string-reference";
  path: string;
  line?: number;
  excerpt?: string;
}

const violations: Violation[] = [];

// 1. Legacy folder must not exist
if (existsSync(LEGACY)) {
  violations.push({ kind: "folder-present", path: LEGACY });
}

// 2. Canonical folder must exist
if (!existsSync(CANONICAL)) {
  violations.push({ kind: "canonical-missing", path: CANONICAL });
}

// 3. Scan src/ and scripts/ for string-literal references to the legacy path
const SCAN_ROOTS = ["src", "scripts"];
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "generated"]);
const FILE_EXTS = /\.(ts|tsx|js|jsx|mjs|cjs|json)$/;
// Match both forward and backslash variants
const NEEDLES = ["lib/policies", "lib\\policies"];
// Allow this file itself to mention the string for documentation
const SELF = "scripts/architecture/checks/check-legacy-policies-folder-absence.ts";

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(full));
    else if (FILE_EXTS.test(entry)) out.push(full);
  }
  return out;
}

const files: string[] = [];
for (const root of SCAN_ROOTS) files.push(...walk(root));

for (const file of files) {
  const rel = relative(".", file).replace(/\\/g, "/");
  if (rel === SELF) continue;
  let content: string;
  try { content = readFileSync(file, "utf8"); } catch { continue; }
  if (!NEEDLES.some((n) => content.includes(n))) continue;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (NEEDLES.some((n) => line.includes(n))) {
      violations.push({
        kind: "string-reference",
        path: rel,
        line: i + 1,
        excerpt: line.trim().slice(0, 200),
      });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "legacy-policies-folder-absence",
  legacyPath: LEGACY,
  canonicalPath: CANONICAL,
  scannedFiles: files.length,
  violations,
  ok: violations.length === 0,
  errorCount: violations.length,
};

writeFileSync(
  join(OUT_DIR, "legacy-policies-folder-absence-report.json"),
  JSON.stringify(report, null, 2),
);

console.log(
  `legacy-policies-folder-absence: ${violations.length} violation(s) across ${files.length} files`,
);
if (violations.length > 0) {
  for (const v of violations) {
    if (v.kind === "folder-present") {
      console.log(`  ❌ legacy folder exists on disk: ${v.path} — must be deleted; canonical is ${CANONICAL}`);
    } else if (v.kind === "canonical-missing") {
      console.log(`  ❌ canonical folder missing: ${v.path} — policy logic has no home`);
    } else {
      console.log(`  ❌ ${v.path}:${v.line} — references legacy 'lib/policies': ${v.excerpt}`);
    }
  }
  process.exit(1);
}
console.log(`  ✅ ${LEGACY} absent; ${CANONICAL} present (canonical)`);
process.exit(0);
