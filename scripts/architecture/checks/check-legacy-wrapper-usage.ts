#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Legacy Wrapper Usage Check
// Counts every consumer import that targets a path in src/lib
// (excluding the canonical hot-path utils + internal allowlist).
// The number must trend toward zero as the decomposition completes.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const SCAN_ROOTS = ["src"];
const ALLOWED = [
  /^@\/lib\/utils(\/|$|\.ts)/,
  /^@\/lib\/internal(\/|$)/,
  /^@\/lib\/hooks(\/|$)/,
];

const LIB_IMPORT = /from ["'](@\/lib\/[^"']+)["']/g;

interface Counted { path: string; count: number; topConsumers: string[]; }

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

const counts = new Map<string, { count: number; consumers: Set<string> }>();
let scannedFiles = 0;

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    // Don't count src/lib's own internal imports.
    if (file.startsWith("src/lib/")) continue;
    scannedFiles++;
    const content = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    LIB_IMPORT.lastIndex = 0;
    while ((m = LIB_IMPORT.exec(content)) !== null) {
      const importPath = m[1];
      if (ALLOWED.some(r => r.test(importPath))) continue;
      const slot = counts.get(importPath) ?? { count: 0, consumers: new Set<string>() };
      slot.count++;
      slot.consumers.add(relative(".", file));
      counts.set(importPath, slot);
    }
  }
}

const ranked: Counted[] = [...counts.entries()]
  .map(([path, v]) => ({ path, count: v.count, topConsumers: [...v.consumers].slice(0, 5) }))
  .sort((a, b) => b.count - a.count);

const totalImports = ranked.reduce((s, r) => s + r.count, 0);
const distinctPaths = ranked.length;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "legacy-wrapper-usage",
  scannedFiles,
  totalLegacyImports: totalImports,
  distinctLegacyPaths: distinctPaths,
  topPaths: ranked.slice(0, 30),
  ok: true,                        // tracked, not gated
  errorCount: 0,
  warningCount: totalImports,
};

writeFileSync(join(OUT_DIR, "legacy-wrapper-usage-report.json"), JSON.stringify(report, null, 2));
console.log(
  `legacy-wrapper-usage: ${totalImports} import(s) across ${distinctPaths} legacy path(s) (target: 0)`,
);
if (ranked.length > 0) {
  console.log("Top 5:");
  for (const r of ranked.slice(0, 5)) console.log(`  ${r.count.toString().padStart(4)}  ${r.path}`);
}
process.exit(0);
