#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Health Checker
// Validates all edge functions have proper structure
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const functionsDir = "supabase/functions";
const required = ["brain-core", "event-processor", "connector-proxy", "admin-api", "admin-intelligence"];

interface FnStatus { name: string; hasIndex: boolean; hasTest: boolean; lines: number }
const statuses: FnStatus[] = [];

for (const fn of required) {
  const dir = path.join(functionsDir, fn);
  const indexPath = path.join(dir, "index.ts");
  const testPath = path.join(dir, "index_test.ts");
  const hasIndex = fs.existsSync(indexPath);
  const hasTest = fs.existsSync(testPath);
  const lines = hasIndex ? fs.readFileSync(indexPath, "utf-8").split("\n").length : 0;
  statuses.push({ name: fn, hasIndex, hasTest, lines });
}

console.log(`\n⚡ Edge Function Health Report\n`);
for (const s of statuses) {
  const status = s.hasIndex && s.hasTest ? "✅" : s.hasIndex ? "⚠️" : "❌";
  console.log(`  ${status} ${s.name} — ${s.lines} lines, test: ${s.hasTest ? "yes" : "missing"}`);
}

const allHealthy = statuses.every(s => s.hasIndex && s.hasTest);
if (!allHealthy) process.exit(1);
console.log(`\n  All ${required.length} edge functions healthy ✅\n`);
