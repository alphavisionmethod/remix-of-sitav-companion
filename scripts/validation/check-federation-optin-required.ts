// Phase 8C — BLOCK validator: federation requires opt-in (trigger + edge check)
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "federation-optin-required";
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");

if (!all.includes("federation_optin_required")) {
  issues.push({ severity: "error", area: "trigger", message: "federation_optin_required trigger function missing" });
}
if (!all.includes("trg_federation_optin_required")) {
  issues.push({ severity: "error", area: "trigger", message: "trigger trg_federation_optin_required not attached" });
}
if (!all.includes("RAISE EXCEPTION 'federation_optin_required")) {
  issues.push({ severity: "error", area: "trigger", message: "trigger does not RAISE EXCEPTION on missing opt-in" });
}

const FN = "supabase/functions/federated-knowledge-aggregator/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "aggregator function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("tenant_federation_optins") || !src.includes("tenant_not_opted_in")) {
    issues.push({ severity: "error", area: "function", message: "aggregator does not check tenant opt-in" });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
