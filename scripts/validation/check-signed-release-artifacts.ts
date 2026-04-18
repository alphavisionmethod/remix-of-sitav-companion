#!/usr/bin/env node
/* eslint-disable no-console */
// Verifies signed_release_artifacts schema has sha256 + signature non-null + verify path.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasTable = blob.includes("public.signed_release_artifacts");
const hasSha = /signed_release_artifacts[\s\S]{0,1500}sha256 text NOT NULL/.test(blob);
const hasSig = /signed_release_artifacts[\s\S]{0,1500}signature text NOT NULL/.test(blob);
const hasVerifier = existsSync("supabase/functions/release-artifact-verifier/index.ts");
const ok = hasTable && hasSha && hasSig && hasVerifier;
console.log(`${ok ? "✅" : "❌"} signed-release-artifacts: table=${hasTable} sha=${hasSha} sig=${hasSig} verifier=${hasVerifier}`);
emitGateReport({
  gate: "signed-release-artifacts", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "release", message: "incomplete signed-release-artifacts" }],
});
process.exit(ok ? 0 : 1);
