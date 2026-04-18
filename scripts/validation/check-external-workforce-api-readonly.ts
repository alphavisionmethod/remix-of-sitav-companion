// Phase 8B — BLOCK validator: external workforce API is read-only and signs responses
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "external-workforce-api-readonly";
const issues: GateIssue[] = [];
const FN = "supabase/functions/external-workforce-api/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "external-workforce-api missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("READ_ONLY_RESOURCES")) {
    issues.push({ severity: "error", area: "scope", message: "READ_ONLY_RESOURCES allowlist missing" });
  }
  if (!src.includes("method_not_allowed_readonly_api")) {
    issues.push({ severity: "error", area: "scope", message: "non-GET/POST methods not rejected" });
  }
  if (!src.includes("scope_must_be_read_only")) {
    issues.push({ severity: "error", area: "scope", message: "scope enforcement branch missing" });
  }
  if (!src.includes("x-response-signature")) {
    issues.push({ severity: "error", area: "signing", message: "responses are not signed" });
  }
  // No inserts/updates/deletes on internal agent tables
  if (/\.from\(["'](internal_agent_|owner_copilot_briefings|external_workforce_subscriptions)["']\)\s*\.\s*(insert|update|delete)/.test(src)) {
    if (!src.includes("last_used_at")) {
      issues.push({ severity: "error", area: "scope", message: "API performs writes outside last_used_at telemetry" });
    }
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
