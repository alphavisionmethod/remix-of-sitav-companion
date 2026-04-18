/* eslint-disable no-console */
// SITA OS — Trust Chain Readiness Gate
// Verifies signed boot chain, dm-verity, MOK enrollment, TPM seal scripts.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const TRUST_SCRIPTS = [
  "os/scripts/sign-kernel.sh",
  "os/scripts/sign-initramfs.sh",
  "os/scripts/build-verity-root.sh",
  "os/scripts/verify-verity-metadata.sh",
  "os/scripts/enroll-secureboot-mok.sh",
  "os/scripts/seal-verity-to-tpm.sh",
  "os/scripts/verify-tpm-seal.sh",
  "os/scripts/verify-boot-artifacts.sh",
];
const TRUST_DOCS = ["docs/os/BOOT_CHAIN_IMPLEMENTATION.md", "docs/os/DM_VERITY_IMPLEMENTATION.md"];

for (const s of TRUST_SCRIPTS) if (!existsSync(s)) issues.push({ severity: "error", area: "scripts", message: `Missing trust script: ${s}` });
for (const d of TRUST_DOCS) if (!existsSync(d)) issues.push({ severity: "warning", area: "docs", message: `Missing trust doc: ${d}` });
if (!existsSync("os/keys")) issues.push({ severity: "warning", area: "keys", message: "os/keys/ directory not present (CI-injected at build time is OK)" });

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/os-trust-chain-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "os-trust-chain-readiness",
  phase: "phase-12-native-deployability",
  scriptsChecked: TRUST_SCRIPTS.length,
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`Trust chain: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
