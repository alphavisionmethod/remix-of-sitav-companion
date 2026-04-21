#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Repair Procedure Coverage Validator (ADVISORY)
import { ViolationCollector } from "../../architecture/lib/utils";
import { DATA_REPAIR_PROCEDURES } from "../../../src/lib/db/data-repair-procedure-map";

const vc = new ViolationCollector();
const EXPECTED_DOMAINS = ["os-kernel", "platform-core", "auth-identity", "connector-fabric"];

for (const domain of EXPECTED_DOMAINS) {
  const found = DATA_REPAIR_PROCEDURES.filter(e => e.domain === domain);
  if (found.length === 0) {
    vc.add("data-repair-procedure-map", "missing-repair", `Domain '${domain}' has no repair procedures`, "warning");
  }
}

console.log(`  📊 ${DATA_REPAIR_PROCEDURES.length} repair procedures across ${new Set(DATA_REPAIR_PROCEDURES.map(e => e.domain)).size} domains`);
console.log(`  ✅ Repair procedure coverage validated`);
vc.report("check-db-repair-coverage");
vc.exitIfErrors();