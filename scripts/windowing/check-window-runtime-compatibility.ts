#!/usr/bin/env node
// SITA OS — Window Runtime Compatibility Validator (ADVISORY)
import { existsSync } from "node:fs";
const COMPAT = "src/lib/windowing/window-runtime-compatibility.ts";
const PROOF = "generated/windowing-proof/window-runtime-compatibility.json";
const issues: { severity: string; message: string }[] = [];
if (!existsSync(COMPAT)) issues.push({ severity: "warning", message: `Missing: ${COMPAT}` });
if (!existsSync(PROOF)) issues.push({ severity: "warning", message: `Missing: ${PROOF}` });
const ok = issues.length === 0;
console.log(`Window runtime compatibility: ${ok ? "✅" : "⚠️"} (${issues.length} advisories)`);