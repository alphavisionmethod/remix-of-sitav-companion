#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 7: Security Fabric Runtime Probes — verifies probe edge function + 7-layer coverage.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";

const FN = "supabase/functions/security-fabric-runtime-probe/index.ts";
const REQUIRED_LAYERS = [
  "runtime_shield",
  "ai_output_firewall",
  "session_threat_detector",
  "csp_baseline",
];

const issues: Array<{ severity: string; area: string; message: string }> = [];

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: "security-fabric-runtime-probe function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  for (const layer of REQUIRED_LAYERS) {
    if (!src.includes(`"${layer}"`)) {
      issues.push({ severity: "error", area: "layer-coverage", message: `missing probe for layer: ${layer}` });
    }
  }
  if (!src.includes("security_fabric_probe_results")) {
    issues.push({ severity: "error", area: "persistence", message: "probe must persist to security_fabric_probe_results" });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "security-fabric-probes",
  ok,
  errorCount,
  warningCount,
  issues,
};
mkdirSync("generated", { recursive: true });
writeFileSync("generated/security-fabric-probes-report.json", JSON.stringify(report, null, 2));
console.log(`${ok ? "✅" : "❌"} security-fabric-probes: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
