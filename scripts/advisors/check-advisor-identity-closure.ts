#!/usr/bin/env node
// SITA OS — Advisor Identity Closure Validator (BLOCK)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-identity-registry.ts";

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-identity-registry.ts not found");
} else {
  const content = readFileSync(SRC, "utf-8");
  const requiredFields = ["advisorId", "displayName", "personaDescription", "voiceTone", "domainAuthority", "trustFloor", "trustCeiling", "disabledFallback"];
  for (const f of requiredFields) {
    if (!content.includes(f)) {
      vc.add(SRC, "missing-field", `Identity registry missing field: ${f}`);
    }
  }
  const idMatches = content.match(/advisorId:\s*["']/g);
  const count = idMatches?.length ?? 0;
  if (count < 10) {
    vc.add(SRC, "low-advisor-count", `Only ${count} advisors declared (expected >=10)`);
  }
  writeJsonOutput("generated/advisor-boardroom-proof/advisor-identity-closure-check.json", {
    generatedAt: new Date().toISOString(), gate: "advisor-identity-closure", ok: vc.errors.length === 0,
    advisorCount: count, requiredFields, missingFields: requiredFields.filter(f => !content.includes(f)),
  });
  writeJsonOutput("generated/advisor-identity-closure-report.json", {
    generatedAt: new Date().toISOString(), gate: "advisor-identity-closure", ok: vc.errors.length === 0,
    errorCount: vc.errors.length, warningCount: 0,
    advisorCount: count, requiredFields, missingFields: requiredFields.filter(f => !content.includes(f)),
  });
}

vc.report("check-advisor-identity-closure");
vc.exitIfErrors();