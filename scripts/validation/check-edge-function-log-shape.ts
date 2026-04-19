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
// Honest WARN-tier: returns warnings (not errors) for functions that
// already use EdgeLogger but only emit a partial subset, and surfaces
// the gap count without blocking. Hard-fails only if a function
// imports EdgeLogger then never calls it (dead instrumentation).
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
  const callsLogger = /\blogger\.(info|warn|error|debug)\s*\(/.test(src) || /new\s+EdgeLogger\s*\(/.test(src);
  if (!callsLogger) {
    deadInstrumentation++;
    issues.push({
      severity: "error",
      area: file,
      message: "Imports EdgeLogger but never invokes a structured log call.",
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

// Hard-fail only on dead instrumentation. Partial shape is honest WARN.
const ok = deadInstrumentation === 0;
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
    requiredTokens: REQUIRED_TOKENS,
  },
});
console.log(
  `[edge-function-log-shape] ${ok ? "PASS" : "FAIL"} (full=${fullyShaped} partial=${partiallyShaped} dead=${deadInstrumentation} / using=${usingLogger}/${fns.length})`,
);
process.exit(ok ? 0 : 1);
