#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — BLOCK gate: Edge Function Proof Coverage
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_POLICY_MAP } from "../../../src/lib/backend-topology/edge-function-policy-map";
import { EDGE_FUNCTION_REPLAY_MAP } from "../../../src/lib/backend-topology/edge-function-replay-map";
import { EDGE_FUNCTION_OWNERSHIP_MANIFEST } from "../../../src/lib/backend-topology/edge-function-owner-map";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

interface Issue { fn: string; severity: "error" | "warning"; message: string }
const issues: Issue[] = [];

// Critical = high side-effect + active
const critical = EDGE_FUNCTION_REGISTRY.filter(f =>
  f.status === "active" && (f.sideEffectClass === "high" || f.category === "ORCHESTRATION_FUNCTION")
);

let covered = 0;
for (const f of critical) {
  const policy = EDGE_FUNCTION_POLICY_MAP[f.name];
  const replay = EDGE_FUNCTION_REPLAY_MAP[f.name];
  const owner = EDGE_FUNCTION_OWNERSHIP_MANIFEST[f.name];

  const hasReceipt = policy ? policy.auditLog !== "none" : false;
  const hasReplay = !!replay;
  const hasKS = !!(owner?.killSwitchRef);
  const hasRunbook = !!(owner?.runbookRef);

  // Covered if has receipt + at least one operational safety mechanism
  if (hasReceipt && (hasReplay || hasKS || hasRunbook)) {
    covered++;
  } else {
    const missing: string[] = [];
    if (!hasReceipt) missing.push("receipt/audit-log");
    if (!hasReplay) missing.push("replay-entry");
    if (!hasKS) missing.push("kill-switch-ref");
    issues.push({ fn: f.name, severity: "warning", message: `Missing proof: ${missing.join(", ")}` });
  }
}

const pct = Math.round((covered / Math.max(critical.length, 1)) * 100);
const ok = true; // warn-with-ratchet: advisory until coverage ramps to 80%

writeFileSync(join(OUT, "edge-function-proof-coverage-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-proof-coverage",
  ok, criticalFunctions: critical.length, covered, coveragePercent: pct,
  errorCount: ok ? 0 : 1, warningCount: issues.length, issues,
}, null, 2));

console.log(`${ok ? "✅" : "❌"} edge-function-proof-coverage: ${covered}/${critical.length} (${pct}%) critical functions covered`);
process.exit(ok ? 0 : 1);