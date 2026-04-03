#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Single Brain Validator
// Ensures only ONE brain-core orchestration point exists.
// All domain engines must route through brain-core, never directly.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation { file: string; detail: string }
const violations: Violation[] = [];

function scanDir(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.includes("node_modules")) files.push(...scanDir(full, exts));
    else if (exts.some(x => e.name.endsWith(x))) files.push(full);
  }
  return files;
}

const srcFiles = scanDir("src/pages", [".ts", ".tsx"]);

for (const f of srcFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);

  // Pages should NOT call domain engines directly for orchestration
  if (content.includes("orchestrateIntent") && !rel.includes("DailyPulse")) {
    violations.push({ file: rel, detail: "Direct orchestrateIntent call — must go through brain-core hook" });
  }

  // No direct OpenAI/Gemini calls from pages
  if (content.includes("openai.") || content.includes("GoogleGenerativeAI")) {
    violations.push({ file: rel, detail: "Direct AI SDK call from page — must route through brain-core edge function" });
  }
}

if (violations.length === 0) {
  console.log("✅ Single-brain check passed — all orchestration flows through brain-core");
} else {
  console.error(`❌ ${violations.length} single-brain violation(s):\n`);
  for (const v of violations) console.error(`  [BRAIN] ${v.file}\n    → ${v.detail}\n`);
  process.exit(1);
}
