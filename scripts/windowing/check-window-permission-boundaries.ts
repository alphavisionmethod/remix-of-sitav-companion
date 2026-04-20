#!/usr/bin/env node
// SITA OS — Window Permission Boundaries Validator (ADVISORY)
import { existsSync } from "node:fs";
const BOUNDARY = "src/lib/windowing/window-permission-boundary.ts";
const CAPABILITY = "src/lib/windowing/window-capability-policy.ts";
const issues: { severity: string; message: string }[] = [];
if (!existsSync(BOUNDARY)) issues.push({ severity: "warning", message: `Missing: ${BOUNDARY}` });
if (!existsSync(CAPABILITY)) issues.push({ severity: "warning", message: `Missing: ${CAPABILITY}` });
const ok = issues.length === 0;
console.log(`Window permission boundaries: ${ok ? "✅" : "⚠️"} (${issues.length} advisories)`);