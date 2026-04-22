// ═══════════════════════════════════════════════════════════════
// SITA OS — Archive Boundary Validator
// Ensures archive/ remains clean, governed, and non-misleading.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
}

const ARCHIVE_ROOT = path.resolve(__dirname, "../../archive");

// Sentinel files that MUST exist (actively referenced by validators)
const REQUIRED_SENTINELS = [
  "mobile/ARCHIVED.md",
  "capacitor/capacitor.config.ts",
  "infra/mobile.yaml",
];

// File patterns that MUST NOT exist in archive
const PROHIBITED_PATTERNS: Array<{ pattern: RegExp; rule: string; message: string }> = [
  {
    pattern: /^generated\//,
    rule: "no-generated-artifacts",
    message: "Generated artifacts must not accumulate in archive/",
  },
  {
    pattern: /package\.json$/,
    rule: "no-node-artifacts",
    message: "Node package manifests must not exist in archive/",
  },
  {
    pattern: /node_modules\//,
    rule: "no-node-modules",
    message: "node_modules must not exist in archive/",
  },
  {
    pattern: /android-templates\//,
    rule: "no-dead-templates",
    message: "Dead Android template trees must not exist in archive/",
  },
  {
    pattern: /ios-templates\//,
    rule: "no-dead-templates",
    message: "Dead iOS template trees must not exist in archive/",
  },
  {
    pattern: /workflows\//,
    rule: "no-dead-workflows",
    message: "Dead workflow files must not exist in archive/",
  },
];

// Source code files that must not exist except the capacitor sentinel
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const ALLOWED_SOURCE_FILES = ["capacitor/capacitor.config.ts"];

function walk(dir: string, base: string = ""): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(path.join(dir, entry.name), rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}

function validate(): Violation[] {
  const violations: Violation[] = [];

  // Check required sentinels exist
  for (const sentinel of REQUIRED_SENTINELS) {
    if (!fs.existsSync(path.join(ARCHIVE_ROOT, sentinel))) {
      violations.push({
        file: `archive/${sentinel}`,
        rule: "missing-sentinel",
        severity: "error",
        message: `Required sentinel file is missing: ${sentinel}`,
      });
    }
  }

  if (!fs.existsSync(ARCHIVE_ROOT)) {
    return violations;
  }

  const files = walk(ARCHIVE_ROOT);

  for (const file of files) {
    // Check prohibited patterns
    for (const { pattern, rule, message } of PROHIBITED_PATTERNS) {
      if (pattern.test(file)) {
        violations.push({ file: `archive/${file}`, rule, severity: "error", message });
      }
    }

    // Check for unauthorized source code
    const ext = path.extname(file);
    if (SOURCE_EXTENSIONS.includes(ext) && !ALLOWED_SOURCE_FILES.includes(file)) {
      violations.push({
        file: `archive/${file}`,
        rule: "no-source-code",
        severity: "error",
        message: `Source code file not allowed in archive (only capacitor.config.ts is permitted)`,
      });
    }
  }

  return violations;
}

// ── Main ──
const violations = validate();
const report = {
  validator: "check-archive-boundary",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  status: violations.filter((v) => v.severity === "error").length === 0 ? "PASS" : "FAIL",
  totalFiles: walk(ARCHIVE_ROOT).length,
  sentinelsPresent: REQUIRED_SENTINELS.filter((s) =>
    fs.existsSync(path.join(ARCHIVE_ROOT, s))
  ).length,
  sentinelsRequired: REQUIRED_SENTINELS.length,
  violations,
};

const outDir = path.resolve(__dirname, "../../generated");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "archive-boundary-report.json"),
  JSON.stringify(report, null, 2)
);

if (report.status === "FAIL") {
  console.error(`❌ Archive boundary check FAILED — ${violations.length} violation(s)`);
  for (const v of violations) {
    console.error(`  [${v.severity}] ${v.rule}: ${v.file} — ${v.message}`);
  }
  process.exit(1);
} else {
  console.log(`✅ Archive boundary check PASSED — ${report.totalFiles} files, ${report.sentinelsPresent}/${report.sentinelsRequired} sentinels present`);
}