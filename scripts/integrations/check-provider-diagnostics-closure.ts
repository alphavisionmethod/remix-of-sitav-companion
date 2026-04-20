#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Provider Diagnostics Closure Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

try {
  const { PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } = require("../../src/lib/integrations/provider-contract-registry");
  const withDiag = PROVIDER_IDS.filter((id: string) => PROVIDER_CONTRACT_REGISTRY[id].diagnosticsSupport);
  if (withDiag.length < PROVIDER_IDS.length) {
    issues.push({ severity: "warning", area: "diagnostics", message: `${withDiag.length}/${PROVIDER_IDS.length} providers have diagnostics` });
  }
  console.log(`  🩺 ${withDiag.length}/${PROVIDER_IDS.length} providers with diagnostics support`);
} catch (e) {
  issues.push({ severity: "error", area: "import", message: `Failed: ${e}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "provider-diagnostics-closure", ok, issues });
console.log(`Provider diagnostics closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);