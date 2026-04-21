#!/usr/bin/env node
// SITA OS — Advisor Override Model Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-override-model.ts";
const REQUIRED_SCOPES = ["pause", "disable", "force-escalate", "reduce-autonomy", "reset-trust", "clear-memory", "force-reevaluate"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-override-model.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_SCOPES.filter(s => !content.includes(`"${s}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-scopes", `Override model missing scopes: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-override-model-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-override-model", advisory: true, ok: true,
  requiredScopes: REQUIRED_SCOPES, warnings: vc.warnings.length,
});

vc.report("check-advisor-override-model");