/* eslint-disable no-console */
// SITA OS — Recovery Mode Readiness Gate
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED = ["os/recovery", "os/diagnostics"];
const DOCS = ["docs/os/RECOVERY_MODE.md", "docs/os/OBSERVABILITY_AND_DIAGNOSTICS.md"];
const EVIDENCE_FILES = [
  "os/recovery/recovery-evidence-collect.sh",
  "supabase/functions/recovery-evidence-ingest/index.ts",
];

for (const r of REQUIRED) if (!existsSync(r)) issues.push({ severity: "error", area: "layout", message: `Missing dir: ${r}` });
for (const d of DOCS) if (!existsSync(d)) issues.push({ severity: "warning", area: "docs", message: `Missing doc: ${d}` });
for (const f of EVIDENCE_FILES) if (!existsSync(f)) issues.push({ severity: "error", area: "evidence-loop", message: `Missing recovery evidence artifact: ${f}` });

const svcPath = "os/image-builder/recovery/sita-recovery.service";
if (existsSync(svcPath)) {
  const svc = require("node:fs").readFileSync(svcPath, "utf8");
  if (!/ExecStartPre=.*recovery-evidence-collect/.test(svc)) {
    issues.push({ severity: "error", area: "evidence-loop", message: "sita-recovery.service missing ExecStartPre for recovery-evidence-collect" });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/os-recovery-readiness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "os-recovery-readiness",
  phase: "phase-12-native-deployability",
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`Recovery readiness: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
