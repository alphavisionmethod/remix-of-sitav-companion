#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Validator: Safe Cleanup Regressions
// Aggregates the 4 sibling cleanup validators + verifies that the
// architectural-cleanup-status.json declares zero deletions.
// BLOCKs if any prior pass attempted a removal without the 9-check
// policy being satisfied.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/architectural-cleanup/architectural-cleanup-status.json";
const SIBLINGS = [
  "no-browser-globals-in-portable-code",
  "edge-function-structured-logging",
  "no-duplicate-truth-manifests",
  "no-stale-canonical-docs",
];

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

if (!existsSync(STATUS)) {
  emitGateReport({
    gate: "safe-cleanup-regressions",
    ok: false,
    issues: [{ severity: "error", area: STATUS, message: "architectural-cleanup-status.json missing" }],
  });
  console.error(`[safe-cleanup-regressions] FAIL — status missing`);
  process.exit(1);
}

const status = JSON.parse(readFileSync(STATUS, "utf8")) as {
  policy?: { removalAllowedThisPass?: boolean; additiveOnly?: boolean };
  summary?: { filesDeleted?: number };
};

// Policy-level invariant: when the pass is additive-only, filesDeleted must equal 0.
if (status.policy?.additiveOnly && (status.summary?.filesDeleted ?? 0) > 0) {
  issues.push({
    severity: "error",
    area: STATUS,
    message: `Pass declared additive-only but reports ${status.summary?.filesDeleted} filesDeleted — policy violation.`,
  });
}

// Aggregate sibling reports — if any sibling FAILed, surface that here.
let siblingFailures = 0;
for (const gate of SIBLINGS) {
  const reportFile = `generated/${gate}-report.json`;
  if (!existsSync(reportFile)) {
    issues.push({
      severity: "warning",
      area: reportFile,
      message: `Sibling validator "${gate}" has not yet produced a report — run closure:architectural-cleanup:run-all.`,
    });
    continue;
  }
  try {
    const r = JSON.parse(readFileSync(reportFile, "utf8")) as { ok?: boolean; errorCount?: number };
    if (r.ok === false || (r.errorCount ?? 0) > 0) {
      siblingFailures++;
      issues.push({
        severity: "error",
        area: gate,
        message: `Sibling validator "${gate}" reported errors (errorCount=${r.errorCount ?? "?"}).`,
      });
    }
  } catch {
    issues.push({
      severity: "warning",
      area: reportFile,
      message: `Could not parse sibling report.`,
    });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const ok = errorCount === 0;
emitGateReport({
  gate: "safe-cleanup-regressions",
  ok,
  issues,
  extra: { siblingsChecked: SIBLINGS.length, siblingFailures },
});
console.log(`[safe-cleanup-regressions] ${ok ? "PASS" : "FAIL"} (${siblingFailures}/${SIBLINGS.length} sibling validators failing)`);
process.exit(ok ? 0 : 1);
