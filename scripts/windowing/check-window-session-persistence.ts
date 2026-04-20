#!/usr/bin/env node
// SITA OS — Window Session Persistence Validator (ADVISORY)
import { existsSync, readFileSync } from "node:fs";
const STORE = "src/lib/windowing/window-session-store.ts";
const issues: { severity: string; message: string }[] = [];
if (!existsSync(STORE)) { issues.push({ severity: "warning", message: `Missing: ${STORE}` }); }
else {
  const src = readFileSync(STORE, "utf-8");
  for (const f of ["workspaceId", "monitorId", "focusOrder", "lifecycleState", "dpiScale", "snapZone"]) {
    if (!src.includes(f)) issues.push({ severity: "warning", message: `Session store missing field: ${f}` });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`Window session persistence: ${ok ? "✅" : "⚠️"} (${issues.length} advisories)`);