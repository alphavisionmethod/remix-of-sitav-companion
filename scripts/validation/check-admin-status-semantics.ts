#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-status-semantics";
const ROOTS = ["src/pages/admin", "src/components/admin"];
const issues: GateIssue[] = [];

// Hardcoded color classes that bypass StatusBadge canonical semantics.
const BANNED = [
  /\bbg-yellow-\d{2,3}\b/,
  /\btext-yellow-\d{2,3}\b/,
  /\bborder-yellow-\d{2,3}\b/,
  /\bbg-red-\d{2,3}\b/,
  /\btext-red-\d{2,3}\b/,
  /\bborder-red-\d{2,3}\b/,
  /\bbg-green-\d{2,3}\b/,
  /\btext-green-\d{2,3}\b/,
  /\bborder-green-\d{2,3}\b/,
  /\bbg-amber-\d{2,3}\b/,
  /\btext-amber-\d{2,3}\b/,
  /\bborder-amber-\d{2,3}\b/,
];

const SKIP = new Set(["StatusBadge.tsx"]);

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
const offenders: { file: string; cls: string }[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    for (const re of BANNED) {
      const m = content.match(re);
      if (m) offenders.push({ file: relative(process.cwd(), file), cls: m[0] });
    }
  }
}

for (const o of offenders.slice(0, 100)) {
  issues.push({
    severity: "warning",
    area: "hardcoded-color",
    message: `${o.file}: hardcoded color "${o.cls}" — use StatusBadge tone or semantic token`,
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
    canonicalPrimitive: "src/components/primitives/status/StatusBadge.tsx",
    classification: "warn-tier-color-discipline",
  },
});
process.exit(ok ? 0 : 1);
