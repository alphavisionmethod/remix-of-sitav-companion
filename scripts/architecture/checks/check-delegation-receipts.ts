#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI: Check Delegation Receipts
// Ensures DelegationTier changes go through proper engine methods
// and are not assigned directly in components or pages.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const TIER_ASSIGNMENT_PATTERNS = [
  /currentTier\s*=\s*["'](observe|suggest|draft|approval_every|approval_exceptions|bounded_recurring|expanded_recurring)["']/,
  /\.currentTier\s*=\s*/,
  /setCurrentTier\s*\(/,
];

const ALLOWED_DIRS = [
  "src/lib/engines",
  "src/lib/services/meta-governance",
  "src/test",
  "src/lib/types",
];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules")) files.push(...scanDir(full));
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

const violations: { file: string; line: number; match: string }[] = [];
const srcFiles = scanDir("src");

for (const file of srcFiles) {
  const relPath = path.relative(process.cwd(), file);
  if (ALLOWED_DIRS.some(d => relPath.startsWith(d))) continue;

  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of TIER_ASSIGNMENT_PATTERNS) {
      const match = lines[i].match(pattern);
      if (match) {
        violations.push({ file: relPath, line: i + 1, match: match[0] });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("✅ Delegation receipt check passed — no direct tier assignments outside engines/");
  process.exit(0);
} else {
  console.error(`❌ ${violations.length} delegation receipt violation(s):\n`);
  for (const v of violations) {
    console.error(`  [DIRECT_TIER_ASSIGNMENT] ${v.file}:${v.line}`);
    console.error(`    → ${v.match}\n`);
  }
  process.exit(1);
}
