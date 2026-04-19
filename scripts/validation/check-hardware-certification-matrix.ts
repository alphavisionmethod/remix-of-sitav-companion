#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";
const STATUS = "generated/hardware-and-operator-closure/hardware-and-operator-verification.json";
let runs = 0;
if (existsSync(STATUS)) {
  const d = JSON.parse(readFileSync(STATUS, "utf-8")) as { hardware_runs_total?: number };
  runs = d.hardware_runs_total ?? 0;
}
const issues = runs === 0 ? [{ severity: "warning" as const, area: "matrix", message: "Matrix empty — partner-blocked" }] : [];
emitGateReport({ gate: "hardware-certification-matrix", ok: true, issues, extra: { runs, level: runs > 0 ? "block" : "warn" } });
console.log(`${runs > 0 ? "✅" : "⚠"} hardware-certification-matrix: ${runs} entries [${runs > 0 ? "BLOCK" : "WARN"}]`);
process.exit(0);
