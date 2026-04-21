#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Flag / Kill Switch Wiring Check (Layer 4)
// Verifies kill switches have code references and admin UI
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "feature-flag-wiring";
const issues: GateIssue[] = [];

// Known kill switches from the registry
const KNOWN_SWITCHES = [
  "KS-AI-GATEWAY", "KS-ADVISOR-BOARD", "KS-BOARDROOM", "KS-CHAOS",
  "KS-CONCIERGE", "KS-CONNECTORS", "KS-DATA-EXPORT", "KS-DR-DRILL",
  "KS-FILE-AI", "KS-FINANCE", "KS-INTEGRATIONS", "KS-INVESTMENT",
  "KS-MOBILE-SYNC", "KS-NOTIFICATIONS", "KS-ONBOARDING", "KS-SETUP",
  "KS-TRUST", "KS-WEBHOOKS",
];

function walk(dir: string): string[] {
  const r: string[] = [];
  try {
    for (const e of readdirSync(dir)) {
      const f = join(dir, e);
      if (statSync(f).isDirectory()) r.push(...walk(f));
      else if (/\.(tsx?|jsx?)$/.test(f)) r.push(f);
    }
  } catch { /* */ }
  return r;
}

// Scan all source for kill switch references
const allSource = walk("src").map(f => readFileSync(f, "utf-8")).join("\n");

let referenced = 0;
for (const ks of KNOWN_SWITCHES) {
  if (allSource.includes(ks)) {
    referenced++;
  } else {
    issues.push({ severity: "warning", area: "unreferenced", message: `Kill switch "${ks}" not referenced in application code` });
  }
}

// Check admin UI exists
if (!existsSync("src/pages/admin/AR08KillSwitchCenter.tsx")) {
  issues.push({ severity: "error", area: "admin-ui", message: "Kill switch admin UI missing" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "⚠"} ${GATE}: ${referenced}/${KNOWN_SWITCHES.length} kill switches referenced in code`);
issues.slice(0, 5).forEach(i => console.error(`  [${i.severity}] ${i.message}`));
emitGateReport({ gate: GATE, ok, issues, extra: { total: KNOWN_SWITCHES.length, referenced } });
process.exit(0);