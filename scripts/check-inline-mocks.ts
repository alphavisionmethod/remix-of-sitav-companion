#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Inline Mock Data Detector
// Finds pages with hardcoded mock/demo data arrays
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else if (full.endsWith(".tsx")) results.push(full);
  }
  return results;
}

const violations: { file: string; patterns: string[] }[] = [];
const PATTERNS = [
  /const\s+mock\w+\s*[:=]/i,
  /const\s+MOCK_\w+\s*[:=]/,
  /const\s+demo\w+\s*[:=]/i,
];

for (const file of walk("src/pages")) {
  const content = readFileSync(file, "utf-8");
  const found: string[] = [];
  for (const pat of PATTERNS) {
    if (pat.test(content)) found.push(pat.source);
  }
  if (found.length > 0) violations.push({ file, patterns: found });
}

if (violations.length > 0) {
  console.warn(`⚠️  ${violations.length} page(s) contain inline mock/demo data:\n`);
  for (const v of violations) {
    console.warn(`  ${v.file}`);
    for (const p of v.patterns) console.warn(`    pattern: ${p}`);
  }
  console.warn("\n  Replace with engine data via useOSRuntime or domain hooks.\n");
  // Warning for now — track toward zero
  process.exit(0);
} else {
  console.log("✅ No inline mock data in pages");
}
