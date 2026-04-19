#!/usr/bin/env node
// Trust-Copy — Communications Provider Copy (prompt-named, WARN-tier)
//
// Canonical first-class validator that ensures Communications surfaces never
// imply all connectors are equally live or equally automated. Live OAuth
// providers (Google / Microsoft / Slack) and manual long-tail providers must
// be distinguished by either a ConnectorStateBadge or explicit "manual"
// language.
//
// Per generated/trust-state-and-copy-closure/COMMUNICATIONS_TRUST_COPY_SPEC.md.
// Emits gate report; never blocks a build (WARN-tier).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "communications-provider-copy";
const issues: GateIssue[] = [];

const ROOTS = [
  "src/pages/communications",
  "src/components/communications",
  "src/pages/business/CommunicationsCenter.tsx",
  "src/pages/business/CRMCommunications.tsx",
];

const COLLAPSE_PHRASES: Array<{ re: RegExp; label: string }> = [
  { re: /\ball providers? (?:are )?(?:live|connected|automated|in sync)\b/i, label: "all-providers-live-claim" },
  { re: /\bevery (?:provider|connector) is (?:live|automated)\b/i, label: "every-provider-live-claim" },
  { re: /\b(?:fully|100%) (?:automated|connected) (?:inbox|messaging)\b/i, label: "fully-automated-inbox-claim" },
];

const DISTINCTION_HINTS = [
  /ConnectorStateBadge/,
  /\bmanual\b/i,
  /\blive OAuth\b/i,
  /\blong[- ]tail\b/i,
  /\bunsupported\b/i,
  /\bdegraded\b/i,
  /\breauth\b/i,
];

function walk(target: string): string[] {
  const out: string[] = [];
  if (!existsSync(target)) return out;
  const s = statSync(target);
  if (s.isFile()) {
    if (target.endsWith(".tsx") || target.endsWith(".ts")) out.push(target);
    return out;
  }
  for (const e of readdirSync(target)) {
    const p = join(target, e);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".tsx") || e.endsWith(".ts")) out.push(p);
  }
  return out;
}

let scanned = 0;
let collapseHits = 0;
for (const root of ROOTS) {
  for (const f of walk(root)) {
    scanned++;
    const src = readFileSync(f, "utf8");
    const distinguishes = DISTINCTION_HINTS.some((re) => re.test(src));
    for (const { re, label } of COLLAPSE_PHRASES) {
      if (re.test(src) && !distinguishes) {
        collapseHits++;
        issues.push({
          severity: "warning",
          area: label,
          message: `Communications copy (${label}) in ${f} blurs live OAuth vs manual providers — add ConnectorStateBadge or explicit "manual" language`,
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
    spec: "generated/trust-state-and-copy-closure/COMMUNICATIONS_TRUST_COPY_SPEC.md",
    surfacesScanned: scanned,
    collapseHits,
    distinguishes: ["live-oauth-google-ms-slack", "manual-long-tail-providers"],
  },
});
process.exit(ok ? 0 : 1);
