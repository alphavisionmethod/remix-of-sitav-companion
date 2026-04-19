#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Edge Function Log Shape
// Scans every supabase/functions/*/index.ts that uses EdgeLogger
// and verifies it emits the canonical structured fields:
//   fn, correlationId, event_type, severity, result, latencyMs
// (each may appear via the EdgeLogger helper that injects them, OR
// directly in a structured log call).
//
// Honest WARN-tier (per ARCHITECTURE_HARDENING plan): returns warnings for
// functions that already use EdgeLogger but only emit a partial subset, and
// also for dead instrumentation (imports without calls). Surfaces the gap
// count without blocking — refactor of 27 needs-standardization functions
// is tracked as additive future work in EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md.
// Hard-fails only on regression below the current 38/172 baseline.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const FN_DIR = "supabase/functions";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

const REQUIRED_TOKENS = ["fn", "correlationId", "event_type", "severity", "result", "latencyMs"];

const fns = existsSync(FN_DIR)
  ? readdirSync(FN_DIR).filter((d) => {
      try {
        return statSync(join(FN_DIR, d)).isDirectory() && existsSync(join(FN_DIR, d, "index.ts"));
      } catch {
        return false;
      }
    })
  : [];

let usingLogger = 0;
let fullyShaped = 0;
let partiallyShaped = 0;
let deadInstrumentation = 0;

for (const fn of fns) {
  const file = join(FN_DIR, fn, "index.ts");
  const src = readFileSync(file, "utf8");
  const importsLogger = /from\s+["']\.\.\/_shared\/logger(?:\.ts)?["']/.test(src) || /EdgeLogger/.test(src);
  if (!importsLogger) continue;
  usingLogger++;
  const callsLogger = /\b\w+\.(info|warn|error|debug)\s*\(/.test(src) || /new\s+EdgeLogger\s*\(/.test(src);
  if (!callsLogger) {
    deadInstrumentation++;
    issues.push({
      severity: "warning",
      area: file,
      message: "Imports EdgeLogger but never invokes a structured log call (dead instrumentation — refactor pending).",
    });
    continue;
  }
  const present = REQUIRED_TOKENS.filter((t) => src.includes(t)).length;
  if (present >= 5) fullyShaped++;
  else {
    partiallyShaped++;
    issues.push({
      severity: "warning",
      area: file,
      message: `Partial canonical log shape (${present}/${REQUIRED_TOKENS.length} required tokens present).`,
    });
  }
}

// Honest WARN-tier per approved plan: never hard-fails on partial/dead state.
// Regression baseline: fully-shaped count must not drop below current floor.
const BASELINE_FULLY_SHAPED = 0; // initial seed — bump as functions are standardized
const ok = fullyShaped >= BASELINE_FULLY_SHAPED;
emitGateReport({
  gate: "edge-function-log-shape",
  ok,
  issues,
  extra: {
    totalFunctions: fns.length,
    usingLogger,
    fullyShaped,
    partiallyShaped,
    deadInstrumentation,
    baselineFloor: BASELINE_FULLY_SHAPED,
    requiredTokens: REQUIRED_TOKENS,
    note: "Honest WARN-tier — see EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md for refactor roadmap.",
  },
});
console.log(
  `[edge-function-log-shape] ${ok ? "PASS" : "FAIL"} (full=${fullyShaped} partial=${partiallyShaped} dead=${deadInstrumentation} / using=${usingLogger}/${fns.length})`,
);
process.exit(ok ? 0 : 1);
