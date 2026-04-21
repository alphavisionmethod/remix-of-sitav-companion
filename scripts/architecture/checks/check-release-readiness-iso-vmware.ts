/* eslint-disable no-console */
// SITA OS — ISO / VMware Release Readiness Gate
// Validates that the sovereign OS image build target has all required pieces.

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

interface Issue { severity: "error" | "warning"; area: string; message: string; }

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "generated");
const issues: Issue[] = [];

function error(area: string, msg: string) { issues.push({ severity: "error", area, message: msg }); }
function warn(area: string, msg: string) { issues.push({ severity: "warning", area, message: msg }); }

// ── 1. OS build scripts ─────────────────────────────────
function checkOSBuildScripts() {
  const releaseScript = join(ROOT, "os/scripts/release.sh");
  if (!existsSync(releaseScript)) {
    error("os-build", "os/scripts/release.sh not found — OS release pipeline missing");
  }
  const reproducibility = join(ROOT, "os/scripts/verify-reproducibility.sh");
  if (!existsSync(reproducibility)) {
    warn("os-build", "os/scripts/verify-reproducibility.sh not found — reproducible builds not verifiable");
  }
}

// ── 2. Deployment profile / config ──────────────────────
function checkDeploymentProfile() {
  const deployYaml = join(ROOT, "infra/deploy/os-artifact.yaml");
  if (!existsSync(deployYaml)) {
    error("deploy-config", "infra/deploy/os-artifact.yaml not found — OS artifact deployment spec missing");
    return;
  }
  const content = readFileSync(deployYaml, "utf-8");
  if (!content.includes("signing")) {
    warn("deploy-config", "OS artifact config has no signing section");
  }
  if (!content.includes("recovery")) {
    warn("deploy-config", "OS artifact config has no recovery section");
  }
  // Check target platforms
  for (const platform of ["linux", "darwin", "win32"]) {
    if (!content.includes(platform)) {
      warn("deploy-config", `OS artifact config missing platform target: ${platform}`);
    }
  }
}

// ── 3. Electron packaging config ────────────────────────
function checkElectronConfig() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  // Check for electron or electron-builder
  const hasElectron = allDeps["electron"] || allDeps["electron-builder"] || allDeps["electron-forge"];
  if (!hasElectron) {
    warn("electron", "No Electron dependency found — desktop packaging may require manual setup");
  }
}

// ── 4. Required secrets for signing ─────────────────────
function checkSigningSecrets() {
  // These are checked declaratively — actual values are in CI env
  const requiredSecrets = [
    "ATTESTATION_SIGNING_KEY",
    "AUDIT_EXPORT_HMAC_KEY",
  ];
  // We can't check env at lint time, but we verify the infra references them
  const deployYaml = join(ROOT, "infra/deploy/os-artifact.yaml");
  if (existsSync(deployYaml)) {
    const content = readFileSync(deployYaml, "utf-8");
    if (!content.includes("code_signing")) {
      error("signing-secrets", "OS artifact config does not declare code_signing — artifacts will be unsigned");
    }
    if (!content.includes("integrity_hash")) {
      error("signing-secrets", "OS artifact config does not declare integrity_hash algorithm");
    }
  }
}

// ── 5. ISO / OVA / RAW artifact pipeline ────────────────
function checkArtifactPipeline() {
  const osDir = join(ROOT, "os");
  if (!existsSync(osDir)) {
    error("artifact-pipeline", "os/ directory not found — sovereign OS build tree missing");
    return;
  }
  // Check for dist or build output directory reference
  const deployYaml = join(ROOT, "infra/deploy/os-artifact.yaml");
  if (existsSync(deployYaml)) {
    const content = readFileSync(deployYaml, "utf-8");
    if (!content.includes("output_dir")) {
      warn("artifact-pipeline", "OS artifact config does not declare output_dir");
    }
  }
}

// ── 6. Config separation (deep secret scan) ─────────────────
import { scanForSecrets } from "../../../scripts/release/lib/secret-scanner";

function checkConfigSeparation() {
  const findings = scanForSecrets(ROOT, ["os", "infra", "scripts"]);
  for (const f of findings) {
    if (f.severity === "error") error(f.area, f.message);
    else warn(f.area, f.message);
  }
}

// ── 7. Migration consistency ────────────────────────────
function checkMigrations() {
  const migDir = join(ROOT, "supabase/migrations");
  if (!existsSync(migDir)) {
    warn("migrations", "supabase/migrations/ not found");
    return;
  }
  const files = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
  if (files.length === 0) {
    warn("migrations", "No SQL migrations — embedded database state may be stale");
  }
}

// ── Run ──────────────────────────────────────────────────
checkOSBuildScripts();
checkDeploymentProfile();
checkElectronConfig();
checkSigningSecrets();
checkArtifactPipeline();
checkConfigSeparation();
checkMigrations();

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "iso-vmware-release-readiness",
  target: "iso-vmware",
  ok,
  errorCount,
  warningCount,
  verdict: ok ? (warningCount > 0 ? "YELLOW" : "GREEN") : "RED",
  issues,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "iso-vmware-release-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(`\n💿 ISO/VMware Release Readiness: ${report.verdict}`);
console.log(`   Errors: ${errorCount}  Warnings: ${warningCount}`);
for (const i of issues) {
  console.log(`   ${i.severity === "error" ? "❌" : "⚠️"}  [${i.area}] ${i.message}`);
}

if (!ok) { console.error("\n🚫 ISO/VMware release gate FAILED."); process.exit(1); }
console.log("\n✅ ISO/VMware release gate PASSED.\n");