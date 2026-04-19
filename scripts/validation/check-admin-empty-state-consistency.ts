#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-empty-state-consistency";
const ROOTS = ["src/pages/admin", "src/components/admin"];
const issues: GateIssue[] = [];

// Raw inline empty-state text patterns to flag (case-insensitive).
const RAW_PATTERNS: RegExp[] = [
  /<p[^>]*>\s*No\s+\w+[\s\w]*available[^<]*<\/p>/i,
  /<p[^>]*>\s*No\s+data[^<]*<\/p>/i,
  /<p[^>]*>\s*Nothing\s+to\s+show[^<]*<\/p>/i,
  /<div[^>]*>\s*No\s+results[^<]*<\/div>/i,
];

// Skip canonical primitives themselves.
const SKIP = new Set([
  "BoardSection.tsx",
  "PremiumEmptyState.tsx",
  "EmptyState.tsx",
  "NeedsDataExplainer.tsx",
  "NeedsTimeWindowExplainer.tsx",
  "NeedsHistoricalReleasesExplainer.tsx",
]);

function* walk(dir: string): Generator<string> {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (e.endsWith(".tsx") && !SKIP.has(e)) yield full;
  }
}

let scanned = 0;
const offenders: { file: string; pattern: string }[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    for (const re of RAW_PATTERNS) {
      const m = content.match(re);
      if (m) {
        offenders.push({ file: relative(process.cwd(), file), pattern: m[0].slice(0, 80) });
        break;
      }
    }
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "raw-empty-state",
    message: `${o.file}: raw inline empty-state text found ("${o.pattern}…") — adopt PremiumEmptyState / EmptyState / BoardSection`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: scanned=${scanned} offenders=${offenders.length}`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    scanned,
    offenders: offenders.length,
    canonicalPrimitives: ["PremiumEmptyState", "EmptyState", "BoardSection",
      "NeedsDataExplainer", "NeedsTimeWindowExplainer", "NeedsHistoricalReleasesExplainer"],
    classification: "warn-tier-adoption-tracker",
  },
});
process.exit(ok ? 0 : 1);
