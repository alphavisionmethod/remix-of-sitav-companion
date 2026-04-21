#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — ADVISORY: Kill-Switch & Retry/Fallback
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_REPLAY_MAP } from "../../../src/lib/backend-topology/edge-function-replay-map";
import { EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP } from "../../../src/lib/backend-topology/edge-function-runtime-consequence-map";
import { EDGE_FUNCTION_OWNERSHIP_MANIFEST } from "../../../src/lib/backend-topology/edge-function-owner-map";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

interface Issue { fn: string; severity: "warning"; message: string }
const issues: Issue[] = [];

const orchWebhook = EDGE_FUNCTION_REGISTRY.filter(f =>
  f.status === "active" && (f.category === "ORCHESTRATION_FUNCTION" || f.category === "CONNECTOR_WEBHOOK_FUNCTION")
);

for (const f of orchWebhook) {
  if (!EDGE_FUNCTION_REPLAY_MAP[f.name]) {
    issues.push({ fn: f.name, severity: "warning", message: "Orchestration/webhook missing replay-map entry" });
  }
}

// Critical functions without kill-switch
const critical = EDGE_FUNCTION_REGISTRY.filter(f => {
  const c = EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP[f.name];
  return f.status === "active" && c && (c.severity === "critical" || c.severity === "high");
});
for (const f of critical) {
  const owner = EDGE_FUNCTION_OWNERSHIP_MANIFEST[f.name];
  if (!owner?.killSwitchRef) {
    issues.push({ fn: f.name, severity: "warning", message: "High-severity function missing kill-switch ref" });
  }
}

writeFileSync(join(OUT, "edge-function-kill-switch-retry-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-kill-switch-retry",
  ok: true, warningCount: issues.length, issues,
}, null, 2));

console.log(`${issues.length === 0 ? "✅" : "⚠"} edge-function-kill-switch-retry: ${issues.length} warnings`);
process.exit(0);