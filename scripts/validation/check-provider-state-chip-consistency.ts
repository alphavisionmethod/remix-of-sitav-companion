#!/usr/bin/env node
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "provider-state-chip-consistency";

// Files that are explicitly the canonical implementation are skipped.
const CANONICAL_FILES = new Set([
  "ConnectorStateBadge.tsx",
  "StatusBadge.tsx",
  "AIStateBadge.tsx",
  "ProvenanceChip.tsx",
  "connector-state-grammar.ts",
]);

// Provider-state words paired with hardcoded color classes (anti-pattern).
const PROVIDER_TERMS = /(provider|connector|oauth|integration|reauth|degraded|failing)/i;
const HARDCODED_COLORS = /(bg-(?:red|green|yellow|orange|emerald|amber|rose)-\d+)/;

// Restrict to admin & integration UI surfaces only — broader scope is noise.
const ROOTS = [
  "src/pages/admin",
  "src/components/admin/integrations",
  "src/components/admin/ai-runtime",
  "src/pages/communications",
];

function* walk(dir: string): Generator<string> {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e);
    let s; try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if ((e.endsWith(".tsx") || e.endsWith(".ts")) && !CANONICAL_FILES.has(e)) yield full;
  }
}

const issues: GateIssue[] = [];
const offenders: { file: string; line: number; snippet: string }[] = [];
let scanned = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned++;
    const lines = readFileSync(file, "utf-8").split(/\r?\n/);
    let providerContext = false;
    lines.forEach((line, i) => {
      if (PROVIDER_TERMS.test(line)) providerContext = true;
      if (providerContext && HARDCODED_COLORS.test(line)) {
        offenders.push({ file: relative(process.cwd(), file), line: i + 1, snippet: line.trim().slice(0, 120) });
      }
    });
  }
}

for (const o of offenders) {
  issues.push({
    severity: "warning",
    area: "hardcoded-provider-color",
    message: `${o.file}:${o.line}: provider-state context with hardcoded color — drive via ConnectorStateBadge`,
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
    canonical: "ConnectorStateBadge composes StatusBadge with grammar-derived tone",
    classification: "warn-tier-adoption-tracker",
  },
});
process.exit(ok ? 0 : 1);
