#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "no-dead-cta-on-production-surfaces";

// 5 in-scope flagship surfaces (AI Engineer team scope).
const SURFACES = [
  "src/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx",
  "src/components/admin/ai-runtime/ConnectorTruthSummaryPanel.tsx",
  "src/components/admin/integrations/IntegrationStreakPanel.tsx",
  "src/pages/concierge/ConciergeBoardroom.tsx",
];

// A <Button ...> tag is "dead" only when:
//   • it is not asChild
//   • it has no onClick / href / type="submit" / disabled
//   • it has no `to=` (router) inside the same opening tag
// We scan opening Button tags conservatively.
const BUTTON_OPEN = /<Button\b([^>]*)>/g;

const issues: GateIssue[] = [];
const offenders: { file: string; snippet: string }[] = [];
let scanned = 0;

for (const file of SURFACES) {
  if (!existsSync(file)) continue;
  scanned++;
  const content = readFileSync(file, "utf-8");
  let m: RegExpExecArray | null;
  while ((m = BUTTON_OPEN.exec(content))) {
    const attrs = m[1];
    const isAsChild = /\basChild\b/.test(attrs);
    const hasHandler = /\b(onClick|onSubmit|onPress|onChange)\s*=/.test(attrs);
    const hasHref = /\b(href|to)\s*=/.test(attrs);
    const isSubmit = /\btype\s*=\s*"submit"/.test(attrs);
    const isDisabled = /\bdisabled\b/.test(attrs);
    if (!isAsChild && !hasHandler && !hasHref && !isSubmit && !isDisabled) {
      offenders.push({ file, snippet: m[0].slice(0, 120) });
    }
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "dead-cta",
    message: `${o.file}: <Button> without onClick/href/asChild/submit ("${o.snippet}…")`,
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
    classification: "warn-tier-adoption-tracker",
  },
});
process.exit(ok ? 0 : 1);
