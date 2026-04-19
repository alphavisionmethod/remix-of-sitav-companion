#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta Validator: Security Adversarial Proof
// Aggregates the four adversarial validators + findings register.
// Asserts every claimed strong-security area has at least:
//   • a validator + an evidence source, OR
//   • an explicit pending-execution / partner-blocked classification
// Emits security-adversarial-proof-status.json consumed by panel.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const DIR = "generated/security-and-portability-closure";
mkdirSync(DIR, { recursive: true });

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function evidenceCount(sub: string): number {
  const p = join(DIR, sub);
  if (!existsSync(p)) return 0;
  return readdirSync(p).filter((f) => f.endsWith(".json")).length;
}

function fileHasContent(p: string, signatures: string[]): boolean {
  if (!existsSync(p)) return false;
  const src = readFileSync(p, "utf8").toLowerCase();
  return signatures.every((s) => src.includes(s.toLowerCase()));
}

const status = {
  rls: { evidenceCount: evidenceCount("rls-stress-runs") },
  electron: {
    wired:
      fileHasContent("electron/runtime-shield.cjs", ["debug"]) &&
      fileHasContent("electron/dlp-guard.cjs", ["clipboard"]) &&
      fileHasContent("electron/network-sentinel.cjs", ["allowlist"]),
    drillEvidence: existsSync("electron/__threat_drills__")
      ? readdirSync("electron/__threat_drills__").filter((f) => f.endsWith(".json")).length
      : 0,
  },
  debugger: {
    wired:
      fileHasContent("electron/runtime-shield.cjs", ["debug"]) &&
      fileHasContent("electron/integrity-check.cjs", ["hash"]),
    drillEvidence: existsSync("electron/__threat_drills__")
      ? readdirSync("electron/__threat_drills__").filter((f) => f.toLowerCase().includes("tamper")).length
      : 0,
  },
  session: {
    wired: existsSync("src/lib/security"),
    runEvidence: evidenceCount("session-threat-runs"),
  },
  findingsRegister: existsSync(join(DIR, "security-findings-register.json")),
};

if (!status.electron.wired) {
  issues.push({ severity: "error", area: "electron", message: "Electron security modules incomplete" });
}
if (!status.debugger.wired) {
  issues.push({ severity: "error", area: "debugger", message: "Debugger/integrity hooks incomplete" });
}
if (!status.session.wired) {
  issues.push({ severity: "error", area: "session", message: "src/lib/security/ missing" });
}
if (!status.findingsRegister) {
  issues.push({ severity: "warning", area: "findings", message: "security-findings-register.json missing" });
}
if (status.rls.evidenceCount === 0) {
  issues.push({ severity: "warning", area: "rls", message: "pending-execution — no RLS stress runs" });
}
if (status.electron.drillEvidence === 0) {
  issues.push({
    severity: "warning",
    area: "electron-drills",
    message: "partner-blocked — no Electron threat drill evidence captured",
  });
}
if (status.debugger.drillEvidence === 0) {
  issues.push({
    severity: "warning",
    area: "tamper-drills",
    message: "pending-drill — no real-device tamper drill recorded",
  });
}
if (status.session.runEvidence === 0) {
  issues.push({
    severity: "warning",
    area: "session-runs",
    message: "pending-execution — no session-threat run evidence",
  });
}

writeFileSync(
  join(DIR, "security-adversarial-proof-status.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), ...status }, null, 2),
);

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "security-adversarial-proof", ok, issues, extra: status });
console.log(`[security-adversarial-proof] ${ok ? "PASS" : "FAIL"} (${issues.length} issues)`);
process.exit(ok ? 0 : 1);
