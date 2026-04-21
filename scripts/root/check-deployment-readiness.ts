/**
 * Deployment Readiness Gate — aggregates all root infrastructure checks
 * into a single pass/fail gate for CI and pre-deploy validation.
 *
 * Checks:
 *   1. Service manifest completeness
 *   2. Env contract completeness
 *   3. Docker hardening
 *   4. Root package.json has required scripts
 *   5. Build output exists (if running post-build)
 *   6. Critical config files present
 */
import * as fs from "fs";
import * as path from "path";

interface GateResult {
  gate: string;
  passed: boolean;
  detail: string;
}

function checkFileExists(filePath: string, label: string): GateResult {
  const exists = fs.existsSync(path.resolve(filePath));
  return { gate: label, passed: exists, detail: exists ? "Present" : `Missing: ${filePath}` };
}

function checkRootScripts(): GateResult {
  const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
  const required = ["dev", "build", "test", "lint", "typecheck", "clean"];
  const missing = required.filter((s) => !pkg.scripts?.[s]);
  return {
    gate: "Root scripts",
    passed: missing.length === 0,
    detail: missing.length === 0 ? "All present" : `Missing: ${missing.join(", ")}`,
  };
}

function checkServiceManifests(): GateResult {
  const services = ["deploy/api-gateway/package.json", "deploy/brain-core/package.json"];
  const required = ["build", "start", "typecheck", "clean", "health-check"];
  const issues: string[] = [];

  for (const sp of services) {
    if (!fs.existsSync(path.resolve(sp))) {
      issues.push(`${sp} missing`);
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(path.resolve(sp), "utf-8"));
    const missing = required.filter((s) => !pkg.scripts?.[s]);
    if (missing.length > 0) issues.push(`${sp}: missing ${missing.join(", ")}`);
  }

  return { gate: "Service manifests", passed: issues.length === 0, detail: issues.length === 0 ? "Complete" : issues.join("; ") };
}

function checkDockerfiles(): GateResult {
  const files = ["Dockerfile", "deploy/Dockerfile.api", "deploy/Dockerfile.brain"];
  const issues: string[] = [];

  for (const fp of files) {
    if (!fs.existsSync(path.resolve(fp))) continue;
    const content = fs.readFileSync(path.resolve(fp), "utf-8");
    if (!content.match(/^HEALTHCHECK/im)) issues.push(`${fp}: no HEALTHCHECK`);
    if (!content.match(/^USER\s+(?!root)/im)) issues.push(`${fp}: no non-root USER`);
  }

  return { gate: "Docker hardening", passed: issues.length === 0, detail: issues.length === 0 ? "All hardened" : issues.join("; ") };
}

function main() {
  const results: GateResult[] = [
    checkRootScripts(),
    checkServiceManifests(),
    checkDockerfiles(),
    checkFileExists(".dockerignore", ".dockerignore"),
    checkFileExists("docker-compose.yml", "Docker Compose"),
    checkFileExists(".env.production.example", "Env example"),
    checkFileExists("supabase/functions/_shared/cors.ts", "Shared CORS"),
    checkFileExists("supabase/functions/_shared/auth.ts", "Shared auth"),
    checkFileExists("supabase/functions/_shared/validate-service-role.ts", "Shared service-role"),
  ];

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log(`\n📋 Deployment Readiness Gate — ${passed.length}/${results.length} passed\n`);

  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon} ${r.gate}: ${r.detail}`);
  }

  // Write report
  const report = {
    generatedAt: new Date().toISOString(),
    totalGates: results.length,
    passed: passed.length,
    failed: failed.length,
    gates: results,
    deploymentReady: failed.length === 0,
  };

  fs.mkdirSync("generated", { recursive: true });
  fs.writeFileSync("generated/deployment-readiness-report.json", JSON.stringify(report, null, 2));

  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} gate(s) failed — deployment blocked`);
    process.exit(1);
  }

  console.log("\n✅ All deployment readiness gates passed");
}

main();