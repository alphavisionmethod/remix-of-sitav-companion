#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — ADVISORY: Edge Function Caller Matrix
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { FRONTEND_ACTION_API_MAP } from "../../../src/lib/backend-topology/frontend-action-api-map";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

interface Issue { fn: string; severity: "error" | "warning"; message: string }
const issues: Issue[] = [];
const activeFns = EDGE_FUNCTION_REGISTRY.filter(f => f.status === "active" || f.status === "experimental");

for (const f of activeFns) {
  if (f.allowedCallers.length === 0) {
    issues.push({ fn: f.name, severity: "warning", message: "No allowed callers declared" });
  }
}

// Check frontend actions target real functions
const registryNames = new Set(EDGE_FUNCTION_REGISTRY.map(f => f.name));
for (const a of FRONTEND_ACTION_API_MAP) {
  if (a.kind === "edge-function" && !registryNames.has(a.target)) {
    issues.push({ fn: a.target, severity: "warning", message: `Frontend action "${a.id}" targets unregistered function` });
  }
}

const ok = true; // advisory
writeFileSync(join(OUT, "edge-function-caller-matrix-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-caller-matrix",
  ok, warningCount: issues.length, issues,
}, null, 2));

console.log(`${issues.length === 0 ? "✅" : "⚠"} edge-function-caller-matrix: ${issues.length} warnings`);
process.exit(0);