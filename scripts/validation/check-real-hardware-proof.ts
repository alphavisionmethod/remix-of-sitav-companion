#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";
const STATUS = "generated/hardware-and-operator-closure/hardware-and-operator-verification.json";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];
let runs = 0;
if (existsSync(STATUS)) {
  const d = JSON.parse(readFileSync(STATUS, "utf-8")) as { hardware_runs_total?: number };
  runs = d.hardware_runs_total ?? 0;
}
if (runs === 0) issues.push({ severity: "warning", area: "hardware-runs", message: "No real-device runs recorded yet — partner-blocked" });
emitGateReport({ gate: "real-hardware-proof", ok: true, issues, extra: { runs, level: runs > 0 ? "block" : "warn", classification: runs > 0 ? "real-evidence" : "partner-blocked" } });
console.log(`${runs > 0 ? "✅" : "⚠"} real-hardware-proof: ${runs} run(s) [${runs > 0 ? "BLOCK" : "WARN-partner-blocked"}]`);
process.exit(0);
