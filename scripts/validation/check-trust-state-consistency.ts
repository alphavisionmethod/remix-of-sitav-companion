#!/usr/bin/env node
// Trust-Grade State Handling — Consistency
//
// Verifies that the 8 in-scope surfaces use canonical state primitives
// instead of raw `<p>No data…</p>` strings or one-off state widgets.
//
// WARN-tier. Emits gate report; never blocks a build during burndown.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "trust-state-consistency";
const issues: GateIssue[] = [];

const IN_SCOPE_ROOTS = [
  "src/pages/onboarding",
  "src/pages/business",
  "src/pages/concierge",
  "src/pages/communications",
  "src/pages/admin/ai-runtime",
  "src/pages/admin/integrations",
  "src/pages/admin/health",
  "src/pages/admin/releases",
  "src/pages/admin/support",
];

// Canonical primitives that, when imported, satisfy state-handling discipline.
const CANONICAL_IMPORT_HINTS = [
  "EmptyState",
  "PremiumEmptyState",
  "ConciergeEmptyState",
  "BoardSection",
  "Skeleton",
  "NeedsDataExplainer",
  "NeedsTimeWindowExplainer",
  "NeedsHistoricalReleasesExplainer",
  "AIStateBadge",
  "AIDegradedState",
  "StatusBadge",
  "ConnectorStateBadge",
  "OperatorActionPanel",
];

// Raw empty-state offender patterns — bare "No data" / "No items" strings
// in JSX text nodes without a canonical primitive in the same file.
const RAW_EMPTY_PATTERNS = [
  />\s*No (?:data|items|results|records|events)\.?\s*</i,
  />\s*Nothing (?:to show|here)\.?\s*</i,
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
let canonicalAdoption = 0;
let rawHits = 0;

for (const root of IN_SCOPE_ROOTS) {
  for (const f of walk(root)) {
    scanned++;
    const src = readFileSync(f, "utf8");
    const usesCanonical = CANONICAL_IMPORT_HINTS.some((h) =>
      new RegExp(`\\b${h}\\b`).test(src),
    );
    if (usesCanonical) canonicalAdoption++;

    for (const re of RAW_EMPTY_PATTERNS) {
      if (re.test(src) && !usesCanonical) {
        rawHits++;
        issues.push({
          severity: "warning",
          area: "raw-empty-state",
          message: `Raw empty-state string in ${f} without canonical primitive import`,
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
    classification: "warn-tier-regression-guard",
    surfacesScanned: scanned,
    canonicalAdoption,
    rawEmptyOffenders: rawHits,
  },
});
process.exit(ok ? 0 : 1);
