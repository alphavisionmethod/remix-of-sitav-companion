#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Migration Governance Validator (ADVISORY)
import { ViolationCollector } from "../../architecture/lib/utils";
import { MIGRATION_REGISTRY } from "../../../src/lib/db/migration-registry";

const vc = new ViolationCollector();

// Check migrations have bounded context
let noContext = 0;
for (const m of MIGRATION_REGISTRY) {
  if (!m.boundedContext) {
    vc.add("migration-registry", "missing-context", `Migration ${m.filename} has no bounded context`, "warning");
    noContext++;
  }
}

// Surface high-risk migrations
const highRisk = MIGRATION_REGISTRY.filter(m => m.rollbackRisk === "high" || m.rollbackRisk === "critical");
const destructive = MIGRATION_REGISTRY.filter(m => m.destructive);

// Archive candidates (seed/data migrations)
const archiveCandidates = MIGRATION_REGISTRY.filter(m => m.category === "seed-data" || m.category === "data-migration");

console.log(`  📊 ${MIGRATION_REGISTRY.length} migrations governed`);
console.log(`  📊 High-risk: ${highRisk.length} | Destructive: ${destructive.length}`);
console.log(`  📊 Archive candidates: ${archiveCandidates.length} | No context: ${noContext}`);
console.log(`  ✅ Migration governance validated`);
vc.report("check-db-migration-governance");
vc.exitIfErrors();