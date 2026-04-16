#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI: Check Scoring Boundaries
// Ensures no scoring/debt logic exists outside src/lib/engines/
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const SCORING_PATTERNS = [
  // Only catch class instantiation and definition — NOT method calls via engine references
  /new TrustDebtEngine\b/,
  /new ExecutionDebtEngine\b/,
  /new DragEngine\b/,
  /new ReadinessEngine\b/,
  /new InvisibleLaborEngine\b/,
  /new FounderBottleneckEngine\b/,
  /new DelegationEngine\b/,
  /new WorkspaceViewEngine\b/,
  /new MetaGovernanceEngine\b/,
  // Catch inline scoring logic (function definitions, not calls)
  /function\s+computeDebtScore/,
  /function\s+computeAgingTier/,
  /function\s+computeAging\b/,
  /function\s+computeBurdenDistribution/,
];

const ALLOWED_DIRS = [
  "src/lib/engines",
  "src/lib/services/meta-governance",
  "src/test",
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

const violations: { file: string; pattern: string; line: number }[] = [];
const srcFiles = scanDir("src");

for (const file of srcFiles) {
  const relPath = path.relative(process.cwd(), file);
  if (ALLOWED_DIRS.some(d => relPath.startsWith(d))) continue;
  
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of SCORING_PATTERNS) {
      if (pattern.test(lines[i])) {
        violations.push({ file: relPath, pattern: pattern.source, line: i + 1 });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("✅ Scoring boundary check passed — no scoring logic outside engines/");
  process.exit(0);
} else {
  console.error(`❌ ${violations.length} scoring boundary violation(s):\n`);
  for (const v of violations) {
    console.error(`  [SCORING_OUTSIDE_ENGINE] ${v.file}:${v.line}`);
    console.error(`    → Pattern: ${v.pattern}\n`);
  }
  process.exit(1);
}
