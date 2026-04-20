#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisory Report Synthesizer
//
// Background: many legacy advisory-tier validators emit their findings
// only via ViolationCollector.report() (console output). The master
// release-readiness aggregator, however, consumes generated/<gate>-report.json
// files. This causes 97 advisory gates to perpetually surface as "missing
// report" warnings even though their validators run successfully.
//
// This synthesizer:
//   1. Reads generated/validator-gate-map.json to find every advisory-classified
//      validator that has no report artifact.
//   2. Executes the validator and captures stdout+stderr+exit code.
//   3. Parses the legacy ViolationCollector summary line to extract
//      error/warning counts (or treats exit code 0 + "All checks passed" as OK).
//   4. Writes generated/<gateId>-report.json in the canonical GateReport shape
//      so the aggregator can ingest it without further changes.
//
// Safety: this NEVER mutates the validator scripts; it only writes synthesized
// reports into generated/ for advisory gates that have no native emitter.
// If a validator already wrote its own report, this synthesizer skips it.
// ═══════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

interface AdvisoryEntry {
  validator: string;
  gateId: string;
  classification: string;
}

const MAP_FILE = "generated/validator-gate-map.json";
const SUMMARY_FILE = "generated/advisory-synthesis-report.json";

if (!existsSync(MAP_FILE)) {
  console.error(`❌ ${MAP_FILE} missing — cannot synthesize advisory reports.`);
  process.exit(1);
}

const map = JSON.parse(readFileSync(MAP_FILE, "utf8")) as { entries?: AdvisoryEntry[] };
const advisoryEntries = (map.entries ?? []).filter((e) => e.classification === "advisory");

mkdirSync("generated", { recursive: true });

const SCRIPT_SEARCH_DIRS = [
  "scripts/architecture/checks",
  "scripts/validation",
  "scripts/release/checks",
];

function findScript(validator: string): string | null {
  for (const dir of SCRIPT_SEARCH_DIRS) {
    const candidate = join(dir, `${validator}.ts`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

interface ParsedResult {
  errorCount: number;
  warningCount: number;
  ok: boolean;
}

function parseLegacyOutput(stdout: string, exitCode: number): ParsedResult {
  // ViolationCollector emits one of:
  //   ✅ <name>: All checks passed
  //   ❌ <name>: N error(s), M warning(s)
  //   ⚠️ <name>: M warning(s)
  const allOk = /✅[^\n]*All checks passed/.test(stdout);
  const errMatch = stdout.match(/❌[^\n]*?(\d+)\s+error\(s\),\s+(\d+)\s+warning\(s\)/);
  const warnOnlyMatch = stdout.match(/⚠️[^\n]*?(\d+)\s+warning\(s\)/);
  if (allOk && exitCode === 0) return { errorCount: 0, warningCount: 0, ok: true };
  if (errMatch) {
    const errors = parseInt(errMatch[1], 10);
    const warnings = parseInt(errMatch[2], 10);
    return { errorCount: errors, warningCount: warnings, ok: errors === 0 };
  }
  if (warnOnlyMatch) {
    const warnings = parseInt(warnOnlyMatch[1], 10);
    return { errorCount: 0, warningCount: warnings, ok: true };
  }
  // Fallback: trust exit code only.
  return {
    errorCount: exitCode === 0 ? 0 : 1,
    warningCount: 0,
    ok: exitCode === 0,
  };
}

const summary: Array<{
  gateId: string;
  validator: string;
  scriptPath: string | null;
  action: "synthesized" | "skipped-existing" | "missing-script" | "exec-failed";
  errorCount?: number;
  warningCount?: number;
  ok?: boolean;
}> = [];

let synthesized = 0;
let skipped = 0;
let missingScript = 0;
let execFailed = 0;

for (const entry of advisoryEntries) {
  const reportPath = `generated/${entry.gateId}-report.json`;
  if (existsSync(reportPath)) {
    summary.push({
      gateId: entry.gateId,
      validator: entry.validator,
      scriptPath: null,
      action: "skipped-existing",
    });
    skipped++;
    continue;
  }
  const scriptPath = findScript(entry.validator);
  if (!scriptPath) {
    summary.push({
      gateId: entry.gateId,
      validator: entry.validator,
      scriptPath: null,
      action: "missing-script",
    });
    missingScript++;
    continue;
  }
  let stdout = "";
  let exitCode = 0;
  try {
    stdout = execSync(`npx tsx ${scriptPath}`, {
      encoding: "utf8",
      timeout: 60_000,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e: any) {
    stdout = (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? "");
    exitCode = e.status ?? 1;
  }

  // The validator may have written its own report mid-run — re-check.
  if (existsSync(reportPath)) {
    summary.push({
      gateId: entry.gateId,
      validator: entry.validator,
      scriptPath,
      action: "skipped-existing",
    });
    skipped++;
    continue;
  }

  const parsed = parseLegacyOutput(stdout, exitCode);
  const payload = {
    generatedAt: new Date().toISOString(),
    gate: entry.gateId,
    classification: "advisory",
    synthesizedBy: "scripts/architecture/lib/synthesize-advisory-reports.ts",
    sourceValidator: scriptPath,
    ok: parsed.ok,
    errorCount: parsed.errorCount,
    warningCount: parsed.warningCount,
    issues: [] as Array<{ severity: string; area: string; message: string }>,
    legacyOutputTail: stdout.split("\n").slice(-20).join("\n"),
  };
  writeFileSync(reportPath, JSON.stringify(payload, null, 2));
  summary.push({
    gateId: entry.gateId,
    validator: entry.validator,
    scriptPath,
    action: "synthesized",
    errorCount: parsed.errorCount,
    warningCount: parsed.warningCount,
    ok: parsed.ok,
  });
  synthesized++;
}

const summaryPayload = {
  generatedAt: new Date().toISOString(),
  totalAdvisoryValidators: advisoryEntries.length,
  synthesized,
  skippedExisting: skipped,
  missingScript,
  execFailed,
  results: summary,
};
writeFileSync(SUMMARY_FILE, JSON.stringify(summaryPayload, null, 2));

console.log(
  `🧩 advisory-synthesis: synthesized=${synthesized} skipped=${skipped} missing-script=${missingScript} exec-failed=${execFailed}`,
);
