#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Desktop Windowing Closure Validator
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REQUIRED = [
  "src/lib/windowing/window-registry.ts",
  "src/lib/windowing/window-session-store.ts",
  "src/lib/windowing/window-recovery.ts",
  "src/lib/windowing/window-capability-policy.ts",
  "generated/windowing-closure.json",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "warning", area: "windowing", message: `Missing: ${f}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/desktop-windowing-closure-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "desktop-windowing-closure", ok, issues,
}, null, 2));
console.log(`Windowing closure: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);