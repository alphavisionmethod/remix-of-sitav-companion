#!/usr/bin/env node
// Codemod: replace `as any[]` empty-array pattern with `as never[]` inside src/pages/**
// Safe: only swaps the type assertion on empty array literals, never on value coercions.
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/pages";
let filesChanged = 0;
let totalReplacements = 0;

// All replacements are exact string swaps targeting type-assertion-on-empty-array patterns.
// We do NOT touch value coercions like `(x as any).y` or `count as any`.
const REPLACEMENTS = [
  ["([] as any[])", "([] as never[])"],
  ["[] as any[]",   "[] as never[]"],   // bare form (e.g. `return [] as any[];`)
];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      walk(p);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\./.test(entry)) {
      let content = readFileSync(p, "utf8");
      const before = content;
      let localCount = 0;
      for (const [from, to] of REPLACEMENTS) {
        const n = content.split(from).length - 1;
        if (n > 0) {
          content = content.split(from).join(to);
          localCount += n;
        }
      }
      if (content !== before) {
        writeFileSync(p, content);
        filesChanged++;
        totalReplacements += localCount;
      }
    }
  }
}

walk(ROOT);
console.log(`✅ codemod: ${totalReplacements} replacements across ${filesChanged} files`);
