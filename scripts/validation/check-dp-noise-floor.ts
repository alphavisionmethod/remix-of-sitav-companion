// Phase 8C — BLOCK validator: differential-privacy noise floor (ε ≤ 1.0)
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "dp-noise-floor";
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");

if (!all.includes("dp_noise_clamp")) {
  issues.push({ severity: "error", area: "rpc", message: "dp_noise_clamp RPC missing" });
}
if (!all.match(/LEAST\(GREATEST\(COALESCE\(p_epsilon,\s*0\.1\),\s*0\.01\),\s*1\.0\)/)) {
  issues.push({ severity: "error", area: "rpc", message: "dp_noise_clamp not bounded to [0.01, 1.0]" });
}
if (!all.includes("CHECK (dp_epsilon > 0 AND dp_epsilon <= 1.0)")) {
  issues.push({ severity: "error", area: "schema", message: "federated_knowledge_shares.dp_epsilon missing CHECK ≤ 1.0" });
}

const FN = "supabase/functions/federated-knowledge-aggregator/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "aggregator function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("dp_noise_clamp")) {
    issues.push({ severity: "error", area: "function", message: "aggregator does not call dp_noise_clamp" });
  }
  if (!src.includes("laplaceNoise")) {
    issues.push({ severity: "error", area: "function", message: "aggregator does not apply Laplace noise" });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
