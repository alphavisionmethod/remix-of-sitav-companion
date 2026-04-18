/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Ubuntu-Native Build Pipeline Gate
// Phase 12 — asserts the OS build pipeline (ISO + IMG + OVA)
// is wired with real scripts, signing, and CI workflow.
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED_SCRIPTS = [
  "os/scripts/build-raw-img.sh",
  "os/scripts/build-verity-root.sh",
  "os/scripts/sign-kernel.sh",
  "os/scripts/sign-initramfs.sh",
  "os/scripts/generate-sbom.sh",
  "os/scripts/emit-attestation.sh",
  "os/scripts/release.sh",
  "os/scripts/reproducible-build-env.sh",
];
const REQUIRED_DIRS = ["os/image-builder", "os/installer", "os/runtime", "os/vmware"];
const REQUIRED_WORKFLOW = ".github/workflows/os-build-iso.yml";

for (const s of REQUIRED_SCRIPTS) {
  if (!existsSync(s)) issues.push({ severity: "error", area: "scripts", message: `Missing script: ${s}` });
}
for (const d of REQUIRED_DIRS) {
  if (!existsSync(d)) issues.push({ severity: "error", area: "layout", message: `Missing dir: ${d}` });
}
if (!existsSync(REQUIRED_WORKFLOW)) {
  issues.push({ severity: "error", area: "ci", message: `Missing CI workflow: ${REQUIRED_WORKFLOW}` });
} else {
  const wf = readFileSync(REQUIRED_WORKFLOW, "utf8");
  if (!/build-raw-img\.sh|release\.sh/.test(wf)) {
    issues.push({ severity: "warning", area: "ci", message: "os-build-iso.yml does not reference build-raw-img.sh or release.sh" });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/os-build-pipeline-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "os-build-pipeline",
  phase: "phase-12-native-deployability",
  scriptsChecked: REQUIRED_SCRIPTS.length,
  dirsChecked: REQUIRED_DIRS.length,
  errorCount, warningCount, ok, issues,
}, null, 2));

console.log(`OS build pipeline: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) { for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`); process.exit(1); }
