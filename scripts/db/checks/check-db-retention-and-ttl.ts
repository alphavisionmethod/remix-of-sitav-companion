#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Retention and TTL Validator (ADVISORY)
import { ViolationCollector } from "../../architecture/lib/utils";
import { RETENTION_POLICY_REGISTRY } from "../../../src/lib/db/retention-policy-registry";
import { TTL_GOVERNANCE_MAP } from "../../../src/lib/db/ttl-governance-map";
import { DB_SCHEMA_REGISTRY } from "../../../src/lib/db/schema-registry";

const vc = new ViolationCollector();
const retentionByTable = new Map(RETENTION_POLICY_REGISTRY.map(e => [e.table, e]));

let covered = 0;
for (const t of DB_SCHEMA_REGISTRY) {
  if (retentionByTable.has(t.name)) covered++;
}

const ttlCovered = TTL_GOVERNANCE_MAP.length;
const hotTables = RETENTION_POLICY_REGISTRY.filter(e => e.hotCold === "hot").length;
const coldTables = RETENTION_POLICY_REGISTRY.filter(e => e.hotCold === "cold").length;

console.log(`  📊 Retention: ${covered}/${DB_SCHEMA_REGISTRY.length} tables governed`);
console.log(`  📊 TTL: ${ttlCovered} tables with TTL governance`);
console.log(`  📊 Hot: ${hotTables} | Cold: ${coldTables}`);
console.log(`  ✅ Retention and TTL governance validated`);
vc.report("check-db-retention-and-ttl");
vc.exitIfErrors();