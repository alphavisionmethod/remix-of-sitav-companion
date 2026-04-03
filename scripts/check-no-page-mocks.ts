#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No Page Mock Import Validator
// Ensures no page file imports from @/lib/mocks directly
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) results.push(full);
  }
  return results;
}

const violations: string[] = [];
const pages = walk("src/pages");

for (const file of pages) {
  const content = readFileSync(file, "utf-8");
  if (content.includes('from "@/lib/mocks"') || content.includes("from '@/lib/mocks'")) {
    violations.push(file);
  }
}

if (violations.length > 0) {
  console.error("❌ Pages importing from @/lib/mocks (must use hooks or engines instead):");
  violations.forEach(v => console.error(`   ${v}`));
  process.exit(1);
} else {
  console.log("✅ No pages import from @/lib/mocks");
}
