#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — ADVISORY: Auth Pattern Consistency
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_AUTH_MAP } from "../../../src/lib/backend-topology/edge-function-auth-map";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

interface Issue { fn: string; severity: "warning"; message: string }
const issues: Issue[] = [];
const activeFns = EDGE_FUNCTION_REGISTRY.filter(f => f.status === "active");

for (const f of activeFns) {
  const auth = EDGE_FUNCTION_AUTH_MAP[f.name];
  if (!auth) {
    issues.push({ fn: f.name, severity: "warning", message: "Missing auth-map entry" });
    continue;
  }
  if (auth.auth !== f.authModel) {
    issues.push({ fn: f.name, severity: "warning", message: `Auth mismatch: registry=${f.authModel} vs auth-map=${auth.auth}` });
  }
  // Admin category must be adminOnly
  if (f.category === "ADMIN_BFF" && !auth.adminOnly) {
    issues.push({ fn: f.name, severity: "warning", message: "ADMIN_BFF not marked adminOnly in auth-map" });
  }
}

writeFileSync(join(OUT, "edge-function-auth-patterns-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-auth-patterns",
  ok: true, warningCount: issues.length, issues,
}, null, 2));

console.log(`${issues.length === 0 ? "✅" : "⚠"} edge-function-auth-patterns: ${issues.length} warnings`);
process.exit(0);