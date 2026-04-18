#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 5b: Truly Zero-Consumer Wrapper Removal
// Corrects Wave 5a's flawed scan (which excluded src/lib/ from the
// consumer count). Scans ALL of src/ including src/lib/ — so any
// wrapper consumed transitively by another lib file is preserved.
// A wrapper is removed only if it has 0 references anywhere except
// itself.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src/lib";
const OUT = "generated/lib-remediation/wave5b-wrapper-removal.json";
mkdirSync("generated/lib-remediation", { recursive: true });

function walk(dir, fn) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, fn);
    else if (/\.(ts|tsx)$/.test(e)) fn(p);
  }
}

const wrappers = [];
walk(ROOT, (file) => {
  const c = readFileSync(file, "utf8");
  if (!c.includes("@lovable:migrated-wrapper")) return;
  const rel = relative("src", file).replace(/\\/g, "/").replace(/\.(ts|tsx)$/, "");
  wrappers.push({ file, importPath: `@/${rel}` });
});

const consumerCount = new Map();
for (const w of wrappers) consumerCount.set(w.importPath, 0);

walk("src", (file) => {
  // Skip the wrapper file itself but count everything else, including src/lib/.
  const content = readFileSync(file, "utf8");
  for (const w of wrappers) {
    if (file === w.file) continue;
    if (content.includes(`"${w.importPath}"`) || content.includes(`'${w.importPath}'`)) {
      consumerCount.set(w.importPath, (consumerCount.get(w.importPath) ?? 0) + 1);
    }
  }
});

const removed = [];
const kept = [];
for (const w of wrappers) {
  const n = consumerCount.get(w.importPath) ?? 0;
  if (n === 0) { try { unlinkSync(w.file); removed.push(w.file); } catch {} }
  else kept.push({ path: w.importPath, consumers: n });
}

writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  wave: "5b",
  totalWrappers: wrappers.length,
  removed: removed.length,
  kept: kept.length,
  removedFiles: removed,
  keptTop: kept.sort((a,b)=>b.consumers-a.consumers).slice(0, 50),
}, null, 2));

console.log(`Wave 5b removal: removed ${removed.length}, kept ${kept.length}`);
