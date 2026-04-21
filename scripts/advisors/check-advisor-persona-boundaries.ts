#!/usr/bin/env node
// SITA OS — Advisor Persona Boundary Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-persona-boundary-map.ts";
const HIGH_RISK = ["money-advisor", "legal-advisor", "tax-advisor", "security-advisor"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-persona-boundary-map.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  for (const id of HIGH_RISK) {
    if (!content.includes(`"${id}"`)) {
      vc.add(SRC, "missing-boundary", `High-risk advisor "${id}" has no persona boundary`, "warning");
    }
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-persona-boundary-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-persona-boundaries", advisory: true,
  ok: true, highRiskChecked: HIGH_RISK, warnings: vc.warnings.length,
});

vc.report("check-advisor-persona-boundaries");