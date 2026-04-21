#!/usr/bin/env node
// SITA OS — Advisor Reflection Policy Loop Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-reflection-policy-loop.ts";
const REQUIRED_SIGNALS = ["outcomeQuality", "ownerAction", "executionFitness"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-reflection-policy-loop.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_SIGNALS.filter(s => !content.includes(s));
  if (missing.length > 0) {
    vc.add(SRC, "missing-signals", `Reflection loop missing signals: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-reflection-policy-loop-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-reflection-policy-loop", advisory: true, ok: true,
  requiredSignals: REQUIRED_SIGNALS, warnings: vc.warnings.length,
});

vc.report("check-advisor-reflection-policy-loop");