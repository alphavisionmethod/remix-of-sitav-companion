/* eslint-disable no-console */
// SITA OS — Native Observability Readiness Gate
// Verifies SBOM, attestation, reproducibility, and observability docs.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED = [
  "os/scripts/generate-sbom.sh",
  "os/scripts/verify-sbom.sh",
  "os/scripts/emit-attestation.sh",
  "os/scripts/verify-reproducibility.sh",
];
const DOCS = ["docs/os/OBSERVABILITY_AND_DIAGNOSTICS.md"];

for (const r of REQUIRED) if (!existsSync(r)) issues.push({ severity: "error", area: "observability", message: `Missing: ${r}` });
for (const d of DOCS) if (!existsSync(d)) issues.push({ severity: "warning", area: "docs", message: `Missing doc: ${d}` });

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/native-observability-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "native-observability-readiness",
  phase: "phase-12-native-deployability",
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`Native observability: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
