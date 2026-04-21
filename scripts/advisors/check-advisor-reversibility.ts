#!/usr/bin/env node
// SITA OS — Advisor Reversibility Validator (BLOCK)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/ai-platform/runtime/advisor-reversibility-map.ts";
const REQUIRED_CLASSIFICATIONS = ["fully-reversible", "partially-reversible", "irreversible", "time-limited"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-reversibility-map.ts not found");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_CLASSIFICATIONS.filter(c => !content.includes(`"${c}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-classifications", `Reversibility map missing classifications: ${missing.join(", ")}`);
  }
  const entryCount = (content.match(/actionType:\s*["']/g) || []).length;
  if (entryCount < 5) {
    vc.add(SRC, "low-entry-count", `Only ${entryCount} reversibility entries (expected >=5)`);
  }
  writeJsonOutput("generated/advisor-boardroom-proof/advisor-reversibility-check.json", {
    generatedAt: new Date().toISOString(), gate: "advisor-reversibility", ok: vc.errors.length === 0,
    entryCount, requiredClassifications: REQUIRED_CLASSIFICATIONS, missingClassifications: missing,
  });
  writeJsonOutput("generated/advisor-reversibility-report.json", {
    generatedAt: new Date().toISOString(), gate: "advisor-reversibility", ok: vc.errors.length === 0,
    errorCount: vc.errors.length, warningCount: vc.warnings.length, issues: vc.violations,
  });
}

vc.report("check-advisor-reversibility");
vc.exitIfErrors();