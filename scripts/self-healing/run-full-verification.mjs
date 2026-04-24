#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Run Full Verification Graph
// Executes every registered check, captures structured output,
// emits generated/self-healing/verification-graph.json
//
// Usage:
//   node scripts/self-healing/run-full-verification.mjs           # full
//   node scripts/self-healing/run-full-verification.mjs --dry     # plan only
//   node scripts/self-healing/run-full-verification.mjs --subsystem=tests
//   node scripts/self-healing/run-full-verification.mjs --critical-only
//   node scripts/self-healing/run-full-verification.mjs --quick   # skip > 300s
// ═══════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { CHECK_REGISTRY, getCheckCount } from "./lib/check-registry.mjs";

const args = new Set(process.argv.slice(2));
const subsystemArg = process.argv.find(a => a.startsWith("--subsystem="))?.split("=")[1];
const FLAGS = {
  dry: args.has("--dry"),
  criticalOnly: args.has("--critical-only"),
  quick: args.has("--quick"),
  subsystem: subsystemArg || null,
};

const OUT_DIR = path.resolve("generated/self-healing");
const OUT = path.join(OUT_DIR, "verification-graph.json");
mkdirSync(OUT_DIR, { recursive: true });

function selectChecks() {
  let checks = [...CHECK_REGISTRY];
  if (FLAGS.criticalOnly) checks = checks.filter(c => c.criticality === "release-blocker");
  if (FLAGS.quick) checks = checks.filter(c => c.timeoutMs <= 300_000);
  if (FLAGS.subsystem) checks = checks.filter(c => c.subsystem === FLAGS.subsystem);
  return checks;
}

function runCheck(check) {
  const start = Date.now();
  if (FLAGS.dry) {
    return {
      checkId: check.id,
      status: "skipped-dry",
      durationMs: 0,
      exitCode: null,
      stdout: "",
      stderr: "",
    };
  }
  try {
    const out = execSync(check.command, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      timeout: check.timeoutMs,
      maxBuffer: 32 * 1024 * 1024,
    });
    return {
      checkId: check.id,
      status: "pass",
      durationMs: Date.now() - start,
      exitCode: 0,
      stdout: out.slice(-8_000),
      stderr: "",
    };
  } catch (e) {
    return {
      checkId: check.id,
      status: e.signal === "SIGTERM" ? "timeout" : "fail",
      durationMs: Date.now() - start,
      exitCode: e.status ?? -1,
      stdout: (e.stdout?.toString() || "").slice(-8_000),
      stderr: (e.stderr?.toString() || "").slice(-8_000),
    };
  }
}

const checks = selectChecks();
console.log(`[verify] running ${checks.length} of ${getCheckCount()} checks${FLAGS.dry ? " (DRY)" : ""}`);

const results = [];
let passed = 0, failed = 0, timedOut = 0, skipped = 0;
for (const check of checks) {
  process.stdout.write(`[verify] → ${check.id} ... `);
  const r = runCheck(check);
  results.push({ ...check, result: r });
  if (r.status === "pass") { passed++; console.log(`✓ ${r.durationMs}ms`); }
  else if (r.status === "fail") { failed++; console.log(`✗ exit=${r.exitCode}`); }
  else if (r.status === "timeout") { timedOut++; console.log(`⏱ timeout`); }
  else { skipped++; console.log("· skipped"); }
}

const graph = {
  schema: "self-healing/verification-graph@1",
  generatedAt: new Date().toISOString(),
  flags: FLAGS,
  totals: {
    registered: getCheckCount(),
    selected: checks.length,
    passed,
    failed,
    timedOut,
    skipped,
  },
  checks: results,
};
writeFileSync(OUT, JSON.stringify(graph, null, 2));
console.log(`[verify] graph → ${OUT}`);
console.log(`[verify] summary: pass=${passed} fail=${failed} timeout=${timedOut} skipped=${skipped}`);

// Exit non-zero only if any check failed (timeouts treated as failures)
process.exit(failed + timedOut > 0 ? 1 : 0);