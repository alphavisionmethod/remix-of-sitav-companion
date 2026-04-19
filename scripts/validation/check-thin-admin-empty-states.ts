#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "thin-admin-empty-states";
const ROOTS = ["src/pages/admin", "src/components/admin"];

// Raw thin-empty-state patterns (HTML or JSX text) that should adopt
// canonical primitives instead.
const THIN_PATTERNS: { re: RegExp; hint: string }[] = [
  { re: /<p[^>]*>\s*No\s+data(\s+available)?\s*[.…]?\s*<\/p>/i, hint: "<p>No data</p>" },
  { re: /<p[^>]*>\s*Nothing\s+(here|to\s+show)\s*[.…]?\s*<\/p>/i, hint: "<p>Nothing here</p>" },
  { re: /<div[^>]*>\s*No\s+results\s*[.…]?\s*<\/div>/i, hint: "<div>No results</div>" },
  { re: /<span[^>]*>\s*Empty\s*<\/span>/i, hint: "<span>Empty</span>" },
];

const SKIP = new Set([
  "EmptyState.tsx",
  "PremiumEmptyState.tsx",
  "BoardSection.tsx",
  "NeedsDataExplainer.tsx",
  "NeedsTimeWindowExplainer.tsx",
  "NeedsHistoricalReleasesExplainer.tsx",
]);

function* walk(dir: string): Generator<string> {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e);
    let s; try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (e.endsWith(".tsx") && !SKIP.has(e)) yield full;
  }
}

const issues: GateIssue[] = [];
const offenders: { file: string; hint: string }[] = [];
let scanned = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    for (const { re, hint } of THIN_PATTERNS) {
      if (re.test(content)) {
        offenders.push({ file: relative(process.cwd(), file), hint });
        break;
      }
    }
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "thin-empty-state",
    message: `${o.file}: thin empty-state "${o.hint}" — adopt EmptyState / PremiumEmptyState / BoardSection`,
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
    canonicalPrimitives: ["EmptyState", "PremiumEmptyState", "BoardSection"],
    classification: "warn-tier-adoption-tracker",
  },
});
process.exit(ok ? 0 : 1);
