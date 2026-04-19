#!/usr/bin/env node
/* eslint-disable no-console */
// Final gate meaningfulness meta-gate. Reads the existing
// gate-meaningfulness-report.json (Phase 5 product) and asserts that
// the share of structural-only gates in the master aggregator does not
// exceed 25% — preventing "false green" via box-checking.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/final-proof-verification/gate-meaningfulness-status.json";
const REPORT = "generated/gate-meaningfulness-report.json";

const issues: GateIssue[] = [];

let totalGates = 0;
let structuralGates = 0;
let behavioralGates = 0;
let smokeGates = 0;
let e2eGates = 0;

if (existsSync(STATUS)) {
  try {
    const data = JSON.parse(readFileSync(STATUS, "utf-8"));
    totalGates = Number(data.totalGatesAudited ?? 0);
    structuralGates = Number(data.structural ?? 0);
    behavioralGates = Number(data.behavioral ?? 0);
    smokeGates = Number(data.smoke ?? 0);
    e2eGates = Number(data.e2e ?? 0);
  } catch (e: any) {
    issues.push({ severity: "warning", area: "parse", message: `Failed to parse ${STATUS}: ${e.message}` });
  }
} else {
  // Fallback: count gate-report.json files in generated/
  if (existsSync("generated")) {
    const files = readdirSync("generated").filter((f) => f.endsWith("-report.json"));
    totalGates = files.length;
  }
  issues.push({
    severity: "warning",
    area: "missing-classification",
    message: `${STATUS} not present — classification audit not run; using count-only fallback`,
  });
}

const structuralRatio = totalGates > 0 ? structuralGates / totalGates : 0;
const STRUCTURAL_CEILING = 0.25;

if (structuralRatio > STRUCTURAL_CEILING) {
  issues.push({
    severity: "error",
    area: "structural-overweight",
    message: `${(structuralRatio * 100).toFixed(1)}% of gates are structural-only (ceiling ${STRUCTURAL_CEILING * 100}%)`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(
  `${ok ? "✅" : "❌"} final-gate-meaningfulness: ${totalGates} gates · structural ${structuralGates} · behavioral ${behavioralGates} · smoke ${smokeGates} · e2e ${e2eGates}`,
);
issues.slice(0, 10).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "final-gate-meaningfulness",
  ok,
  issues,
  extra: { totalGates, structuralGates, behavioralGates, smokeGates, e2eGates, structuralRatio },
});
process.exit(ok ? 0 : 1);
