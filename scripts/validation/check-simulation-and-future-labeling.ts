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

const ROOTS = ["src/pages", "src/components"];

// Words that, when present in JSX text, MUST appear in a file that also
// imports a canonical badge primitive.
const SENSITIVE_LABELS = [
  /\bComing\s+soon\b/i,
  /\bFuture\s+(?:feature|release|capability)\b/i,
  /\bDemo\b/,
  /\bSimulated\b/i,
  /\bArchived\b/,
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
