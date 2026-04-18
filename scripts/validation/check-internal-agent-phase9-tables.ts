#!/usr/bin/env node
/* eslint-disable no-console */
// Verifies Phase 9 tables are present in migrations.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const REQUIRED = [
  "dr_drills", "signed_release_artifacts", "region_failover_events",
  "audit_export_bundles", "tenant_self_service_actions", "tenant_quotas",
  "compliance_controls", "compliance_evidence", "policy_as_code_rules",
  "attestation_packets",
];

const dir = "supabase/migrations";
const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [];
const blob = files.map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");
const missing = REQUIRED.filter(t => !blob.includes(`public.${t}`));
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "❌"} phase9 tables: ${REQUIRED.length - missing.length}/${REQUIRED.length}`);
if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
emitGateReport({
  gate: "internal-agent-phase9-tables", ok,
  issues: missing.map(m => ({ severity: "error" as const, area: "schema", message: `missing table ${m}` })),
});
process.exit(ok ? 0 : 1);
