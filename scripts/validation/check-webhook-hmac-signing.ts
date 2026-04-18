// Phase 8B — BLOCK validator: webhook dispatcher signs payloads with HMAC-SHA256
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "webhook-hmac-signing";
const issues: GateIssue[] = [];
const FN = "supabase/functions/external-workforce-webhook-dispatcher/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "webhook-dispatcher missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("hmacSha256")) {
    issues.push({ severity: "error", area: "signing", message: "HMAC-SHA256 helper missing" });
  }
  if (!src.includes('"name": "HMAC", hash: "SHA-256"') && !src.includes('name: "HMAC", hash: "SHA-256"')) {
    issues.push({ severity: "error", area: "signing", message: "HMAC SHA-256 import not present" });
  }
  if (!src.includes("x-signature-sha256")) {
    issues.push({ severity: "error", area: "signing", message: "signature header not emitted" });
  }
  if (!src.includes("external_workforce_webhook_deliveries")) {
    issues.push({ severity: "error", area: "audit", message: "delivery audit log not written" });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
