#!/usr/bin/env node
/* eslint-disable no-console */
// Validates every connector_registry row not in {google,microsoft,slack} is honestly classified as manual.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "long-tail-provider-classification";
const STATUS = "generated/connector-truth-closure/connector-truth-verification.json";
const LIVE = new Set(["google", "microsoft", "slack"]);
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const reg = s.connectorRegistry ?? [];
  const violators: string[] = [];
  for (const r of reg) {
    if (LIVE.has(r.provider)) continue;
    // Must NOT be advertising oauth2 + refresh_supported as if it were live.
    if (r.auth_method === "oauth2" && r.refresh_supported === true) {
      violators.push(`${r.connector_id} (provider=${r.provider})`);
    }
  }
  if (violators.length > 0) {
    issues.push({
      severity: "error",
      area: "registry",
      message: `Long-tail providers misclassified as live OAuth refresh: ${violators.slice(0, 10).join(", ")}${violators.length > 10 ? ` (+${violators.length - 10} more)` : ""}`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
