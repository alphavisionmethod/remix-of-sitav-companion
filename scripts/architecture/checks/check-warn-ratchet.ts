#!/usr/bin/env node
/* eslint-disable no-console */
// Phase V — Warn-ratchet gate: prevents regression of release-readiness
// warnings beyond the sealed ceiling. Graduates to BLOCK when warnings
// drop below MIN_BUDGET_FOR_BLOCK.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";

const REPORT = "generated/os-release-readiness-report.json";
const CEILING = Number(process.env.OS_WARNING_CEILING ?? 3360); // Phase Y ratchet: 3400→3360 (current 3348, headroom 12)
const MIN_BUDGET_FOR_BLOCK = 1000; // when warnings ≤ 1000, this gate becomes hard block

if (!existsSync(REPORT)) {
  console.warn("⚠ os-release-readiness-report.json missing — run check-os-release-readiness first");
  process.exit(0);
}

const report = JSON.parse(readFileSync(REPORT, "utf-8")) as { totalWarnings?: number; totalErrors?: number };
const warnings = report.totalWarnings ?? 0;
const errors = report.totalErrors ?? 0;
const ok = warnings <= CEILING && errors === 0;
const isBlock = CEILING <= MIN_BUDGET_FOR_BLOCK;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/warn-ratchet-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "warn-ratchet",
  level: isBlock ? "block" : "warn",
  ceiling: CEILING,
  observedWarnings: warnings,
  observedErrors: errors,
  headroom: Math.max(0, CEILING - warnings),
  ok,
}, null, 2));

console.log(
  `${ok ? "✅" : "❌"} Warn ratchet: ${warnings} warnings (ceiling ${CEILING}, headroom ${Math.max(0, CEILING - warnings)}), errors ${errors} ` +
  `[${isBlock ? "BLOCK" : "WARN"}]`
);
// Warn-level until budget shrinks
process.exit(isBlock && !ok ? 1 : 0);
