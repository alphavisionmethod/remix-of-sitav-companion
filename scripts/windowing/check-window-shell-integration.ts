#!/usr/bin/env node
// SITA OS — Window Shell Integration Validator (ADVISORY)
import { existsSync } from "node:fs";
const files = [
  "src/lib/windowing/window-registry.ts",
  "src/lib/windowing/window-lifecycle-manager.ts",
  "src/lib/windowing/window-layout-engine.ts",
  "src/lib/windowing/window-z-order-manager.ts",
];
const issues: { severity: string; message: string }[] = [];
for (const f of files) {
  if (!existsSync(f)) issues.push({ severity: "warning", message: `Missing: ${f}` });
}
const ok = issues.length === 0;
console.log(`Window shell integration: ${ok ? "✅" : "⚠️"} (${issues.length} advisories)`);