#!/usr/bin/env node
// Trust-Copy — Boardroom Trust Copy (prompt-named, WARN-tier)
//
// Canonical first-class validator that scans Boardroom surfaces under
// src/pages/business/ for overclaim phrases that imply the continuous
// learning loop is fully operational when only v2 is pending.
//
// Per generated/trust-state-and-copy-closure/BOARDROOM_TRUST_COPY_SPEC.md:
//   - live recommendation loop  ✓ permitted
//   - continuous learning v2    ✗ MUST be labeled "future" / "v2 pending"
//
// Emits gate report; never blocks a build (WARN-tier).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "boardroom-trust-copy";
const issues: GateIssue[] = [];

const ROOTS = [
  "src/pages/business",
  "src/components/business/boardroom",
  "src/components/business/advisor-board",
];

// Phrases that overclaim the boardroom learning loop beyond runtime evidence.
const OVERCLAIM_PHRASES: Array<{ re: RegExp; label: string }> = [
  { re: /\bcontinuously learns?\b/i, label: "continuous-learning-overclaim" },
  { re: /\bself[- ]improving\b/i, label: "self-improving-overclaim" },
  { re: /\blearning loop is (?:live|active|operational)\b/i, label: "learning-loop-claimed-live" },
  { re: /\bautonomous boardroom\b/i, label: "autonomous-boardroom-overclaim" },
  { re: /\b100% (?:reliable|accurate|verified)\b/i, label: "absolute-reliability-claim" },
  { re: /\bfully autonomous\b/i, label: "fully-autonomous-claim" },
];

// Mitigators — when the same file references the future/pending nature, allow.
const MITIGATING_HINTS = [
  /\bv2 pending\b/i,
  /\bfuture (?:capability|feature|loop)\b/i,
  /\bcoming soon\b/i,
  /\bnot yet (?:active|live|operational)\b/i,
  /\broadmap\b/i,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".tsx") || e.endsWith(".ts")) out.push(p);
  }
  return out;
}

let scanned = 0;
let overclaimHits = 0;
for (const root of ROOTS) {
  for (const f of walk(root)) {
    scanned++;
    const src = readFileSync(f, "utf8");
    const mitigated = MITIGATING_HINTS.some((re) => re.test(src));
    for (const { re, label } of OVERCLAIM_PHRASES) {
      if (re.test(src) && !mitigated) {
        overclaimHits++;
        issues.push({
          severity: "warning",
          area: label,
          message: `Boardroom overclaim (${label}) in ${f} — must qualify with future/v2-pending or remove`,
        });
      }
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "warn-tier-trust-copy-guard",
    spec: "generated/trust-state-and-copy-closure/BOARDROOM_TRUST_COPY_SPEC.md",
    surfacesScanned: scanned,
    overclaimHits,
    distinguishes: ["live-recommendation-loop", "future-continuous-learning-v2"],
  },
});
process.exit(ok ? 0 : 1);
