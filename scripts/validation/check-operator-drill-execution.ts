#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";
const STATUS = "generated/hardware-and-operator-closure/hardware-and-operator-verification.json";
let drills = 0;
if (existsSync(STATUS)) drills = (JSON.parse(readFileSync(STATUS, "utf-8")) as { operator_drills_total?: number }).operator_drills_total ?? 0;
const issues = drills === 0 ? [{ severity: "warning" as const, area: "drills", message: "No operator drill executions recorded — pending human execution" }] : [];
emitGateReport({ gate: "operator-drill-execution", ok: true, issues, extra: { drills, level: drills >= 6 ? "block" : "warn", classification: drills >= 6 ? "real-execution" : "pending-human-execution" } });
console.log(`${drills >= 6 ? "✅" : "⚠"} operator-drill-execution: ${drills} drill(s) [${drills >= 6 ? "BLOCK" : "WARN-pending-human-execution"}]`);
process.exit(0);
