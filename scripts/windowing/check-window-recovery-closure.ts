#!/usr/bin/env node
// SITA OS — Window Recovery Closure Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
const RECOVERY = "src/lib/windowing/window-recovery.ts";
const PROOF = "generated/windowing-proof/window-recovery-closure.json";
const issues: { severity: string; message: string }[] = [];
if (!existsSync(RECOVERY)) issues.push({ severity: "warning", message: `Missing: ${RECOVERY}` });
else {
  const src = readFileSync(RECOVERY, "utf-8");
  for (const fn of ["quarantineCorruptedState", "repairModalChain", "selectiveRestore", "degradedRestore"]) {
    if (!src.includes(fn)) issues.push({ severity: "warning", message: `Recovery missing: ${fn}` });
  }
}
if (!existsSync(PROOF)) issues.push({ severity: "warning", message: `Missing: ${PROOF}` });
const ok = issues.length === 0;
console.log(`Window recovery closure: ${ok ? "✅" : "⚠️"} (${issues.length} advisories)`);