#!/usr/bin/env node
// Flagship Surface Closure — Trust Copy Alignment (WARN-tier hybrid)
//
// HONEST CLASSIFICATION
// IN-SCOPE (admin AI): scans the 2 admin AI surfaces for overclaim phrases — must PASS.
// OUT-OF-SCOPE (user-flagship): emits WARN-tier deferrals for the 4 deferred surfaces.
//
// Source-of-truth deferral docs:
//   generated/flagship-surface-closure/ONBOARDING_WIRING_AUDIT.md
//   generated/flagship-surface-closure/BOARDROOM_BRIEFING_CLOSURE_SPEC.md
//   generated/flagship-surface-closure/CONCIERGE_CHAT_CLOSURE_SPEC.md
//   generated/flagship-surface-closure/COMMUNICATIONS_INBOX_CLOSURE_SPEC.md
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "flagship-surface-trust-copy";
const issues: GateIssue[] = [];

const ADMIN_AI_SURFACES = [
  "src/pages/admin/ai-runtime",
  "src/components/admin/ai-runtime",
  "src/pages/admin/integrations",
];

// Phrases that overclaim AI/connector autonomy beyond proven runtime evidence.
const OVERCLAIM_PHRASES = [
  /\bfully autonomous\b/i,
  /\bself-acting\b/i,
  /\bguaranteed (?:to|reliability)\b/i,
  /\b(?:always|never) fails\b/i,
  /\b100% (?:reliable|accurate)\b/i,
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
for (const root of ADMIN_AI_SURFACES) {
  for (const f of walk(root)) {
    scanned++;
    const src = readFileSync(f, "utf8");
    for (const re of OVERCLAIM_PHRASES) {
      if (re.test(src)) {
        overclaimHits++;
        issues.push({
          severity: "error",
          area: "admin-ai-overclaim",
          message: `Overclaim phrase ${re} in ${f}`,
        });
      }
    }
  }
}

// Honest WARN-tier deferrals for the 4 user-flagship surfaces.
const DEFERRED = [
  { surface: "onboarding", doc: "generated/flagship-surface-closure/ONBOARDING_WIRING_AUDIT.md" },
  { surface: "boardroom-briefing", doc: "generated/flagship-surface-closure/BOARDROOM_BRIEFING_CLOSURE_SPEC.md" },
  { surface: "concierge", doc: "generated/flagship-surface-closure/CONCIERGE_CHAT_CLOSURE_SPEC.md" },
  { surface: "communications", doc: "generated/flagship-surface-closure/COMMUNICATIONS_INBOX_CLOSURE_SPEC.md" },
];
let docsPresent = 0;
for (const d of DEFERRED) {
  if (existsSync(d.doc)) {
    docsPresent++;
    issues.push({
      severity: "warning",
      area: `deferred-${d.surface}`,
      message: `Trust-copy review for ${d.surface} DEFERRED to user-flagship-pass. See ${d.doc}.`,
    });
  } else {
    issues.push({
      severity: "error",
      area: `deferral-marker-${d.surface}`,
      message: `Deferral doc missing: ${d.doc}`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "hybrid-pass-with-honest-warn-deferrals",
    adminAIScanned: scanned,
    adminAIOverclaimHits: overclaimHits,
    deferralDocsPresent: docsPresent,
    deferralDocsExpected: DEFERRED.length,
  },
});
process.exit(ok ? 0 : 1);
