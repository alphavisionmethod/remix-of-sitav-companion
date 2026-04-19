#!/usr/bin/env node
/* eslint-disable no-console */
// Validates the Slack nightly refresh proof exists in the last 24h.
// Honest behavior: if zero slack connector tokens exist, downgrades to WARN.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "slack-refresh-nightly";
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
  const sl = s.providers?.slack;
  const tokens = tokenCount("slack");
  if (!sl) {
    issues.push({ severity: "error", area: "slack", message: "slack entry missing" });
  } else if ((sl.successCount24h ?? 0) < 1) {
    if (tokens === 0) {
      issues.push({
        severity: "warning",
        area: "slack",
        message: `slack has 0 connector tokens — nothing to probe (launch-honest WARN)`,
      });
    } else {
      issues.push({
        severity: "error",
        area: "slack",
        message: `slack has 0 successful refresh probes in last 24h with ${tokens} tokens (failures=${sl.failureCount24h ?? 0})`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
