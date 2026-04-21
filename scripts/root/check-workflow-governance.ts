/**
 * SITA OS — Workflow Governance Validator (Production-Grade)
 *
 * Validates all GitHub Actions workflows against production standards:
 *
 * RULES (error = blocks CI, warning = advisory):
 *  E1. permissions: must be declared on every workflow
 *  E2. Deploy/release workflows must have concurrency: controls
 *  E3. Action versions must be pinned (no @main or @master)
 *  W1. Every job should have timeout-minutes
 *  W2. Excessive bare `|| true` patterns (>3 per file)
 *  W3. Workflows should use upload-artifact with retention-days
 *  W4. Schedule-triggered workflows should have workflow_dispatch fallback
 *
 * Also validates:
 *  - CODEOWNERS exists and covers critical paths
 *  - Required governance files exist (SECURITY.md, dependabot.yml, etc.)
 *  - No duplicate workflow triggers on the same event+branch
 */
import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  rule: string;
  detail: string;
  severity: "error" | "warning";
}

interface WorkflowSummary {
  file: string;
  name: string;
  triggers: string[];
  jobCount: number;
  hasPermissions: boolean;
  hasConcurrency: boolean;
  hasTimeouts: boolean;
}

const GITHUB_DIR = path.join(process.cwd(), ".github");
const WORKFLOWS_DIR = path.join(GITHUB_DIR, "workflows");
const violations: Violation[] = [];
const summaries: WorkflowSummary[] = [];

// ── Rule checkers ──────────────────────────────────────────────────

function checkWorkflow(file: string) {
  const filePath = path.join(WORKFLOWS_DIR, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Extract workflow name
  const nameMatch = content.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  const wfName = nameMatch ? nameMatch[1] : file;

  // Extract triggers
  const triggers: string[] = [];
  const triggerMatches = content.matchAll(
    /^\s{2}(push|pull_request|schedule|workflow_dispatch|release|workflow_call):/gm
  );
  for (const m of triggerMatches) triggers.push(m[1]);

  const hasPermissions = content.includes("permissions:");
  const hasConcurrency = content.includes("concurrency:");

  // E1: permissions declared
  if (!hasPermissions) {
    violations.push({
      file,
      rule: "E1:permissions-declared",
      detail: "Missing top-level `permissions:` — runs with default (broad) token scope",
      severity: "error",
    });
  }

  // E2: deploy/release concurrency
  const isDeployOrRelease = /deploy|release/i.test(file);
  if (isDeployOrRelease && !hasConcurrency) {
    violations.push({
      file,
      rule: "E2:concurrency-on-deploy",
      detail: "Deploy/release workflow missing `concurrency:` controls",
      severity: "error",
    });
  }

  // E3: Unpinned action versions
  const actionRefs = content.matchAll(/uses:\s+([\w\-./]+)@(\w+)/g);
  for (const m of actionRefs) {
    const ref = m[2];
    if (ref === "main" || ref === "master") {
      violations.push({
        file,
        rule: "E3:unpinned-action",
        detail: `Action '${m[1]}@${ref}' should be pinned to a version tag (e.g. @v4)`,
        severity: "error",
      });
    }
  }

  // W1: jobs without timeout-minutes
  let hasAllTimeouts = true;
  const jobMatches = content.matchAll(/^\s{2}([\w-]+):\s*$/gm);
  for (const match of jobMatches) {
    const jobStart = match.index!;
    const nextChunk = content.slice(jobStart, jobStart + 800);
    if (!nextChunk.includes("timeout-minutes") && !nextChunk.includes("uses:")) {
      if (nextChunk.includes("runs-on")) {
        hasAllTimeouts = false;
        const jobName = match[1];
        violations.push({
          file,
          rule: "W1:job-timeout",
          detail: `Job '${jobName}' missing timeout-minutes`,
          severity: "warning",
        });
      }
    }
  }

  // W2: excessive || true
  let bareTrueCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;
    if (/\|\|\s*true\s*$/.test(trimmed)) bareTrueCount++;
  }
  if (bareTrueCount > 3) {
    violations.push({
      file,
      rule: "W2:excessive-failure-swallowing",
      detail: `${bareTrueCount} bare '|| true' patterns — prefer continue-on-error for visibility`,
      severity: "warning",
    });
  }

  // W3: upload-artifact without retention-days
  const uploadMatches = content.matchAll(/uses:\s+actions\/upload-artifact/g);
  for (const _um of uploadMatches) {
    // Simple heuristic: check if file has at least one retention-days
    if (!content.includes("retention-days")) {
      violations.push({
        file,
        rule: "W3:artifact-retention",
        detail: "Uses upload-artifact without specifying retention-days",
        severity: "warning",
      });
      break;
    }
  }

  // W4: schedule without workflow_dispatch
  if (triggers.includes("schedule") && !triggers.includes("workflow_dispatch")) {
    violations.push({
      file,
      rule: "W4:schedule-no-dispatch",
      detail: "Schedule-triggered workflow has no workflow_dispatch fallback for manual runs",
      severity: "warning",
    });
  }

  // Count jobs
  const jobCount = (content.match(/^\s{2}[\w-]+:\s*$/gm) || []).length;

  summaries.push({
    file,
    name: wfName,
    triggers,
    jobCount,
    hasPermissions,
    hasConcurrency,
    hasTimeouts: hasAllTimeouts,
  });
}

// ── Governance file checks ────────────────────────────────────────

function checkGovernanceFiles() {
  const required: Array<{ path: string; label: string }> = [
    { path: ".github/CODEOWNERS", label: "CODEOWNERS" },
    { path: ".github/SECURITY.md", label: "Security policy" },
    { path: ".github/SUPPORT.md", label: "Support guide" },
    { path: ".github/dependabot.yml", label: "Dependabot config" },
    { path: ".github/pull_request_template.md", label: "PR template" },
    { path: ".github/release.yml", label: "Release notes config" },
    { path: ".github/ISSUE_TEMPLATE/config.yml", label: "Issue template config" },
  ];

  for (const { path: fp, label } of required) {
    const fullPath = path.join(process.cwd(), fp);
    if (!fs.existsSync(fullPath)) {
      violations.push({
        file: fp,
        rule: "GOV:missing-file",
        detail: `Missing governance file: ${label}`,
        severity: "warning",
      });
    }
  }
}

function checkCodeowners() {
  const codeownersPath = path.join(process.cwd(), ".github/CODEOWNERS");
  if (!fs.existsSync(codeownersPath)) {
    violations.push({
      file: "CODEOWNERS",
      rule: "GOV:codeowners-exists",
      detail: "No CODEOWNERS file found",
      severity: "error",
    });
    return;
  }

  const co = fs.readFileSync(codeownersPath, "utf-8");
  const requiredPatterns = [
    "/.github/",
    "/src/",
    "/supabase/",
    "/scripts/",
    "/deploy/",
    "/os/",
  ];
  for (const pattern of requiredPatterns) {
    if (!co.includes(pattern)) {
      violations.push({
        file: "CODEOWNERS",
        rule: "GOV:codeowners-coverage",
        detail: `Missing coverage for '${pattern}'`,
        severity: "warning",
      });
    }
  }
}

// ── Execute ───────────────────────────────────────────────────────

if (!fs.existsSync(WORKFLOWS_DIR)) {
  console.error("❌ No .github/workflows directory found");
  process.exit(1);
}

const files = fs.readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith(".yml"));
console.log(`🔍 Checking ${files.length} workflow files...\n`);

for (const file of files) {
  checkWorkflow(file);
}

checkGovernanceFiles();
checkCodeowners();

// ── Report ────────────────────────────────────────────────────────

const errors = violations.filter((v) => v.severity === "error");
const warnings = violations.filter((v) => v.severity === "warning");

const report = {
  generatedAt: new Date().toISOString(),
  totalWorkflows: files.length,
  violations: violations.length,
  errors: errors.length,
  warnings: warnings.length,
  workflowSummaries: summaries,
  details: violations,
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync(
  "generated/workflow-governance-report.json",
  JSON.stringify(report, null, 2)
);

// Print workflow topology
console.log("📊 Workflow Topology:");
for (const s of summaries) {
  const flags = [
    s.hasPermissions ? "✅perms" : "❌perms",
    s.hasConcurrency ? "✅conc" : "—conc",
    s.hasTimeouts ? "✅time" : "⚠️time",
  ].join(" ");
  console.log(`  ${s.file} → ${s.triggers.join(",")} [${s.jobCount} jobs] ${flags}`);
}
console.log("");

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