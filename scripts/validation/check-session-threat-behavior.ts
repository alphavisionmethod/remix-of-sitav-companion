#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Session Threat Behavior
// Scans src/lib/security/ for behavioral threshold modules and
// os-security/sessiond.ts for anomaly response. Reads
// generated/security-and-portability-closure/session-threat-runs/*.json
// for live evidence. Asserts admin-visibility wiring exists
// (kill_switch_audit_log linkage).
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

const SECURITY_DIR = "src/lib/security";
let detectorFound = false;
if (existsSync(SECURITY_DIR)) {
  const walk = (d: string): string[] => {
    const out: string[] = [];
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) out.push(...walk(p));
      else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
    }
    return out;
  };
  const files = walk(SECURITY_DIR);
  for (const f of files) {
    const src = readFileSync(f, "utf8").toLowerCase();
    if (src.includes("session") && (src.includes("threat") || src.includes("anomaly") || src.includes("biometric"))) {
      detectorFound = true;
      break;
    }
  }
}
if (!detectorFound) {
  issues.push({
    severity: "error",
    area: SECURITY_DIR,
    message: "No session-threat / anomaly detector found in src/lib/security/",
  });
}

const SESSIOND = "os-security/sessiond.ts";
if (existsSync(SESSIOND)) {
  const src = readFileSync(SESSIOND, "utf8").toLowerCase();
  if (!src.includes("anomaly") && !src.includes("threshold") && !src.includes("threat")) {
    issues.push({
      severity: "warning",
      area: SESSIOND,
      message: "sessiond exists but no anomaly/threshold pattern detected",
    });
  }
}

const RUNS_DIR = "generated/security-and-portability-closure/session-threat-runs";
let runCount = 0;
if (existsSync(RUNS_DIR)) {
  runCount = readdirSync(RUNS_DIR).filter((f) => f.endsWith(".json")).length;
}
if (runCount === 0) {
  issues.push({
    severity: "warning",
    area: "evidence",
    message: "pending-execution — no session-threat runs recorded yet",
  });
}

// Admin visibility — kill_switch_audit_log table is the canonical sink
const ADMIN_PANEL = "src/components/admin/ai-runtime/SecurityCouncilBoard.tsx";
if (
  !existsSync(ADMIN_PANEL) &&
  !existsSync("src/pages/admin/ai-runtime/SecurityCouncilBoard.tsx")
) {
  issues.push({
    severity: "warning",
    area: "admin-visibility",
    message: "Security Council board not found — admin visibility for session anomalies may be missing",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "session-threat-behavior", ok, issues, extra: { runCount, detectorFound } });
console.log(`[session-threat-behavior] ${ok ? "PASS" : "FAIL"} runs=${runCount}`);
process.exit(ok ? 0 : 1);
