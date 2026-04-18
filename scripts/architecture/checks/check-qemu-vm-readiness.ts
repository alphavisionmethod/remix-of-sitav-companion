/* eslint-disable no-console */
// SITA OS — QEMU / VM Validation Readiness Gate
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED = ["os/qemu-test.sh", "os/qemu-validate.sh", "os/vm", "os/vmware"];
const DOCS = ["docs/os/VM_VALIDATION_MATRIX.md", "docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md"];

for (const r of REQUIRED) if (!existsSync(r)) issues.push({ severity: "error", area: "qemu-vm", message: `Missing: ${r}` });
for (const d of DOCS) if (!existsSync(d)) issues.push({ severity: "warning", area: "docs", message: `Missing doc: ${d}` });

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/qemu-vm-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "qemu-vm-readiness",
  phase: "phase-12-native-deployability",
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`QEMU/VM readiness: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
