#!/usr/bin/env node
// Trust-Copy — Concierge AI Trust Copy (prompt-named, WARN-tier)
//
// Canonical first-class validator scanning Concierge surfaces for copy that
// implies omniscient or fully autonomous AI when the runtime truth is
// gateway-governed, suggest-then-confirm.
//
// Per generated/trust-state-and-copy-closure/CONCIERGE_TRUST_COPY_SPEC.md:
//   - "I can suggest; you confirm"   ✓ canonical
//   - "I act for you autonomously"   ✗ overclaim
//
// Emits gate report; never blocks a build (WARN-tier).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "concierge-ai-trust-copy";
const issues: GateIssue[] = [];

const ROOTS = [
  "src/pages/concierge",
  "src/components/concierge",
];

const OVERCLAIM_PHRASES: Array<{ re: RegExp; label: string }> = [
  { re: /\bI (?:will )?(?:act|execute|do) (?:for you )?autonomously\b/i, label: "autonomous-action-claim" },
  { re: /\bfully autonomous concierge\b/i, label: "fully-autonomous-concierge" },
  { re: /\bknows everything\b/i, label: "omniscience-claim" },
  { re: /\balways (?:right|correct|accurate)\b/i, label: "always-correct-claim" },
  { re: /\bnever (?:fails|wrong)\b/i, label: "never-fails-claim" },
  { re: /\b100% (?:reliable|accurate)\b/i, label: "absolute-reliability-claim" },
  { re: /\bguaranteed (?:to|results?)\b/i, label: "guarantee-claim" },
];

const MITIGATING_HINTS = [
  /\bsuggests?\b/i,
  /\byou confirm\b/i,
  /\bgateway[- ]governed\b/i,
  /\bdegraded\b/i,
  /\bfallback\b/i,
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
          message: `Concierge overclaim (${label}) in ${f} — must align with gateway-governed suggest-then-confirm runtime truth`,
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
    spec: "generated/trust-state-and-copy-closure/CONCIERGE_TRUST_COPY_SPEC.md",
    surfacesScanned: scanned,
    overclaimHits,
    canonicalStance: "gateway-governed-suggest-then-confirm",
  },
});
process.exit(ok ? 0 : 1);
