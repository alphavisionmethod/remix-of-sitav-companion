#!/usr/bin/env node
// SITA OS — Advisor Supportability Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-support-diagnostics.ts";
const REQUIRED_BUNDLE_SECTIONS = ["snapshot", "recentReflections", "policyAdjustments", "escalationHistory"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-support-diagnostics.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_BUNDLE_SECTIONS.filter(s => !content.includes(s));
  if (missing.length > 0) {
    vc.add(SRC, "missing-sections", `Support diagnostics missing bundle sections: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-supportability-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-supportability", advisory: true, ok: true,
  requiredSections: REQUIRED_BUNDLE_SECTIONS, warnings: vc.warnings.length,
});

vc.report("check-advisor-supportability");