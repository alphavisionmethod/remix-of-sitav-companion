#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Tier Governance Aggregator
// Runs all runtime-tier checks and writes a unified report.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

interface CheckResult {
  id: string;
  script: string;
  passed: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
}

const CHECKS = [
  { id: "feature-tier-classification", script: "scripts/runtime/checks/check-feature-tier-classification.ts" },
  { id: "runtime-capability-enforcement", script: "scripts/runtime/checks/check-runtime-capability-enforcement.ts" },
  { id: "launch-honesty", script: "scripts/runtime/checks/check-launch-honesty.ts" },
  { id: "desktop-bridge-isolation", script: "scripts/runtime/checks/check-desktop-bridge-isolation.ts" },
  { id: "appliance-isolation", script: "scripts/runtime/checks/check-appliance-isolation.ts" },
  { id: "simulated-os-truth", script: "scripts/runtime/checks/check-simulated-os-truth.ts" },
];

const results: CheckResult[] = [];

for (const check of CHECKS) {
  if (!fs.existsSync(check.script)) {
    results.push({
      id: check.id,
      script: check.script,
      passed: false,
      exitCode: -1,
      stdout: "",
      stderr: `Script not found: ${check.script}`,
    });
    continue;
  }
  const proc = spawnSync("bun", ["run", check.script], { encoding: "utf-8" });
  results.push({
    id: check.id,
    script: check.script,
    passed: proc.status === 0,
    exitCode: proc.status ?? -1,
    stdout: (proc.stdout || "").trim(),
    stderr: (proc.stderr || "").trim(),
  });
}

const passed = results.filter((r) => r.passed).length;
const total = results.length;
const summary = {
  generatedAt: new Date().toISOString(),
  totalChecks: total,
  passed,
  failed: total - passed,
  passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
  results,
};

const outDir = "generated";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "runtime-tier-governance-report.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

// Markdown report
const lines: string[] = [];
lines.push("# SITA OS — Runtime Tier Governance Report");
lines.push("");
lines.push(`> Generated: ${summary.generatedAt}`);
lines.push("");
lines.push(`**Status:** ${summary.passed}/${summary.totalChecks} checks passed (${summary.passRate}%)`);
lines.push("");
lines.push("## 4-Tier Model");
lines.push("");
lines.push("| Tier | ID | Host Authority | Honest OS |");
lines.push("|------|----|----------------|----------|");
lines.push("| 1 — Web Application | `WEB_APP` | browser-sandbox | ❌ |");
lines.push("| 2 — Desktop Host | `DESKTOP_HOST` | host-bridge | ❌ |");
lines.push("| 3 — Appliance Runtime | `APPLIANCE_RUNTIME` | appliance-runtime | ✅ |");
lines.push("| 4 — Simulated OS | `SIMULATED_OS_EXPERIENCE` | ux-only | ❌ |");
lines.push("");
lines.push("## Checks");
lines.push("");
lines.push("| Check | Status | Exit |");
lines.push("|-------|--------|------|");
for (const r of results) {
  lines.push(`| ${r.id} | ${r.passed ? "✅" : "❌"} | ${r.exitCode} |`);
}
lines.push("");
lines.push("## Detailed Output");
lines.push("");
for (const r of results) {
  lines.push(`### ${r.id}`);
  lines.push("");
  lines.push("```");
  lines.push(r.stdout || "(no output)");
  if (r.stderr) {
    lines.push("--- stderr ---");
    lines.push(r.stderr);
  }
  lines.push("```");
  lines.push("");
}

fs.writeFileSync(path.join(outDir, "RUNTIME_TIER_GOVERNANCE_REPORT.md"), lines.join("\n") + "\n");

console.log("");
console.log(`📋 Runtime Tier Governance: ${passed}/${total} checks passed`);
console.log(`📄 Reports written:`);
console.log(`   - generated/runtime-tier-governance-report.json`);
console.log(`   - generated/RUNTIME_TIER_GOVERNANCE_REPORT.md`);

process.exit(passed === total ? 0 : 1);
