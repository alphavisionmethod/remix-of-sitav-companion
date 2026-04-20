#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Provider Refresh Closure Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

try {
  const { PROVIDER_REFRESH_POLICIES } = require("../../src/lib/integrations/provider-refresh-policy");
  const { PROVIDER_IDS } = require("../../src/lib/integrations/provider-contract-registry");
  const oauthProviders = PROVIDER_IDS.filter((id: string) => {
    const p = PROVIDER_REFRESH_POLICIES[id];
    return p && p.refreshCadenceMinutes > 0;
  });
  console.log(`  🔄 ${oauthProviders.length}/${PROVIDER_IDS.length} providers with active refresh policies`);
} catch (e) {
  issues.push({ severity: "error", area: "import", message: `Failed: ${e}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "provider-refresh-closure", ok, issues });
console.log(`Provider refresh closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);