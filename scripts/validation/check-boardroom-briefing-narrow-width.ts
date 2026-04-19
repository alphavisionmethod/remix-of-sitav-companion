#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "boardroom-briefing-narrow-width";
const ROOTS = ["src/pages/boardroom", "src/pages/business", "src/pages/admin/ai-runtime"];
const issues: GateIssue[] = [];

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (e.endsWith(".tsx") && /briefing/i.test(e)) yield full;
  }
}

const briefingFiles: string[] = [];
for (const root of ROOTS) {
  for (const f of walk(root)) briefingFiles.push(f);
}

if (briefingFiles.length === 0) {
  issues.push({
    severity: "warning",
    area: "no-briefing-surface",
    message: "No briefing surface files found — nothing to validate",
  });
}

let responsiveOk = 0;
const offenders: { file: string; reason: string }[] = [];
for (const file of briefingFiles) {
  const content = readFileSync(file, "utf-8");
  // Flag fixed-pixel widths > 600px which break narrow widths.
  const fixedWide = /\bw-\[(?:[7-9]\d{2}|[1-9]\d{3,})px\]/.exec(content);
  if (fixedWide) {
    offenders.push({ file: relative(process.cwd(), file), reason: `fixed-pixel width "${fixedWide[0]}"` });
    continue;
  }
  // Pass if it uses Card OR responsive grid OR overflow wrapper.
  const usesCard = /from\s+["']@\/components\/ui\/card["']/.test(content);
  const usesResponsiveGrid = /grid-cols-1[^"]*md:grid-cols-/.test(content);
  const usesOverflow = /overflow-(?:x-auto|auto)/.test(content);
  if (usesCard || usesResponsiveGrid || usesOverflow) responsiveOk++;
  else offenders.push({ file: relative(process.cwd(), file), reason: "no Card / responsive grid / overflow wrapper detected" });
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "narrow-width-risk",
    message: `${o.file}: ${o.reason}`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: briefingFiles=${briefingFiles.length} ok=${responsiveOk} offenders=${offenders.length}`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    briefingFilesScanned: briefingFiles.length,
    responsiveOk,
    offenderCount: offenders.length,
    classification: "warn-tier-narrow-width-discipline",
  },
});
process.exit(ok ? 0 : 1);
