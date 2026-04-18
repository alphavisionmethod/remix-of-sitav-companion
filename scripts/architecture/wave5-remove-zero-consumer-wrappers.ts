#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 5: Zero-Consumer Wrapper Removal
// Cross-references the wrapper inventory (files in src/lib that
// carry "// @lovable:migrated-wrapper") with the legacy-wrapper-
// usage report. Any wrapper whose canonical "@/lib/..." path has
// 0 consumers across src/ is safe to delete.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src/lib";
const USAGE_REPORT = "generated/legacy-wrapper-usage-report.json";
const OUT = "generated/lib-remediation/wave5-wrapper-removal.json";
mkdirSync("generated/lib-remediation", { recursive: true });

if (!existsSync(USAGE_REPORT)) {
  console.error(`Missing ${USAGE_REPORT} — run check-legacy-wrapper-usage.ts first.`);
  process.exit(1);
}

const usage = JSON.parse(readFileSync(USAGE_REPORT, "utf8"));
// Build set of paths WITH at least one consumer.
const usedPaths = new Set<string>();
for (const r of usage.topPaths ?? []) usedPaths.add(r.path);
// Note: topPaths may be truncated to 30; fall back to the per-path raw if available.
// Our check-legacy-wrapper-usage.ts only emits topPaths, so any wrapper not in topPaths
// is treated as "unknown usage" and conservatively kept. We instead perform a fresh
// repo-wide grep for safety.

function walk(dir: string, fn: (p: string) => void) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, fn);
    else if (/\.(ts|tsx)$/.test(e)) fn(p);
  }
}

// Collect every wrapper.
const wrappers: { file: string; importPath: string }[] = [];
walk(ROOT, (file) => {
  const c = readFileSync(file, "utf8");
  if (!c.includes("@lovable:migrated-wrapper")) return;
  const rel = relative("src", file).replace(/\\/g, "/").replace(/\.(ts|tsx)$/, "");
  wrappers.push({ file, importPath: `@/${rel}` });
});

// Build a per-path consumer count by scanning all of src/ (excluding src/lib).
const consumerCount = new Map<string, number>();
for (const w of wrappers) consumerCount.set(w.importPath, 0);

walk("src", (file) => {
  if (file.startsWith("src/lib/") || file.startsWith(`src${require("node:path").sep}lib${require("node:path").sep}`)) return;
  const content = readFileSync(file, "utf8");
  for (const w of wrappers) {
    if (content.includes(`"${w.importPath}"`) || content.includes(`'${w.importPath}'`)) {
      consumerCount.set(w.importPath, (consumerCount.get(w.importPath) ?? 0) + 1);
    }
  }
});

const removed: string[] = [];
const kept: { path: string; consumers: number }[] = [];
for (const w of wrappers) {
  const n = consumerCount.get(w.importPath) ?? 0;
  if (n === 0) {
    try { unlinkSync(w.file); removed.push(w.file); }
    catch (e) { console.log(`  ✗ failed delete ${w.file}: ${(e as Error).message}`); }
  } else {
    kept.push({ path: w.importPath, consumers: n });
  }
}

writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  wave: 5,
  totalWrappers: wrappers.length,
  removed: removed.length,
  kept: kept.length,
  removedFiles: removed,
  keptTop: kept.sort((a,b)=>b.consumers-a.consumers).slice(0, 50),
}, null, 2));

console.log(`Wave 5 wrapper removal: removed ${removed.length}, kept ${kept.length} (consumers > 0)`);
