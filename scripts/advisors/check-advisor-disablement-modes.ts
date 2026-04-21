#!/usr/bin/env node
// SITA OS — Advisor Disablement Modes Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-disablement-policy.ts";
const REQUIRED_REASONS = ["owner-paused", "budget-exhausted", "kill-switch", "trust-degraded", "error-rate-exceeded", "maintenance"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-disablement-policy.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_REASONS.filter(r => !content.includes(`"${r}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-reasons", `Disablement policy missing reasons: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-disablement-modes-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-disablement-modes", advisory: true, ok: true,
  requiredReasons: REQUIRED_REASONS, warnings: vc.warnings.length,
});

vc.report("check-advisor-disablement-modes");