#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "qualified-surface-copy";

const SURFACES = [
  "src/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx",
  "src/components/admin/ai-runtime/ConnectorTruthSummaryPanel.tsx",
  "src/components/admin/integrations/IntegrationStreakPanel.tsx",
  "src/pages/concierge/ConciergeBoardroom.tsx",
];

// Phrases that overclaim runtime proof on qualified surfaces.
const OVERCLAIMS: { re: RegExp; hint: string }[] = [
  { re: /\bfully\s+autonomous\b/i, hint: "fully autonomous" },
  { re: /\balways\s+live\b/i, hint: "always live" },
  { re: /\b100%\s+verified\b/i, hint: "100% verified" },
  { re: /\bguaranteed\s+(live|delivery|accuracy)\b/i, hint: "guaranteed (live|delivery|accuracy)" },
  { re: /\bnever\s+fails\b/i, hint: "never fails" },
  { re: /\bzero[-\s]?downtime\b/i, hint: "zero-downtime" },
  { re: /\bperfect\s+(accuracy|reliability)\b/i, hint: "perfect (accuracy|reliability)" },
];

const issues: GateIssue[] = [];
const offenders: { file: string; hint: string }[] = [];
let scanned = 0;

for (const file of SURFACES) {
  if (!existsSync(file)) continue;
  scanned++;
  const content = readFileSync(file, "utf-8");
  for (const { re, hint } of OVERCLAIMS) {
    if (re.test(content)) {
      offenders.push({ file, hint });
    }
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "overclaim-copy",
    message: `${o.file}: contains overclaim phrase "${o.hint}" — soften to qualified language`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: scanned=${scanned} surfaces, offenders=${offenders.length}`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    surfaces: SURFACES,
    scanned,
    offenders: offenders.length,
    classification: "warn-tier-truth-copy",
  },
});
process.exit(ok ? 0 : 1);
