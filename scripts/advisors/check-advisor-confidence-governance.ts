#!/usr/bin/env node
// SITA OS — Advisor Confidence Governance Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-confidence-policy.ts";
const REQUIRED_CLASSES = ["observe", "recommend", "draft", "simulate", "execute", "execute-financial", "communicate-external", "system-config"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-confidence-policy.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_CLASSES.filter(c => !content.includes(`"${c}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-action-classes", `Confidence policy missing action classes: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-confidence-governance-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-confidence-governance", advisory: true, ok: true,
  requiredClasses: REQUIRED_CLASSES, warnings: vc.warnings.length,
});

vc.report("check-advisor-confidence-governance");