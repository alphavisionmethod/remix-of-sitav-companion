#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Authority Map Validator (BLOCK)
// Verifies every table has authority classification, owner, and context
import { ViolationCollector } from "../../architecture/lib/utils";
import { DB_SCHEMA_REGISTRY } from "../../../src/lib/db/schema-registry";
import { SCHEMA_AUTHORITY_REGISTRY } from "../../../src/lib/db/schema-authority-registry";
import { BOUNDED_CONTEXT_MAP } from "../../../src/lib/db/bounded-context-map";

const vc = new ViolationCollector();
const authorityByTable = new Map(SCHEMA_AUTHORITY_REGISTRY.map(e => [e.table, e]));
const contextByTable = new Map(BOUNDED_CONTEXT_MAP.map(e => [e.tableName, e]));

let missing = 0;
for (const t of DB_SCHEMA_REGISTRY) {
  if (!authorityByTable.has(t.name)) {
    vc.add("schema-authority-registry", "missing-authority", `Table ${t.name} has no authority classification`, "error");
    missing++;
  }
  if (!contextByTable.has(t.name)) {
    vc.add("bounded-context-map", "missing-context", `Table ${t.name} has no bounded context`, "error");
    missing++;
  }
}

const noOwner = BOUNDED_CONTEXT_MAP.filter(e => !e.owner);
for (const e of noOwner) {
  vc.add("bounded-context-map", "missing-owner", `Table ${e.tableName} has no owner`, "error");
}

console.log(`  📋 Authority: ${authorityByTable.size}/${DB_SCHEMA_REGISTRY.length} tables classified`);
console.log(`  📋 Context: ${contextByTable.size}/${DB_SCHEMA_REGISTRY.length} tables mapped`);
console.log(`  ${missing === 0 ? "✅" : "❌"} Missing: ${missing}`);
vc.report("check-db-authority-map");
vc.exitIfErrors();