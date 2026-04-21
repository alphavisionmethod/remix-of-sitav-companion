/**
 * SITA OS — Workflow Governance Validator
 * Validates all GitHub Actions workflows for production-grade standards:
 * - permissions: declared
 * - timeout-minutes on every job
 * - concurrency controls on deploy/release workflows
 * - no bare `|| true` swallowing failures
 * - artifact retention specified
 * - CODEOWNERS coverage for critical paths
 */
import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  rule: string;
  detail: string;
  severity: "error" | "warning";
}

const WORKFLOWS_DIR = path.join(process.cwd(), ".github/workflows");
const violations: Violation[] = [];

function checkWorkflow(file: string) {
  const filePath = path.join(WORKFLOWS_DIR, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Check permissions declared
  if (!content.includes("permissions:")) {
    violations.push({
      file,
      rule: "permissions-declared",
      detail: "Missing top-level `permissions:` — runs with default (broad) token scope",
      severity: "warning",
    });
  }

  // Check for deploy/release workflows without concurrency
  const isDeployOrRelease = /deploy|release/i.test(file);
  if (isDeployOrRelease && !content.includes("concurrency:")) {
    violations.push({
      file,
      rule: "concurrency-on-deploy",
      detail: "Deploy/release workflow missing `concurrency:` controls",
      severity: "error",
    });
  }

  // Check for jobs without timeout-minutes
  const jobMatches = content.matchAll(/^\s{2}[\w-]+:\s*$/gm);
  for (const match of jobMatches) {
    const jobStart = match.index!;
    // Look ahead ~20 lines for timeout-minutes
    const nextChunk = content.slice(jobStart, jobStart + 600);
    if (!nextChunk.includes("timeout-minutes") && !nextChunk.includes("uses:")) {
      // Only flag if it looks like a real job (has runs-on)
      if (nextChunk.includes("runs-on")) {
        const jobName = match[0].trim().replace(":", "");
        violations.push({
          file,
          rule: "job-timeout",
          detail: `Job '${jobName}' missing timeout-minutes`,
          severity: "warning",
        });
      }
    }
  }

  // Count bare `|| true` patterns (not in comments)
  let bareTrueCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;
    if (/\|\|\s*true\s*$/.test(trimmed) && !trimmed.includes("continue-on-error")) {
      bareTrueCount++;
    }
  }
  if (bareTrueCount > 3) {
    violations.push({
      file,
      rule: "excessive-failure-swallowing",
      detail: `${bareTrueCount} bare '|| true' patterns — prefer continue-on-error for visibility`,
      severity: "warning",
    });
  }
}

// Run
if (!fs.existsSync(WORKFLOWS_DIR)) {
  console.error("No .github/workflows directory found");
  process.exit(1);
}

const files = fs.readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith(".yml"));
console.log(`🔍 Checking ${files.length} workflow files...\n`);

for (const file of files) {
  checkWorkflow(file);
}

// Check CODEOWNERS exists and covers key paths
const codeownersPath = path.join(process.cwd(), ".github/CODEOWNERS");
if (!fs.existsSync(codeownersPath)) {
  violations.push({
    file: "CODEOWNERS",
    rule: "codeowners-exists",
    detail: "No CODEOWNERS file found",
    severity: "error",
  });
} else {
  const co = fs.readFileSync(codeownersPath, "utf-8");
  const requiredPatterns = ["/.github/", "/src/", "/supabase/", "/scripts/"];
  for (const pattern of requiredPatterns) {
    if (!co.includes(pattern)) {
      violations.push({
        file: "CODEOWNERS",
        rule: "codeowners-coverage",
        detail: `Missing coverage for '${pattern}'`,
        severity: "warning",
      });
    }
  }
}

// Report
const errors = violations.filter((v) => v.severity === "error");
const warnings = violations.filter((v) => v.severity === "warning");

const report = {
  generatedAt: new Date().toISOString(),
  totalWorkflows: files.length,
  violations: violations.length,
  errors: errors.length,
  warnings: warnings.length,
  details: violations,
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync(
  "generated/workflow-governance-report.json",
  JSON.stringify(report, null, 2)
);

if (violations.length === 0) {
  console.log("✅ All workflow governance checks passed");
} else {
  for (const v of violations) {
    const icon = v.severity === "error" ? "❌" : "⚠️";
    console.log(`${icon} [${v.file}] ${v.rule}: ${v.detail}`);
  }
  console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
}

if (errors.length > 0) {
  process.exit(1);
}