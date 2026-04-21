#!/usr/bin/env node
// SITA OS — Advisor Memory Aging Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const SRC = "src/lib/advisors/advisor-memory-aging-policy.ts";
const REQUIRED_LAYERS = ["working", "short-term", "long-term", "archival"];

if (!existsSync(SRC)) {
  vc.add(SRC, "missing-file", "advisor-memory-aging-policy.ts not found", "warning");
} else {
  const content = readFileSync(SRC, "utf-8");
  const missing = REQUIRED_LAYERS.filter(l => !content.includes(`"${l}"`));
  if (missing.length > 0) {
    vc.add(SRC, "missing-layers", `Memory aging missing layers: ${missing.join(", ")}`, "warning");
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/advisor-memory-aging-check.json", {
  generatedAt: new Date().toISOString(), gate: "advisor-memory-aging", advisory: true, ok: true,
  requiredLayers: REQUIRED_LAYERS, warnings: vc.warnings.length,
});

vc.report("check-advisor-memory-aging");