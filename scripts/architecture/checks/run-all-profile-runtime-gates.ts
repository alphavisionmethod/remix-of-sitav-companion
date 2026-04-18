#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Profile & Runtime Hardening Gate Orchestrator (Phase G)
//
// Runs all 8 profile-and-runtime-hardening block-level gates in
// sequence, then emits aggregator-compatible <gate>-report.json
// companion files so that check-os-release-readiness.ts can ingest
// them as first-class release readiness gates.
//
// Pattern mirrors scripts/architecture/checks/run-all-native-readiness.ts.
// ═══════════════════════════════════════════════════════════════

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

interface RawGate {
  generatedAt?: string;
  gate?: string;
  level?: "warn" | "block";
  ok?: boolean;
  // discriminated payload counts vary per gate; we normalize below
  offenderCount?: number;
  mismatchCount?: number;
  hiddenCount?: number;
  lyingLiveCount?: number;
  orphanCount?: number;
  leakCount?: number;
  leakageCount?: number;
  unguardedCount?: number;
  totalSoftDrift?: number;
  digestMismatchCount?: number;
}

interface AggregatorReport {
  gate: string;
  generatedAt: string;
  ok: boolean;
  errorCount: number;
  warningCount: number;
  issues: Array<{ severity: "error" | "warning"; area: string; message: string }>;
}

// [orchestrator-gate-name, script-path, output-json, count-field]
const GATES: Array<[string, string, string, keyof RawGate]> = [
  ["launcher-registry-completeness",         "scripts/architecture/checks/check-launcher-registry-completeness.ts",         "generated/launcher-registry-completeness.json",         "offenderCount"],
  ["app-profile-matrix",                     "scripts/architecture/checks/check-app-profile-matrix.ts",                     "generated/app-profile-matrix.json",                     "mismatchCount"],
  ["hidden-app-routes",                      "scripts/architecture/checks/check-hidden-app-routes.ts",                      "generated/hidden-app-routes.json",                      "hiddenCount"],
  ["mobile-capability-truth",                "scripts/architecture/checks/check-mobile-capability-truth.ts",                "generated/mobile-capability-truth.json",                "lyingLiveCount"],
  ["profile-route-coverage",                 "scripts/architecture/checks/check-profile-route-coverage.ts",                 "generated/profile-route-coverage.json",                 "orphanCount"],
  ["command-palette-profile-leakage",        "scripts/architecture/checks/check-command-palette-profile-leakage.ts",        "generated/command-palette-profile-leakage.json",        "leakCount"],
  ["shared-component-profile-pollution",     "scripts/architecture/checks/check-shared-component-profile-pollution.ts",     "generated/shared-component-profile-pollution.json",     "leakageCount"],
  ["route-guard-coverage",                   "scripts/architecture/checks/check-route-guard-coverage.ts",                   "generated/route-guard-coverage.json",                   "unguardedCount"],
  ["profile-runtime-baseline-drift",         "scripts/architecture/checks/check-profile-runtime-baseline-drift.ts",         "generated/profile-runtime-baseline-drift.json",         "totalSoftDrift"],
  ["profile-runtime-attestation",            "scripts/architecture/checks/check-profile-runtime-attestation.ts",            "generated/profile-runtime-attestation.json",            "digestMismatchCount"],
];

mkdirSync("generated", { recursive: true });

// 0. Always regenerate evidence first so gates run on fresh data.
console.log("── refreshing evidence maps ──");
const evidence = spawnSync("npx", ["tsx", "scripts/architecture/audits/generate-runtime-evidence-maps.ts"], { stdio: "inherit" });
if (evidence.status !== 0) {
  console.error("❌ evidence regeneration failed");
  process.exit(1);
}

let failures = 0;
const summary: Array<{ gate: string; status: "PASS" | "FAIL"; count: number }> = [];

for (const [name, script, outFile, countField] of GATES) {
  console.log(`\n── ${name} ──`);
  const r = spawnSync("npx", ["tsx", script], { stdio: "inherit" });
  const passed = r.status === 0;
  if (!passed) failures++;

  // Emit aggregator-compatible <gate>-report.json companion.
  if (existsSync(outFile)) {
    try {
      const raw = JSON.parse(readFileSync(outFile, "utf-8")) as RawGate;
      const count = (raw[countField] as number | undefined) ?? 0;
      const ok = raw.ok ?? (count === 0);
      const isBlock = raw.level === "block";

      const aggReport: AggregatorReport = {
        gate: name,
        generatedAt: raw.generatedAt ?? new Date().toISOString(),
        ok,
        // Block-level gate failures count as errors. Warn-level → warnings.
        errorCount: !ok && isBlock ? count : 0,
        warningCount: !ok && !isBlock ? count : 0,
        issues: ok
          ? []
          : [{
              severity: isBlock ? "error" : "warning",
              area: name,
              message: `${name} reported ${count} drift entries (budget exceeded)`,
            }],
      };

      writeFileSync(join("generated", `${name}-report.json`), JSON.stringify(aggReport, null, 2));
      summary.push({ gate: name, status: ok ? "PASS" : "FAIL", count });
    } catch (e) {
      console.error(`  ⚠️ failed to adapt ${outFile}: ${(e as Error).message}`);
      summary.push({ gate: name, status: "FAIL", count: -1 });
      failures++;
    }
  } else {
    console.error(`  ⚠️ output file missing: ${outFile}`);
    summary.push({ gate: name, status: "FAIL", count: -1 });
    failures++;
  }
}

// Emit overall orchestrator report (also picked up by aggregator).
const overall: AggregatorReport = {
  gate: "profile-runtime-hardening",
  generatedAt: new Date().toISOString(),
  ok: failures === 0,
  errorCount: failures,
  warningCount: 0,
  issues: summary
    .filter((s) => s.status === "FAIL")
    .map((s) => ({ severity: "error" as const, area: s.gate, message: `${s.gate} failed` })),
};
writeFileSync("generated/profile-runtime-hardening-report.json", JSON.stringify(overall, null, 2));

console.log(`\n${"═".repeat(60)}`);
console.log(`Profile & Runtime Hardening — ${failures === 0 ? "✅ ALL 8 GATES PASS" : `❌ ${failures}/${GATES.length} FAILED`}`);
console.log(`${"═".repeat(60)}`);
for (const s of summary) {
  console.log(`  ${s.status === "PASS" ? "✅" : "❌"} ${s.gate.padEnd(40)} count=${s.count}`);
}
console.log(`\nAggregator companions: generated/<gate>-report.json (8 files + overall)`);

process.exit(failures === 0 ? 0 : 1);
