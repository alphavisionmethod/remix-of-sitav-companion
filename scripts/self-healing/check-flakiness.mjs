#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Flake Detection
// For each failed check (in failure-report.json), rerun up to N
// times. Classify as: deterministic | flaky | env-specific |
// external-dep | timing-sensitive. Anything not "deterministic"
// is QUARANTINED — never enters repair planning.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { CHECK_REGISTRY, getCheckById } from "./lib/check-registry.mjs";
import { captureEnvironment } from "./lib/env-contract.mjs";

const REPORT = path.resolve("generated/self-healing/failure-report.json");
const OUT = path.resolve("generated/self-healing/flake-report.json");
const RERUN_COUNT = Number(process.env.SITA_HEAL_RERUNS || 3);

if (!existsSync(REPORT)) {
  console.error(`[flake] missing ${REPORT}`); process.exit(1);
}

const report = JSON.parse(readFileSync(REPORT, "utf8"));
const env = captureEnvironment();
const results = [];

function rerun(check) {
  try {
    execSync(check.command, {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: Math.min(check.timeoutMs, 600_000),
      maxBuffer: 16 * 1024 * 1024,
    });
    return { pass: true };
  } catch (e) {
    return {
      pass: false,
      exitCode: e.status ?? -1,
      external: /(ECONNREFUSED|ETIMEDOUT|getaddrinfo)/i.test(String(e.stderr || "")),
    };
  }
}

for (const f of report.failures) {
  const check = getCheckById(f.checkId);
  if (!check) {
    results.push({ failureId: f.failureId, classification: "unknown-check", attempts: [] });
    continue;
  }

  // Skip reruns for refusal-class failures — we never auto-rerun security tests
  if (f.normalizedClass === "auth-boundary-regression") {
    results.push({
      failureId: f.failureId, classification: "deterministic",
      attempts: [{ pass: false, note: "skip-rerun-refusal-class" }],
      decision: "quarantine-from-repair",
    });
    continue;
  }

  console.log(`[flake] rerunning ${check.id} ×${RERUN_COUNT} ...`);
  const attempts = [];
  let passes = 0, externals = 0;
  for (let i = 0; i < RERUN_COUNT; i++) {
    const r = rerun(check);
    attempts.push(r);
    if (r.pass) passes++;
    if (r.external) externals++;
  }

  let classification, decision;
  if (externals === RERUN_COUNT) {
    classification = "external-dep-unavailable";
    decision = "escalate-no-repair";
  } else if (passes === 0) {
    classification = "deterministic";
    decision = "proceed-to-repair-planning";
  } else if (passes === RERUN_COUNT) {
    classification = "self-resolved";
    decision = "skip-repair";
  } else {
    classification = "flaky";
    decision = "quarantine-from-repair";
  }
  results.push({ failureId: f.failureId, checkId: f.checkId,
    classification, decision, passes, attempts: attempts.length });
}

const out = {
  schema: "self-healing/flake-report@1",
  generatedAt: new Date().toISOString(),
  environment: env,
  rerunCount: RERUN_COUNT,
  totals: {
    deterministic: results.filter(r => r.classification === "deterministic").length,
    flaky: results.filter(r => r.classification === "flaky").length,
    externalDep: results.filter(r => r.classification === "external-dep-unavailable").length,
    selfResolved: results.filter(r => r.classification === "self-resolved").length,
  },
  results,
};
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`[flake] ${OUT}`);
console.log(`[flake] det=${out.totals.deterministic} flaky=${out.totals.flaky} ext=${out.totals.externalDep} self=${out.totals.selfResolved}`);