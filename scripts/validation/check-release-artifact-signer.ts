#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — release artifact signer must exist and be admin-gated.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const fnPath = "supabase/functions/release-artifact-signer/index.ts";
const exists = existsSync(fnPath);
const src = exists ? readFileSync(fnPath, "utf-8") : "";
const hasAdminGate = src.includes("has_role") && src.includes("admin");
const hasHmac = src.includes("HMAC") && src.includes("ATTESTATION_SIGNING_KEY");
const hasShaCheck = src.includes("sha256.length !== 64");
const ok = exists && hasAdminGate && hasHmac && hasShaCheck;
console.log(`${ok ? "✅" : "❌"} release-artifact-signer: fn=${exists} admin=${hasAdminGate} hmac=${hasHmac} sha=${hasShaCheck}`);
emitGateReport({
  gate: "release-artifact-signer", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "release", message: "artifact signer missing or insufficient" }],
});
process.exit(ok ? 0 : 1);
