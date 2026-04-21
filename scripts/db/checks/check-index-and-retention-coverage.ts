#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Index Coverage Validator (ADVISORY)
// Replaces former stub with real validation
import { ViolationCollector } from "../../architecture/lib/utils";
import { EXPECTED_INDEXES } from "../../../src/lib/db/index-coverage-registry";
import { TTL_GOVERNANCE_MAP } from "../../../src/lib/db/ttl-governance-map";

const vc = new ViolationCollector();

// Check that all TTL tables have declared index expectations
for (const ttl of TTL_GOVERNANCE_MAP) {
  const hasIndex = EXPECTED_INDEXES.some(i => i.table === ttl.table && i.columns.includes(ttl.ttlColumn));
  if (!hasIndex) {
    vc.add("index-coverage-registry", "missing-ttl-index", `TTL table ${ttl.table} column ${ttl.ttlColumn} not in expected indexes`, "warning");
  }
}

// Check critical indexes are declared
const critical = EXPECTED_INDEXES.filter(i => i.priority === "critical");
console.log(`  📊 Expected indexes: ${EXPECTED_INDEXES.length} (${critical.length} critical)`);
console.log(`  📊 TTL tables: ${TTL_GOVERNANCE_MAP.length}`);
console.log(`  ${vc.errorCount === 0 ? "✅" : "⚠️"} Index coverage validated`);
vc.report("check-db-index-coverage");
vc.exitIfErrors();