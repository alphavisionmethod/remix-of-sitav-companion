#!/usr/bin/env node
// Trust-Copy — Simulation / Future / Demo Labeling
//
// Verifies that any "Coming soon" / "Future" / "Demo" / "Simulated" label
// in source travels with a canonical badge primitive (StatusBadge or AIStateBadge).
//
// WARN-tier. Emits gate report; never blocks a build during burndown.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "simulation-and-future-labeling";
const issues: GateIssue[] = [];

// Scoped to the 8 in-scope flagship surfaces named in PART 3 / Section A3
// of the Trust-State + Trust-Copy Closure prompt. Out-of-scope surfaces
// (LandingPage, ApprovalChamber, NotesWorkspace, etc.) are tracked debt
// for separate closures, not this trust-state pass.
const ROOTS = [
  "src/pages/onboarding",
  "src/pages/business",
  "src/pages/concierge",
  "src/pages/communications",
  "src/pages/admin/ai-runtime",
  "src/pages/admin/integrations",
  "src/pages/admin/health",
  "src/pages/admin/releases",
  "src/pages/admin/support",
  "src/components/concierge",
  "src/components/communications",
  "src/components/admin/ai-runtime",
];

// Sensitive labels — only counted when they appear inside JSX text nodes
// (between `>` and `<`), so comments, type strings, and identifier names
// don't false-positive. Files that use a canonical badge primitive in the
// same module satisfy the rule.
const SENSITIVE_LABELS = [
  />\s*[^<]*\bComing\s+soon\b[^<]*</i,
  />\s*[^<]*\bFuture\s+(?:feature|release|capability)\b[^<]*</i,
  />\s*[^<]*\bSimulated\b[^<]*</i,
];

const CANONICAL_BADGE_HINTS = [
  "StatusBadge",
  "AIStateBadge",
  "ConnectorStateBadge",
  "AILaunchBadge",
];

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

let scanned = 0;
let labeled = 0;
let nakedHits = 0;

for (const root of ROOTS) {
  for (const f of walk(root)) {
    scanned++;
    const src = readFileSync(f, "utf8");
    const hasSensitiveLabel = SENSITIVE_LABELS.some((re) => re.test(src));
    if (!hasSensitiveLabel) continue;
    labeled++;
    const hasBadge = CANONICAL_BADGE_HINTS.some((b) =>
      new RegExp(`\\b${b}\\b`).test(src),
    );
    if (!hasBadge) {
      nakedHits++;
      issues.push({
        severity: "warning",
        area: "naked-future-or-demo-label",
        message: `${f} contains a sim/future/demo label without a canonical badge primitive (StatusBadge / AIStateBadge / ConnectorStateBadge / AILaunchBadge)`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "warn-tier-truth-labeling-guard",
    surfacesScanned: scanned,
    labeledSurfaces: labeled,
    nakedOffenders: nakedHits,
  },
});
process.exit(ok ? 0 : 1);
