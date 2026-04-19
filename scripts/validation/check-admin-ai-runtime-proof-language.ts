#!/usr/bin/env node
// Trust-Copy — Admin AI Runtime Proof Language (prompt-named, WARN-tier)
//
// Canonical first-class validator scanning admin AI runtime surfaces for
// "collapsed proof" phrases that fail to distinguish:
//   structurally-wired   →  code/route/table exists
//   behaviorally-proven  →  exercised in CI / E2E
//   nightly-verified     →  ai_runtime_nightly_runs passing
//   degraded             →  fallback path active or budget tripped
//
// Per generated/trust-state-and-copy-closure/ADMIN_AI_RUNTIME_TRUST_COPY_SPEC.md.
// Emits gate report; never blocks a build (WARN-tier).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-ai-runtime-proof-language";
const issues: GateIssue[] = [];

const ROOTS = [
  "src/pages/admin/ai-runtime",
  "src/components/admin/ai-runtime",
  "src/pages/admin/AIRuntimeStatus.tsx",
];

// Collapsed proof phrases — collapse the 4-tier truth into a single claim.
const COLLAPSED_PROOF_PHRASES: Array<{ re: RegExp; label: string }> = [
  { re: /\bfully verified\b/i, label: "fully-verified-collapse" },
  { re: /\bfully proven\b/i, label: "fully-proven-collapse" },
  { re: /\b100% live\b/i, label: "100-percent-live-collapse" },
  { re: /\bfully operational\b/i, label: "fully-operational-collapse" },
  { re: /\beverything (?:is )?healthy\b/i, label: "everything-healthy-collapse" },
  { re: /\b(?:complete|total) runtime proof\b/i, label: "complete-runtime-proof-collapse" },
];

// Mitigators — files that expose the 4-tier distinction are allowed.
const TIER_HINTS = [
  /structurally[- ]wired/i,
  /behaviorally[- ]proven/i,
  /nightly[- ]verified/i,
  /degraded/i,
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
    const distinguishesTiers = TIER_HINTS.filter((re) => re.test(src)).length >= 2;
    for (const { re, label } of COLLAPSED_PROOF_PHRASES) {
      if (re.test(src) && !distinguishesTiers) {
        collapseHits++;
        issues.push({
          severity: "warning",
          area: label,
          message: `Admin AI runtime collapsed proof (${label}) in ${f} — must distinguish structurally-wired / behaviorally-proven / nightly-verified / degraded`,
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
    classification: "warn-tier-proof-language-guard",
    spec: "generated/trust-state-and-copy-closure/ADMIN_AI_RUNTIME_TRUST_COPY_SPEC.md",
    surfacesScanned: scanned,
    collapseHits,
    proofTiers: [
      "structurally-wired",
      "behaviorally-proven",
      "nightly-verified",
      "degraded",
    ],
  },
});
process.exit(ok ? 0 : 1);
