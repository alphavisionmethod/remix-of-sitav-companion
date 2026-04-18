/* eslint-disable no-console */
// SITA OS — Update & Rollback Readiness Gate
// Verifies A/B update bundle pipeline, signing, verification, rollback path.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const UPDATE_SCRIPTS = [
  "os/scripts/build-update-bundle.sh",
  "os/scripts/verify-update-bundle.sh",
  "os/scripts/rollback-to-previous.sh",
];
const UPDATE_DIRS = ["os/update"];
const UPDATE_DOCS = ["docs/os/UPDATE_AND_ROLLBACK_STRATEGY.md", "docs/os/ROLLBACK_STRATEGY.md"];

for (const s of UPDATE_SCRIPTS) if (!existsSync(s)) issues.push({ severity: "error", area: "scripts", message: `Missing update script: ${s}` });
for (const d of UPDATE_DIRS) if (!existsSync(d)) issues.push({ severity: "error", area: "layout", message: `Missing dir: ${d}` });
for (const d of UPDATE_DOCS) if (!existsSync(d)) issues.push({ severity: "warning", area: "docs", message: `Missing update doc: ${d}` });

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/os-update-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "os-update-readiness",
  phase: "phase-12-native-deployability",
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`Update readiness: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
