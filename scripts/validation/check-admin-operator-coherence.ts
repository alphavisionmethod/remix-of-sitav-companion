#!/usr/bin/env node
/* eslint-disable no-console */
// Asserts every admin domain has all 9 operator-usability criteria classified
// and at minimum is registry-backed AND actionable.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/final-proof-verification/admin-operator-coherence-status.json";
const EXPECTED = ["overview","alerts","approvals","environments","ai-runtime","integrations","trust-security","health","releases","verification","config","support"];
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "status", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const criteria: string[] = s.criteria ?? [];
  const domains: any[] = s.domains ?? [];
  const seen = new Set(domains.map((d) => d.domain));
  for (const d of EXPECTED) {
    if (!seen.has(d)) issues.push({ severity: "error", area: "missing-domain", message: d });
  }
  for (const dom of domains) {
    for (const c of criteria) {
      if (dom[c] === undefined || dom[c] === null) {
        issues.push({ severity: "error", area: "classification", message: `${dom.domain}.${c} unclassified` });
      }
    }
    if (dom.registryBacked !== true) issues.push({ severity: "error", area: "binding", message: `${dom.domain} not registry-backed` });
    if (dom.actionable !== true) issues.push({ severity: "error", area: "binding", message: `${dom.domain} not actionable` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} admin-operator-coherence: ${EXPECTED.length} domains expected`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "admin-operator-coherence",
  ok,
  issues,
  extra: { domains: EXPECTED.length },
});
process.exit(ok ? 0 : 1);
