#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Provider Contract Closure Validator (BLOCK)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

try {
  const { PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } = require("../../src/lib/integrations/provider-contract-registry");
  const { PROVIDER_REFRESH_POLICIES } = require("../../src/lib/integrations/provider-refresh-policy");
  const { PROVIDER_RATE_LIMIT_POLICIES } = require("../../src/lib/integrations/provider-rate-limit-policy");
  const { PROVIDER_WEBHOOK_REPLAY_POLICIES } = require("../../src/lib/integrations/provider-webhook-replay-policy");

  if (PROVIDER_IDS.length < 15) {
    issues.push({ severity: "error", area: "registry", message: `Only ${PROVIDER_IDS.length}/15 providers registered` });
  }

  for (const id of PROVIDER_IDS) {
    const c = PROVIDER_CONTRACT_REGISTRY[id];
    if (!c.owner) issues.push({ severity: "error", area: id, message: `${id}: missing owner` });
    if (!c.credentialModel) issues.push({ severity: "error", area: id, message: `${id}: missing credential model` });
    if (!c.retryPolicy) issues.push({ severity: "error", area: id, message: `${id}: missing retry policy` });
    if (!c.rateLimitPolicy) issues.push({ severity: "error", area: id, message: `${id}: missing rate limit policy` });
    if (!PROVIDER_REFRESH_POLICIES[id]) issues.push({ severity: "warning", area: id, message: `${id}: no refresh policy` });
    if (!PROVIDER_RATE_LIMIT_POLICIES[id]) issues.push({ severity: "warning", area: id, message: `${id}: no rate limit policy` });
  }

  console.log(`  🔌 ${PROVIDER_IDS.length} providers with full contracts`);
} catch (e) {
  issues.push({ severity: "error", area: "import", message: `Failed: ${e}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "provider-contract-closure", ok, issues });
console.log(`Provider contract closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);