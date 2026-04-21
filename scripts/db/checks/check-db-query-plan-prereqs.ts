#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Query Plan Prerequisites Validator (ADVISORY)
import { ViolationCollector } from "../../architecture/lib/utils";
import { CRITICAL_QUERY_FAMILIES } from "../../../src/lib/db/query-plan-governance";
import { EXPECTED_INDEXES } from "../../../src/lib/db/index-coverage-registry";

const vc = new ViolationCollector();
const indexSet = new Set(EXPECTED_INDEXES.map(i => `${i.table}(${i.columns.join(",")})`));

for (const qf of CRITICAL_QUERY_FAMILIES) {
  for (const req of qf.requiredIndexes) {
    if (!indexSet.has(req)) {
      vc.add("query-plan-governance", "missing-index-prereq", `Query family '${qf.id}' requires index ${req} not in coverage registry`, "warning");
    }
  }
}

console.log(`  📊 ${CRITICAL_QUERY_FAMILIES.length} critical query families checked`);
console.log(`  ✅ Query plan prerequisites validated`);
vc.report("check-db-query-plan-prereqs");
vc.exitIfErrors();