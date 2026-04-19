#!/usr/bin/env node
/* eslint-disable no-console */
// Validates the Google nightly refresh proof exists in the last 24h.
// Honest behavior: if zero google connector tokens exist in the system,
// downgrades to WARN (no tokens means nothing to probe — not a failure).
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "google-refresh-nightly";
const STATUS = "generated/connector-truth-closure/connector-provider-status.json";
const issues: GateIssue[] = [];

function tokenCount(provider: string): number {
  if (!process.env.PGHOST) return -1;
  try {
    const out = execSync(
      `psql -tAX -c "SELECT COUNT(*) FROM connector_tokens WHERE provider='${provider}'"`,
      { encoding: "utf-8" },
    ).trim();
    return parseInt(out, 10) || 0;
  } catch {
    return -1;
  }
}

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run npm run connector:truth:emit` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const g = s.providers?.google;
  const tokens = tokenCount("google");
  if (!g) {
    issues.push({ severity: "error", area: "google", message: "google provider entry missing in status JSON" });
  } else if ((g.successCount24h ?? 0) < 1) {
    if (tokens === 0) {
      issues.push({
        severity: "warning",
        area: "google",
        message: `google has 0 connector tokens — nothing to probe (launch-honest WARN, not failure)`,
      });
    } else {
      issues.push({
        severity: "error",
        area: "google",
        message: `google has 0 successful refresh probes in last 24h with ${tokens} tokens (failures=${g.failureCount24h ?? 0})`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
