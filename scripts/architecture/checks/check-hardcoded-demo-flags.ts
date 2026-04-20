#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 7 BLOCK Gate (#248)
// Detects hardcoded `const isDemoMode = true|false` declarations at
// module scope inside src/pages/** and src/components/** (excluding
// __tests__). These violate constraints/reality-mode-wiring which
// requires deriving demo state from useAuth().isDemo.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Hit {
  file: string;
  line: number;
  match: string;
}

const ROOTS = ["src/pages", "src/components"];
const EXCLUDE_DIR = "__tests__";
// Module-scope only: line begins at column 0
const PATTERN = /^(?:export\s+)?const\s+isDemoMode\s*=\s*(true|false)\s*;/;

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (entry === EXCLUDE_DIR) continue;
      out.push(...walk(full));
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const hits: Hit[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (PATTERN.test(lines[i])) {
        hits.push({ file, line: i + 1, match: lines[i].trim() });
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "hardcoded-demo-flags",
  ok: hits.length === 0,
  errorCount: hits.length,
  warningCount: 0,
  scannedRoots: ROOTS,
  hits,
  issues: hits.map((h) => ({
    severity: "error" as const,
    area: h.file,
    message: `Module-scope hardcoded demo flag at L${h.line}: ${h.match} — derive via useAuth().isDemo instead`,
  })),
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/hardcoded-demo-flags-report.json", JSON.stringify(report, null, 2));

if (hits.length > 0) {
  console.error(`❌ ${hits.length} hardcoded module-scope isDemoMode flag(s) found:`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.match}`);
  process.exit(1);
}
console.log("✅ No hardcoded module-scope isDemoMode flags in production paths");
