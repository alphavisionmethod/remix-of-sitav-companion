#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B2 — dead pages check (warn-level).
// Lists pages on disk that have no route reference or lazy-import reference.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

function walk(d: string, acc: string[] = []): string[] {
  if (!existsSync(d)) return acc;
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    let s; try { s = statSync(f); } catch { continue; }
    if (s.isDirectory()) walk(f, acc);
    else if (/\.(ts|tsx)$/.test(e)) acc.push(f);
  }
  return acc;
}

const allFiles = walk("src");
const pageFiles = allFiles.filter((f) => f.startsWith("src/pages/") || f.startsWith("src/app/"));

// Build set of imported page paths
const referenced = new Set<string>();
const IMP = /["']([^"']+)["']/g;
for (const f of allFiles) {
  let c; try { c = readFileSync(f, "utf-8"); } catch { continue; }
  for (const m of c.matchAll(IMP)) {
    const s = m[1];
    if (s.includes("/pages/") || s.includes("/app/")) {
      referenced.add(s.replace(/^@\//, "src/").replace(/\.(ts|tsx)$/, ""));
    }
  }
}

const dead: string[] = [];
for (const p of pageFiles) {
  const rel = relative(".", p);
  const stem = rel.replace(/\.(ts|tsx)$/, "");
  // Match by suffix: any referenced path ending in this stem
  const isRef = [...referenced].some((r) => r === stem || r.endsWith(stem.replace(/^src\//, "")) || stem.endsWith(r.replace(/^src\//, "")));
  if (!isRef && !/index\.tsx?$/.test(rel)) dead.push(rel);
}

const BUDGET = 150;
const ok = dead.length <= BUDGET;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "dead-pages",
  totalPages: pageFiles.length,
  deadCount: dead.length,
  budget: BUDGET,
  level: "warn",
  ok,
  sample: dead.slice(0, 30),
};
writeFileSync(join(OUT, "dead-pages.json"), JSON.stringify(report, null, 2));
console.log(`dead-pages: ${dead.length}/${pageFiles.length} pages with no detected reference (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(0);
