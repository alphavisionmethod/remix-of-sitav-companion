#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — ESXi / vSphere Smoke Readiness Verifier
// Phase 15.2 — verifies ESXi target env vars are present.
// Emits generated/appliance-esxi-status.json. Exit 0 always.
// CI gate consumes JSON to flip the readiness item.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Check {
  readonly name: string;
  readonly present: boolean;
  readonly hint: string;
}

function envPresent(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

const esxi: Check[] = [
  { name: "ESXI_HOST",     present: envPresent("ESXI_HOST"),     hint: "FQDN/IP of ESXi host (e.g. esxi-01.lab.local)" },
  { name: "ESXI_USERNAME", present: envPresent("ESXI_USERNAME"), hint: "ESXi user with VM provisioning rights" },
  { name: "ESXI_PASSWORD", present: envPresent("ESXI_PASSWORD"), hint: "Password or API token" },
  { name: "ESXI_DATASTORE",present: envPresent("ESXI_DATASTORE"),hint: "Datastore name (e.g. datastore1)" },
  { name: "ESXI_NETWORK",  present: envPresent("ESXI_NETWORK"),  hint: "Port group name (e.g. VM Network)" },
];

const tpm: Check[] = [
  { name: "TPM_DEVICE_PATH", present: envPresent("TPM_DEVICE_PATH"), hint: "/dev/tpm0 or /dev/tpmrm0" },
  { name: "TPM_PCR_BANK",    present: envPresent("TPM_PCR_BANK"),    hint: "sha256 (preferred) or sha1" },
];

const esxiReady = esxi.every((c) => c.present);
const tpmReady  = tpm.every((c) => c.present);

const ovaScriptOk = existsSync("scripts/release/vmware/build-ova.sh");
const ovfTemplateOk = existsSync("scripts/release/templates/sita-os.ovf.template");

const report = {
  generatedAt: new Date().toISOString(),
  scope: "appliance-esxi-tpm",
  esxi: { ready: esxiReady, checks: esxi },
  tpm: { ready: tpmReady, checks: tpm },
  scaffolding: {
    ovaScriptOk,
    ovfTemplateOk,
  },
  summary: {
    esxiSmokeReady: esxiReady && ovaScriptOk && ovfTemplateOk,
    tpmAttestationReady: tpmReady,
    overallStatus:
      esxiReady && tpmReady ? "ready" :
      esxiReady || tpmReady ? "partial" : "deferred",
  },
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/appliance-esxi-status.json", JSON.stringify(report, null, 2));

console.log(`🖥️  appliance-esxi: esxi=${esxiReady} tpm=${tpmReady} → ${report.summary.overallStatus}`);
for (const c of [...esxi, ...tpm]) {
  console.log(`  ${c.present ? "✅" : "⏳"} ${c.name}${c.present ? "" : `  (${c.hint})`}`);
}
console.log(`  📄 build-ova.sh:        ${ovaScriptOk ? "✅" : "❌"}`);
console.log(`  📄 sita-os.ovf.template: ${ovfTemplateOk ? "✅" : "❌"}`);
process.exit(0);
