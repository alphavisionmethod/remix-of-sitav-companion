#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Policy Registry Check (HARDENED)
// Asserts the rls-policy-registry has full coverage and no drift.
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const REGISTRY_PATH = "src/lib/db/rls-policy-registry.ts";
const SCHEMA_PATH = "src/lib/db/schema-registry.ts";

if (!fs.existsSync(REGISTRY_PATH)) {
  vc.add(REGISTRY_PATH, "missing", "RLS registry not found", "error");
  vc.report("check-rls-policy-registry");
  vc.exitIfErrors();
  process.exit(1);
}

const rls = fs.readFileSync(REGISTRY_PATH, "utf-8");
const schema = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, "utf-8") : "";

const rlsTables = new Set<string>();
let m: RegExpExecArray | null;
const RE = /"([a-z_]+)":\s*\{\s*pattern:/g;
while ((m = RE.exec(rls)) !== null) rlsTables.add(m[1]);

const schemaTables = new Set<string>();
const SR = /name:\s*"([a-z_]+)"/g;
while ((m = SR.exec(schema)) !== null) schemaTables.add(m[1]);

let missing = 0;
for (const t of schemaTables) {
  if (!rlsTables.has(t)) {
    vc.add(REGISTRY_PATH, "missing-table", `Table ${t} in schema-registry but not in rls-policy-registry`, "error");
    missing++;
  }
}

const noPolicyMatches = (rls.match(/"no_policies"/g) || []).length;
if (noPolicyMatches > 0) {
  vc.add(REGISTRY_PATH, "no-policies", `${noPolicyMatches} table(s) have pattern="no_policies"`, "warning");
}

console.log(`  📋 RLS registry: ${rlsTables.size} tables`);
console.log(`  📋 Schema registry: ${schemaTables.size} tables`);
console.log(`  ⚠️  Missing in RLS: ${missing} | No-policy: ${noPolicyMatches}`);

vc.report("check-rls-policy-registry");
vc.exitIfErrors();
