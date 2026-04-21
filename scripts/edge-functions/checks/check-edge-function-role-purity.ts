#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — BLOCK gate: Edge Function Role Purity
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import type { BackendCategory } from "../../../src/lib/backend-topology/edge-function-categories";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

const VALID_CATEGORIES: ReadonlySet<string> = new Set<string>([
  "PUBLIC_BFF", "ADMIN_BFF", "DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION",
  "CONNECTOR_WEBHOOK_FUNCTION", "RUNTIME_SYSTEM_FUNCTION",
  "SPLIT_REQUIRED", "DUPLICATE_MERGE_REQUIRED", "WRAPPER_ONLY", "DEPRECATE_AND_REDIRECT",
]);

interface Issue { fn: string; severity: "error" | "warning"; message: string }
const issues: Issue[] = [];

for (const f of EDGE_FUNCTION_REGISTRY) {
  if (!VALID_CATEGORIES.has(f.category)) {
    issues.push({ fn: f.name, severity: "error", message: `Invalid category: ${f.category}` });
  }
  // Deprecated/wrapper still receiving traffic
  if ((f.status === "deprecated" || f.migrationStatus === "wrapper") && f.allowedCallers.includes("frontend-user")) {
    issues.push({ fn: f.name, severity: "warning", message: "Deprecated/wrapper function still allows frontend-user callers" });
  }
  // PUBLIC_BFF must allow frontend callers
  if (f.category === "PUBLIC_BFF" && !f.allowedCallers.includes("frontend-user") && !f.allowedCallers.includes("any-authenticated")) {
    issues.push({ fn: f.name, severity: "warning", message: "PUBLIC_BFF does not allow frontend-user callers" });
  }
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;

writeFileSync(join(OUT, "edge-function-role-purity-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-role-purity",
  ok, errorCount: errors, warningCount: issues.length - errors, issues,
}, null, 2));

console.log(`${ok ? "✅" : "❌"} edge-function-role-purity: ${errors} errors, ${issues.length - errors} warnings`);
process.exit(ok ? 0 : 1);