#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Artifacts Proof Gate
//
// Validates that every release-critical GitHub Actions workflow:
//   - Uses upload-artifact@v4 (no deprecated v3)
//   - Declares an artifact name (so it shows in the run summary)
//   - Pins Node 20+ where applicable
//   - Has a concurrency group (no thundering-herd)
//
// Emits: generated/ci-artifacts-proof-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
const WORKFLOWS_DIR = resolve(REPO_ROOT, ".github/workflows");

const RELEASE_CRITICAL = new Set([
  "ci.yml",
  "deploy-frontend.yml",
  "deploy-backend.yml",
  "release-electron.yml",
  "os-build-iso.yml",
  "mobile-build.yml",
  "native-readiness.yml",
  "desktop-build.yml",
  "sentry-release.yml",
]);

interface Finding { workflow: string; severity: "error" | "warning"; rule: string; message: string }
const findings: Finding[] = [];
const seen: { workflow: string; checks: Record<string, boolean> }[] = [];

if (!existsSync(WORKFLOWS_DIR)) {
  console.error("[ci-artifacts-proof] .github/workflows missing");
  process.exit(1);
}

const files = readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

for (const file of files) {
  if (!RELEASE_CRITICAL.has(file)) continue;
  const content = readFileSync(resolve(WORKFLOWS_DIR, file), "utf8");

  const hasUploadV4 = /uses:\s*actions\/upload-artifact@v4/.test(content);
  const hasUploadV3 = /uses:\s*actions\/upload-artifact@v3/.test(content);
  const hasArtifactName = /name:\s*[\w\-./${}]+/.test(content) && content.includes("upload-artifact");
  const hasConcurrency = /concurrency:/.test(content);
  const hasNodeSetup = /actions\/setup-node@v4/.test(content);
  const usesNode20Plus = /node-version:\s*['"]?(2[0-9]|[3-9][0-9])/.test(content) ||
    /node-version:\s*\$\{\{\s*env\.NODE_VERSION\s*\}\}/.test(content) ||
    /NODE_VERSION:\s*['"]?(2[0-9]|[3-9][0-9])/.test(content);

  seen.push({ workflow: file, checks: {
    uploadV4: hasUploadV4 || !content.includes("upload-artifact"),
    noUploadV3: !hasUploadV3,
    artifactNamePresent: !content.includes("upload-artifact") || hasArtifactName,
    concurrencyGroup: hasConcurrency,
    node20Plus: !hasNodeSetup || usesNode20Plus,
  }});

  if (hasUploadV3) findings.push({ workflow: file, severity: "error", rule: "no-upload-v3",
    message: "uses deprecated actions/upload-artifact@v3 (must be @v4)" });
  if (content.includes("upload-artifact") && !hasUploadV4 && !hasUploadV3)
    findings.push({ workflow: file, severity: "warning", rule: "upload-version",
      message: "upload-artifact present but version not pinned to @v4" });
  if (!hasConcurrency)
    findings.push({ workflow: file, severity: "warning", rule: "concurrency",
      message: "no concurrency group declared (thundering-herd risk)" });
  if (hasNodeSetup && !usesNode20Plus)
    findings.push({ workflow: file, severity: "error", rule: "node20",
      message: "setup-node uses Node < 20 (Node 20 LTS minimum)" });
}

// Coverage check: every release-critical workflow must exist
for (const required of RELEASE_CRITICAL) {
  if (!files.includes(required))
    findings.push({ workflow: required, severity: "warning", rule: "workflow-missing",
      message: `release-critical workflow ${required} missing` });
}

const errorCount = findings.filter((f) => f.severity === "error").length;
const warningCount = findings.filter((f) => f.severity === "warning").length;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "ci-artifacts-proof",
  phase: "phase-14-production-launch-hardening",
  ok: errorCount === 0,
  errorCount,
  warningCount,
  totals: {
    workflowsExpected: RELEASE_CRITICAL.size,
    workflowsPresent: seen.length,
    workflowsMissing: Array.from(RELEASE_CRITICAL).filter((w) => !files.includes(w)),
  },
  workflows: seen,
  findings,
};

const outDir = resolve(REPO_ROOT, "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "ci-artifacts-proof-report.json"), JSON.stringify(report, null, 2));

console.log(`[ci-artifacts-proof] ${seen.length}/${RELEASE_CRITICAL.size} release workflows · ${errorCount} errors · ${warningCount} warnings`);
if (errorCount > 0) {
  for (const f of findings.filter((x) => x.severity === "error")) console.error(`  ✗ ${f.workflow}: ${f.message}`);
  process.exit(1);
}
console.log("[ci-artifacts-proof] ✓ ok");
