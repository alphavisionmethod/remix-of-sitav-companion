/* eslint-disable no-console */
// SITA OS — Support Bundle Readiness Gate
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED = ["os/scripts/generate-support-bundle.sh", "os/diagnostics"];
const DOCS = ["docs/os/SUPPORT_BUNDLE.md"];

for (const r of REQUIRED) if (!existsSync(r)) issues.push({ severity: "error", area: "support", message: `Missing: ${r}` });
for (const d of DOCS) if (!existsSync(d)) issues.push({ severity: "warning", area: "docs", message: `Missing doc: ${d}` });

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/os-support-bundle-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "os-support-bundle-readiness",
  phase: "phase-12-native-deployability",
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`Support bundle: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
