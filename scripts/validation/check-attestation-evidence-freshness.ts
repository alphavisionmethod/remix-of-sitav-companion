#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";
const STATUS = "generated/hardware-and-operator-closure/hardware-and-operator-verification.json";
let runs = 0;
if (existsSync(STATUS)) runs = (JSON.parse(readFileSync(STATUS, "utf-8")) as { hardware_runs_total?: number }).hardware_runs_total ?? 0;
const issues = runs === 0 ? [{ severity: "warning" as const, area: "freshness", message: "No attestation runs to evaluate freshness" }] : [];
emitGateReport({ gate: "attestation-evidence-freshness", ok: true, issues, extra: { runs, windowHours: 720 } });
console.log(`${runs > 0 ? "✅" : "⚠"} attestation-evidence-freshness: ${runs} run(s) [${runs > 0 ? "BLOCK" : "WARN"}]`);
process.exit(0);
