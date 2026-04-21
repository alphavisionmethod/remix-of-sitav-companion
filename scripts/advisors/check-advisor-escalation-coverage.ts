#!/usr/bin/env node
// SITA OS — Advisor Escalation Coverage Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/ai-platform/runtime/advisor-escalation-policy.ts";
const REQUIRED_TRIGGERS = ["financial-over-500", "external-communication", "low-confidence", "irreversible", "system-config"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-escalation-policy.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_TRIGGERS.filter(t => !content.includes(`"${t}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-triggers", `Escalation policy missing triggers: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-escalation-coverage-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-escalation-coverage", advisory: true, ok: true,
  requiredTriggers: REQUIRED_TRIGGERS, warnings: vc.warnings.length,
});

vc.report("check-advisor-escalation-coverage");