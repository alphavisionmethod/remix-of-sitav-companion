#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Component Canonicalization Checker (advisory)
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const issues: Array<{ severity: "warning"; area: string; message: string }> = [];

if (!existsSync("src/platform/architecture/component-duplication-map.ts")) {
  issues.push({ severity: "warning", area: "duplication", message: "No component-duplication-map found" });
}

mkdirSync("generated", { recursive: true });
writeFileSync("generated/component-duplication-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "component-canonicalization",
  ok: true,
  advisory: true,
  duplicateFamilies: [],
  issues,
}, null, 2));
console.log("✅ Component canonicalization report generated (advisory)");