#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "simulation-disclosure-coverage";

const ROOTS = [
  "src/components/admin/ai-runtime",
  "src/components/admin/integrations",
  "src/pages/admin",
];

const SIM_TOKENS = /(simulated|demo[\s_-]?data|preview[\s_-]?only|fixture|mock|placeholder\s+data)/i;
const DISCLOSURE_TOKENS = /(SimulationBadge|DemoBadge|PreviewBadge|simulation-disclosure|"\s*Demo\s*"|"\s*Simulated\s*"|"\s*Preview\s*"|FutureLabel)/;

const SKIP = new Set(["TruthPanelActions.tsx"]);

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
const offenders: { file: string }[] = [];
let scanned = 0;
let withSim = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const content = readFileSync(file, "utf-8");
    if (!SIM_TOKENS.test(content)) continue;
    withSim++;
    if (!DISCLOSURE_TOKENS.test(content)) {
      offenders.push({ file: relative(process.cwd(), file) });
    }
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "missing-simulation-disclosure",
    message: `${o.file}: contains simulation/demo/preview tokens without an explicit disclosure badge`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: scanned=${scanned} withSim=${withSim} offenders=${offenders.length}`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    scanned,
    withSim,
    offenders: offenders.length,
    classification: "warn-tier-disclosure-coverage",
  },
});
process.exit(ok ? 0 : 1);
