#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "responsive-operator-surfaces";
const ROOTS = ["src/pages/admin", "src/components/admin"];
const issues: GateIssue[] = [];

// Match a raw <table without an immediately-preceding overflow wrapper hint
// in the same file. Cheap heuristic: flag files that contain `<table` but
// do NOT contain `overflow-x-auto` or `overflow-auto`.
function* walk(dir: string): Generator<string> {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (e.endsWith(".tsx")) yield full;
  }
}

let scanned = 0;
const offenders: { file: string }[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    if (!content.includes("<table")) continue;
    if (content.includes("overflow-x-auto") || content.includes("overflow-auto")) continue;
    // shadcn <Table> auto-wraps; skip files importing it.
    if (/from\s+["']@\/components\/ui\/table["']/.test(content)) continue;
    offenders.push({ file: relative(process.cwd(), file) });
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "unwrapped-table",
    message: `${o.file}: <table> without overflow-x-auto wrapper — wrap in <div className="overflow-x-auto"> for narrow widths`,
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
    canonicalPattern: '<div className="overflow-x-auto"><table>...</table></div>',
    classification: "warn-tier-responsive-discipline",
  },
});
process.exit(ok ? 0 : 1);
