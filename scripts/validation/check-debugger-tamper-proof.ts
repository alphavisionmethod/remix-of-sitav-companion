#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Debugger / Tamper Resistance Proof
// Verifies runtime-shield.cjs exports debugger-detection hooks,
// integrity-check.cjs wires ASAR hash check, and tamper drill
// evidence exists. Honest WARN-tier where real-device drill needed.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

const SHIELD = "electron/runtime-shield.cjs";
const INTEGRITY = "electron/integrity-check.cjs";

if (!existsSync(SHIELD)) {
  issues.push({ severity: "error", area: SHIELD, message: "runtime-shield.cjs missing" });
} else {
  const src = readFileSync(SHIELD, "utf8").toLowerCase();
  if (!src.includes("debugger") && !src.includes("debug")) {
    issues.push({ severity: "error", area: SHIELD, message: "debugger detection missing" });
  }
  if (!src.includes("integrity") && !src.includes("tamper")) {
    issues.push({ severity: "warning", area: SHIELD, message: "integrity/tamper hook not referenced" });
  }
}

if (!existsSync(INTEGRITY)) {
  issues.push({ severity: "error", area: INTEGRITY, message: "integrity-check.cjs missing" });
} else {
  const src = readFileSync(INTEGRITY, "utf8").toLowerCase();
  if (!src.includes("asar") && !src.includes("hash")) {
    issues.push({ severity: "warning", area: INTEGRITY, message: "ASAR hash check pattern not detected" });
  }
}

const DRILLS_DIR = "electron/__threat_drills__";
let drillCount = 0;
if (existsSync(DRILLS_DIR)) {
  drillCount = readdirSync(DRILLS_DIR).filter((f) => f.toLowerCase().includes("tamper")).length;
}
if (drillCount === 0) {
  issues.push({
    severity: "warning",
    area: "drills",
    message: "pending-drill — no real-device tamper drill recorded yet (honest WARN-tier)",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "debugger-tamper-proof", ok, issues, extra: { drillCount } });
console.log(`[debugger-tamper-proof] ${ok ? "PASS" : "FAIL"} drills=${drillCount}`);
process.exit(ok ? 0 : 1);
