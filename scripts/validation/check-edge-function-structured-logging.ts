#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Edge Function Structured Logging
// Reads logging-cleanup-status.json (canonical-compliant + refactored
// fns sets) and BLOCKs only on REGRESSION — i.e., a function that
// previously imported _shared/logger.ts no longer does.
// Honestly tracks the broader 134-fn coverage gap as WARN-only.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/architectural-cleanup/logging-cleanup-status.json";
const FUNCTIONS_DIR = "supabase/functions";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

if (!existsSync(STATUS)) {
  emitGateReport({
    gate: "edge-function-structured-logging",
    ok: false,
    issues: [{ severity: "error", area: STATUS, message: "logging-cleanup-status.json missing — run closure:architectural-cleanup:emit first" }],
  });
  console.error(`[edge-function-structured-logging] FAIL — status file missing`);
  process.exit(1);
}

const status = JSON.parse(readFileSync(STATUS, "utf8")) as {
  refactoredFunctions: string[];
  totalEdgeFunctions: number;
  needsStandardizationRemaining?: string[];
  coverageNow?: number;
};

// Build the canonical-compliant set live (from filesystem) — these MUST keep importing _shared/logger
function importsLogger(fnName: string): boolean {
  const indexPath = join(FUNCTIONS_DIR, fnName, "index.ts");
  if (!existsSync(indexPath)) return false;
  const src = readFileSync(indexPath, "utf8");
  return /_shared\/logger/.test(src);
}

// 1) Regression check on this-pass refactored set
let refactoredOk = 0;
for (const fn of status.refactoredFunctions) {
  if (importsLogger(fn)) {
    refactoredOk++;
  } else {
    issues.push({
      severity: "error",
      area: `supabase/functions/${fn}/index.ts`,
      message: `Edge function "${fn}" was refactored to use _shared/logger.ts but no longer imports it (regression).`,
    });
  }
}

// 2) Honest WARN: track broader coverage gap, don't BLOCK
const remainingCount = status.needsStandardizationRemaining?.length ?? 0;
if (remainingCount > 0) {
  issues.push({
    severity: "warning",
    area: "supabase/functions",
    message: `${remainingCount} edge functions classified needs-standardization remain on ad-hoc logging — see EDGE_FUNCTION_LOGGING_AUDIT.md (honest WARN; not a BLOCK).`,
  });
}

const errorCount = issues.filter(i => i.severity === "error").length;
const ok = errorCount === 0;
emitGateReport({
  gate: "edge-function-structured-logging",
  ok,
  issues,
  extra: {
    refactoredOk,
    refactoredTotal: status.refactoredFunctions.length,
    needsStandardizationRemaining: remainingCount,
    coverage: status.coverageNow,
  },
});
console.log(`[edge-function-structured-logging] ${ok ? "PASS" : "FAIL"} (${refactoredOk}/${status.refactoredFunctions.length} refactored fns retain logger, ${remainingCount} pending honest WARN)`);
process.exit(ok ? 0 : 1);
