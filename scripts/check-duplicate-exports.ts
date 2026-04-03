#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Duplicate Export Detector
// Finds exported functions with the same name across service layers
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry === "node_modules") continue;
      if (statSync(full).isDirectory()) results.push(...walk(full));
      else if (full.endsWith(".ts") && !full.endsWith(".test.ts") && !full.endsWith(".spec.ts")) results.push(full);
    }
  } catch { /* skip */ }
  return results;
}

const exportMap = new Map<string, string[]>();
const dirs = ["src/lib/services", "src/lib/engines", "src/lib/core-services"];

for (const dir of dirs) {
  for (const file of walk(dir)) {
    if (file.endsWith("/index.ts")) continue; // skip barrel re-exports
    const content = readFileSync(file, "utf-8");
    const matches = content.matchAll(/export\s+(?:function|const|class)\s+(\w+)/g);
    for (const m of matches) {
      const name = m[1];
      if (!exportMap.has(name)) exportMap.set(name, []);
      exportMap.get(name)!.push(file);
    }
  }
}

const duplicates = [...exportMap.entries()].filter(([, files]) => files.length > 1);

if (duplicates.length > 0) {
  console.warn(`⚠️  ${duplicates.length} duplicate export name(s) found across service layers:\n`);
  for (const [name, files] of duplicates) {
    console.warn(`  ${name}:`);
    for (const f of files) console.warn(`    → ${f}`);
    console.warn("");
  }
  // Warning only — don't fail CI yet until canonical sources resolved
  process.exit(0);
} else {
  console.log("✅ No duplicate export names across service layers");
}
