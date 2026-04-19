#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-microcopy-rules";
const ROOTS = ["src/pages/admin", "src/components/admin"];
const issues: GateIssue[] = [];

const BANNED_PHRASES = [
  /\bComing soon\b/i,
  /\bCheck back later\b/i,
  /\bNothing here yet\b/i,
  /\bStay tuned\b/i,
  /\bWhoops\b/i,
  /\bWorking on it\b/i,
];

const SKIP_FILES = new Set([
  "AdminCoherenceClosureTruthPanel.tsx",
  "AdminEmptyStateClosureTruthPanel.tsx",
]);

function* walk(dir: string): Generator<string> {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (e.endsWith(".tsx") && !SKIP_FILES.has(e)) yield full;
  }
}

let scanned = 0;
const offenders: { file: string; phrase: string }[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    for (const re of BANNED_PHRASES) {
      const m = content.match(re);
      if (m) offenders.push({ file: relative(process.cwd(), file), phrase: m[0] });
    }
  }
}

for (const o of offenders.slice(0, 100)) {
  issues.push({
    severity: "warning",
    area: "banned-phrase",
    message: `${o.file}: banned microcopy "${o.phrase}" — use operator-grade copy`,
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
    offenderCount: offenders.length,
    bannedPhrases: BANNED_PHRASES.map((r) => r.source),
    classification: "warn-tier-microcopy-discipline",
  },
});
process.exit(ok ? 0 : 1);
