#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Post-Consolidation: Verify No Dangling Imports
// Searches entire codebase for imports of removed/wrapped paths
// to ensure no consumers were missed during migration.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "generated/lib-remediation/dangling-imports-report.json";
mkdirSync("generated/lib-remediation", { recursive: true });

// Paths that have been fully consolidated (wrapper deleted, canonical only)
// Add paths here as wrappers are removed in Phase 5
const REMOVED_PATHS: string[] = [];

function walk(dir: string, fn: (path: string) => void) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    try {
      if (statSync(p).isDirectory()) walk(p, fn);
      else if (/\.(ts|tsx|js|jsx)$/.test(e)) fn(p);
    } catch {}
  }
}

interface DanglingImport {
  file: string;
  line: number;
  importPath: string;
}

const danglers: DanglingImport[] = [];

walk("src", (file) => {
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const removed of REMOVED_PATHS) {
      if (lines[i].includes(`"${removed}"`) || lines[i].includes(`'${removed}'`)) {
        danglers.push({ file: relative(".", file), line: i + 1, importPath: removed });
      }
    }
  }
});

const report = {
  generatedAt: new Date().toISOString(),
  removedPathsChecked: REMOVED_PATHS.length,
  danglingImports: danglers.length,
  details: danglers,
  ok: danglers.length === 0,
};

writeFileSync(OUT, JSON.stringify(report, null, 2));

if (danglers.length > 0) {
  console.error(`❌ ${danglers.length} dangling import(s) found:`);
  for (const d of danglers) console.error(`  ${d.file}:${d.line} → ${d.importPath}`);
  process.exit(1);
} else {
  console.log(`✓ No dangling imports (${REMOVED_PATHS.length} removed paths checked)`);
  process.exit(0);
}