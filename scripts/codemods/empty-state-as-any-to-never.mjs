#!/usr/bin/env node
// Codemod: replace ([] as any[]) with ([] as never[]) inside src/pages/**
// Type-safe Empty-State Honesty.
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/pages";
let filesChanged = 0;
let totalReplacements = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      walk(p);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\./.test(entry)) {
      const before = readFileSync(p, "utf8");
      // Bulk pattern: ([] as any[])
      const after = before.split("([] as any[])").join("([] as never[])");
      if (after !== before) {
        const n = before.split("([] as any[])").length - 1;
        writeFileSync(p, after);
        filesChanged++;
        totalReplacements += n;
      }
    }
  }
}

walk(ROOT);
console.log(`✅ codemod: ${totalReplacements} replacements across ${filesChanged} files`);
