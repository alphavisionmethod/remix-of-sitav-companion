#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Tenant Isolation Validator (BLOCK)
import { ViolationCollector } from "../../architecture/lib/utils";
import { TENANT_ISOLATION_REGISTRY } from "../../../src/lib/db/tenant-isolation-map";

const vc = new ViolationCollector();
const unverified = TENANT_ISOLATION_REGISTRY.filter(e => !e.verified);

for (const e of unverified) {
  vc.add("tenant-isolation-map", "unverified-isolation", `Table ${e.table} has unverified tenant isolation`, "error");
}

const userScoped = TENANT_ISOLATION_REGISTRY.filter(e => e.isolationMechanism === "rls-user-id").length;
const global = TENANT_ISOLATION_REGISTRY.filter(e => e.isolationMechanism === "global-no-tenant").length;

console.log(`  🔒 ${TENANT_ISOLATION_REGISTRY.length} tables checked for tenant isolation`);
console.log(`  🔒 User-scoped: ${userScoped} | Global: ${global} | Unverified: ${unverified.length}`);
console.log(`  ${unverified.length === 0 ? "✅" : "❌"} Tenant isolation validated`);
vc.report("check-db-tenant-isolation");
vc.exitIfErrors();