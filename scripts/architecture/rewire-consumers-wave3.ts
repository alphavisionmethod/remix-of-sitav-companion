#!/usr/bin/env node
// SITA OS — Consumer Rewire Wave 3
// Universal version: reads ALL wrapper files in src/lib (those marked with
// @lovable:migrated-wrapper), parses their canonical export target, and
// rewires every consumer in src/ to import from the canonical path directly.
// This is generic and idempotent — adding more wrappers = more rewires.

import * as fs from "fs";
import * as path from "path";

const WRAPPER_MARK = "// @lovable:migrated-wrapper";
const ROOT = path.resolve("src");

function findWrappers(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) findWrappers(p, out);
    else if (/\.(ts|tsx)$/.test(e)) {
      const c = fs.readFileSync(p, "utf8");
      if (c.startsWith(WRAPPER_MARK) || c.includes(WRAPPER_MARK)) out.push(p);
    }
  }
  return out;
}

const wrappers = findWrappers(path.resolve("src/lib"));
console.log(`Discovered ${wrappers.length} migrated wrappers in src/lib`);

// Build rewire map: @/lib/<rel-without-ext> → canonical from wrapper's export *
const rewireMap: Record<string, string> = {};
for (const w of wrappers) {
  const c = fs.readFileSync(w, "utf8");
  const m = c.match(/export\s+\*\s+from\s+["']([^"']+)["']/);
  if (!m) continue;
  const canonical = m[1];
  // wrapper path src/lib/foo/bar.ts → @/lib/foo/bar
  const rel = path.relative(path.resolve("src"), w).replace(/\\/g, "/").replace(/\.(ts|tsx)$/, "");
  const fromImport = `@/${rel}`;
  rewireMap[fromImport] = canonical;
}

console.log(`Built ${Object.keys(rewireMap).length} rewire mappings`);

const stats: Record<string, number> = {};
let filesTouched = 0;

function walk(dir: string, fn: (p: string) => void) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      // Skip the lib directory entirely — wrappers may legitimately import other wrappers
      if (p.includes(`${path.sep}lib${path.sep}`) || p.endsWith(`${path.sep}lib`)) continue;
      walk(p, fn);
    } else if (/\.(ts|tsx)$/.test(e)) fn(p);
  }
}

walk(ROOT, (file) => {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of Object.entries(rewireMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(from\\s+['"])${escaped}(['"])`, "g");
    const re2 = new RegExp(`(import\\s*\\(\\s*['"])${escaped}(['"])`, "g");
    let count = 0;
    src = src.replace(re, (_m, a, b) => { count++; return `${a}${to}${b}`; });
    src = src.replace(re2, (_m, a, b) => { count++; return `${a}${to}${b}`; });
    if (count > 0) {
      stats[from] = (stats[from] || 0) + count;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, src);
    filesTouched++;
  }
});

const total = Object.values(stats).reduce((s, n) => s + n, 0);
console.log(`\n✅ Rewired ${total} import sites across ${filesTouched} files`);
const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 30);
for (const [k, n] of sorted) console.log(`  ${String(n).padStart(4)}  ${k}`);

fs.mkdirSync("generated/lib-decomposition", { recursive: true });
fs.writeFileSync(
  "generated/lib-decomposition/consumer-rewire-wave3-report.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    wrappersDiscovered: wrappers.length,
    rewireMappings: Object.keys(rewireMap).length,
    totalRewireSites: total,
    filesTouched,
    perPath: stats,
  }, null, 2),
);
