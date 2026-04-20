#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 7 Advisory Gate
// Counts TODO|FIXME|XXX|HACK markers across src/** (excluding tests
// and known doc-string/seed-list allowlist). Establishes a baseline
// budget on first run and warns on regression.
// Advisory only — does NOT block release.
// ═══════════════════════════════════════════════════════════════
import {
  readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const EXCLUDE_DIRS = new Set(["__tests__", "node_modules", ".git"]);
const PATTERN = /\b(TODO|FIXME|XXX|HACK)\b/;
const REPORT_PATH = "generated/stub-density-report.json";
const BASELINE_SLACK = 50;

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      out.push(...walk(full));
    } else if (
      full.endsWith(".ts") || full.endsWith(".tsx") ||
      full.endsWith(".js") || full.endsWith(".jsx")
    ) {
      out.push(full);
    }
  }
  return out;
}

let total = 0;
const byKind: Record<string, number> = { TODO: 0, FIXME: 0, XXX: 0, HACK: 0 };
const filesAffected = new Set<string>();

for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf-8").split("\n");
  for (const line of lines) {
    const m = line.match(PATTERN);
    if (m) {
      total++;
      byKind[m[1]] = (byKind[m[1]] || 0) + 1;
      filesAffected.add(file);
    }
  }
}

let baseline: number | null = null;
let prev: { baseline?: number } = {};
if (existsSync(REPORT_PATH)) {
  try {
    prev = JSON.parse(readFileSync(REPORT_PATH, "utf-8"));
    if (typeof prev.baseline === "number") baseline = prev.baseline;
  } catch { /* ignore */ }
}
if (baseline === null) baseline = total + BASELINE_SLACK;

const overBudget = total > baseline;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "stub-density",
  advisory: true,
  ok: !overBudget,
  errorCount: 0,
  warningCount: overBudget ? 1 : 0,
  total,
  byKind,
  filesAffected: filesAffected.size,
  baseline,
  budgetSlack: BASELINE_SLACK,
  issues: overBudget
    ? [{
        severity: "warning" as const,
        area: "src/**",
        message: `Stub density ${total} exceeds baseline budget ${baseline} (slack ${BASELINE_SLACK})`,
      }]
    : [],
};

mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`📊 Stub density: ${total} markers across ${filesAffected.size} files (baseline ${baseline})`);
console.log(`   TODO=${byKind.TODO}  FIXME=${byKind.FIXME}  XXX=${byKind.XXX}  HACK=${byKind.HACK}`);
if (overBudget) console.warn(`⚠️  Over baseline by ${total - baseline} markers (advisory only)`);
process.exit(0);
