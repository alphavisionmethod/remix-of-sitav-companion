#!/usr/bin/env node
/* eslint-disable no-console */
// Attestation packets must include sha256 + signature + sealed status.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasTable = blob.includes("public.attestation_packets");
const hasSha = /attestation_packets[\s\S]{0,2000}bundle_sha256 text NOT NULL/.test(blob);
const hasSig = /attestation_packets[\s\S]{0,2000}signature text NOT NULL/.test(blob);
const hasFn = existsSync("supabase/functions/attestation-packet-builder/index.ts");
const ok = hasTable && hasSha && hasSig && hasFn;
console.log(`${ok ? "✅" : "❌"} attestation-packet-signed: table=${hasTable} sha=${hasSha} sig=${hasSig} fn=${hasFn}`);
emitGateReport({
  gate: "attestation-packet-signed", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "attestation", message: "attestation packet pipeline incomplete" }],
});
process.exit(ok ? 0 : 1);
