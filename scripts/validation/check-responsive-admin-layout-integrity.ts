#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "responsive-admin-layout-integrity";

const ROOTS = ["src/pages/admin"];
const SKIP_DIRS = new Set(["__tests__", "fixtures"]);

const TABLE_OPEN = /<table\b/;
const HAS_OVERFLOW_GUARD = /(overflow-x-auto|overflow-auto|min-w-0|max-w-)/;

function* walk(dir: string): Generator<string> {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const full = join(dir, e);
    let s; try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (e.endsWith(".tsx")) yield full;
  }
}

const issues: GateIssue[] = [];
const offenders: { file: string; reason: string }[] = [];
let scanned = 0;
let withTables = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    if (!TABLE_OPEN.test(content)) continue;
    withTables++;
    if (!HAS_OVERFLOW_GUARD.test(content)) {
      offenders.push({
        file: relative(process.cwd(), file),
        reason: "<table> without overflow-x-auto / min-w-0 / max-w-* guard",
      });
    }
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "responsive-admin-layout",
    message: `${o.file}: ${o.reason}`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: scanned=${scanned} withTables=${withTables} offenders=${offenders.length}`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    scanned,
    withTables,
    offenders: offenders.length,
    classification: "warn-tier-adoption-tracker",
  },
});
process.exit(ok ? 0 : 1);
