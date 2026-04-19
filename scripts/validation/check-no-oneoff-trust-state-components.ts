#!/usr/bin/env node
// Trust-Grade State Handling — No One-Off Empty-State Components
//
// Scans the entire `src/` tree for files matching `*EmptyState*.tsx` and flags
// any file outside the canonical allow-list as drift.
//
// WARN-tier. Emits gate report; never blocks a build during burndown.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "no-oneoff-trust-state-components";
const issues: GateIssue[] = [];

// Allow-list — canonical empty-state component files frozen by
// generated/trust-state-and-copy-closure/TRUST_STATE_SYSTEM_SPEC.md.
const ALLOW_LIST = new Set([
  "src/components/primitives/feedback/EmptyState.tsx",
  "src/components/primitives/feedback/PremiumEmptyState.tsx",
  "src/components/primitives/feedback/NeedsDataExplainer.tsx",
  "src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx",
  "src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx",
  "src/components/concierge/ConciergeEmptyState.tsx",
]);

const ROOT = "src";

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/EmptyState.*\.tsx$/.test(e)) out.push(p);
  }
  return out;
}

const candidates = walk(ROOT);
let allowed = 0;
let drift = 0;

for (const f of candidates) {
  const norm = f.replace(/\\/g, "/");
  if (ALLOW_LIST.has(norm)) {
    allowed++;
  } else {
    drift++;
    issues.push({
      severity: "warning",
      area: "oneoff-empty-state",
      message: `One-off empty-state component drift: ${norm} — fold into canonical primitives or add to allow-list with rationale`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "warn-tier-drift-guard",
    candidatesFound: candidates.length,
    allowedCanonical: allowed,
    driftOffenders: drift,
    allowList: Array.from(ALLOW_LIST),
  },
});
process.exit(ok ? 0 : 1);
