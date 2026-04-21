#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Policy Patterns Validator (ADVISORY)
import { ViolationCollector } from "../../architecture/lib/utils";
import { auditPolicyPatterns } from "../../../src/lib/db/policy-pattern-registry";

const vc = new ViolationCollector();
const results = auditPolicyPatterns();
const inconsistent = results.filter(r => !r.consistent);

for (const r of inconsistent) {
  vc.add("policy-pattern-registry", "inconsistent-pattern", `${r.table}: ${r.issue}`, "warning");
}

console.log(`  📊 ${results.length} tables audited for policy pattern consistency`);
console.log(`  📊 ${results.length - inconsistent.length} consistent | ${inconsistent.length} inconsistent`);
console.log(`  ${inconsistent.length === 0 ? "✅" : "⚠️"} Policy patterns validated`);
vc.report("check-db-policy-patterns");
vc.exitIfErrors();