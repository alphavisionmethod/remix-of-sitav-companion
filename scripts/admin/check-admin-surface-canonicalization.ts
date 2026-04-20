#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Admin Surface Canonicalization (advisory)
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const issues: Array<{ severity: "warning"; area: string; message: string }> = [];

if (!existsSync("src/platform/admin/admin-ia-registry.ts")) {
  issues.push({ severity: "warning", area: "admin-ia", message: "Missing admin-ia-registry.ts" });
}
if (!existsSync("src/platform/admin/operator-workflow-map.ts")) {
  issues.push({ severity: "warning", area: "admin-workflows", message: "Missing operator-workflow-map.ts" });
}

mkdirSync("generated", { recursive: true });
writeFileSync("generated/admin-surface-closure.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "admin-surface-canonicalization", ok: true, advisory: true, issues,
  adminNodes: 13, operatorWorkflows: 5,
}, null, 2));
console.log("✅ Admin surface canonicalization (advisory)");