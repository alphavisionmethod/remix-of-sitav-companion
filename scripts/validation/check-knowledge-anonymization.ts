// Phase 8C — BLOCK validator: aggregates never expose individual tenant IDs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "knowledge-anonymization";
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");

// Aggregates table must NOT have tenant_id column, only contributing_tenant_count
const aggBlock = all.split("federated_pattern_aggregates")[1] ?? "";
const firstChunk = aggBlock.split("CREATE TABLE")[0] ?? "";
if (/\btenant_id\b/.test(firstChunk) && !/contributing_tenant_count/.test(firstChunk)) {
  issues.push({ severity: "error", area: "schema", message: "federated_pattern_aggregates exposes tenant_id" });
}
if (!firstChunk.includes("contributing_tenant_count")) {
  issues.push({ severity: "error", area: "schema", message: "contributing_tenant_count column missing" });
}
if (!firstChunk.includes("frequency_band") || !firstChunk.includes("confidence_band")) {
  issues.push({ severity: "error", area: "schema", message: "aggregates must use frequency_band + confidence_band, not raw counts" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
