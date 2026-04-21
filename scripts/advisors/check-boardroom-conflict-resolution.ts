#!/usr/bin/env node
// SITA OS — Boardroom Conflict Resolution Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-conflict-resolution-policy.ts";
const REQUIRED_STRATEGIES = ["higher-confidence-wins", "domain-authority-wins", "owner-decides"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-conflict-resolution-policy.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_STRATEGIES.filter(s => !content.includes(`"${s}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-strategies", `Conflict resolution missing strategies: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/boardroom-conflict-resolution-check.json", {
  generatedAt: new Date().toISOString(), gate: "boardroom-conflict-resolution", advisory: true, ok: true,
  requiredStrategies: REQUIRED_STRATEGIES, warnings: vc.warnings.length,
});

vc.report("check-boardroom-conflict-resolution");