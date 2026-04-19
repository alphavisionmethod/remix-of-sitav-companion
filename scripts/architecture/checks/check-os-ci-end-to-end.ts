/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════════════
// SITA OS — OS Build CI End-to-End Validator (BLOCK gate)
// ─────────────────────────────────────────────────────────────────────────
// Asserts that .github/workflows/os-build-iso.yml runs the FULL pipeline
// in CI (not just profile assembly), is scheduled nightly, and publishes
// signed artifacts on release. Emits generated/os-ci-end-to-end-report.json.
// ═══════════════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const WORKFLOW_PATH = ".github/workflows/os-build-iso.yml";
let yaml = "";
if (!existsSync(WORKFLOW_PATH)) {
  issues.push({ severity: "error", area: "workflow", message: `Missing ${WORKFLOW_PATH}` });
} else {
  yaml = readFileSync(WORKFLOW_PATH, "utf8");
}

interface Requirement { id: string; area: string; pattern: RegExp; description: string; }
const REQUIREMENTS: Requirement[] = [
  // Triggers
  { id: "trigger-push",     area: "trigger",  pattern: /\bpush:\s*\n\s*branches:\s*\[main\]/m,  description: "push to main trigger" },
  { id: "trigger-schedule", area: "trigger",  pattern: /\bschedule:\s*\n(?:\s*#.*\n)*\s*-\s*cron:/m, description: "nightly schedule trigger" },
  { id: "trigger-release",  area: "trigger",  pattern: /\brelease:\s*\n\s*types:\s*\[\s*published\s*\]/m, description: "release published trigger" },
  { id: "trigger-dispatch", area: "trigger",  pattern: /\bworkflow_dispatch:/,                  description: "workflow_dispatch trigger" },
  // Profile matrix
  { id: "profile-matrix",   area: "matrix",   pattern: /profile:\s*\[\s*user\s*,\s*operator\s*\]/, description: "matrix profiles [user, operator]" },
  // End-to-end pipeline steps
  { id: "step-build",       area: "pipeline", pattern: /os\/image-builder\/build\.sh/,          description: "ISO build step" },
  { id: "step-verify-boot", area: "pipeline", pattern: /verify-boot-artifacts\.sh/,             description: "boot artifact verification" },
  { id: "step-verity",      area: "pipeline", pattern: /verify-verity-metadata\.sh/,            description: "dm-verity metadata verification" },
  { id: "step-img",         area: "pipeline", pattern: /build-raw-img\.sh/,                     description: "raw IMG build" },
  { id: "step-tpm",         area: "pipeline", pattern: /seal-verity-to-tpm\.sh/,                description: "TPM seal" },
  { id: "step-mok",         area: "pipeline", pattern: /enroll-secureboot-mok\.sh/,             description: "Secure Boot MOK enrollment" },
  { id: "step-sbom",        area: "pipeline", pattern: /generate-sbom\.sh/,                     description: "CycloneDX SBOM generation" },
  { id: "step-attestation", area: "pipeline", pattern: /emit-attestation\.sh/,                  description: "attestation emission" },
  // Smoke test job
  { id: "job-smoke-test",   area: "job",      pattern: /smoke-test:\s*\n[\s\S]*?qemu-validate\.sh/, description: "QEMU smoke-test job" },
  // Release publish job
  { id: "job-publish",      area: "job",      pattern: /publish-iso:/,                          description: "publish-iso release job" },
  // Artifact upload
  { id: "step-upload",      area: "pipeline", pattern: /actions\/upload-artifact@v4/,           description: "artifact upload step" },
];

const evidence: Record<string, boolean> = {};
for (const r of REQUIREMENTS) {
  const found = r.pattern.test(yaml);
  evidence[r.id] = found;
  if (!found) {
    issues.push({ severity: "error", area: r.area, message: `Missing: ${r.description} (id=${r.id})` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  "generated/os-ci-end-to-end-report.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    gate: "os-ci-end-to-end",
    phase: "phase-18-layout-and-ci-truth",
    workflowPath: WORKFLOW_PATH,
    requirementsChecked: REQUIREMENTS.length,
    evidence,
    ok,
    errorCount,
    warningCount,
    issues,
  }, null, 2),
);

console.log(`OS CI end-to-end: ${ok ? "✅ OK" : `❌ ${errorCount} errors`} — ${REQUIREMENTS.length} checks`);
if (!ok) {
  for (const i of issues) console.error(`  [${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
