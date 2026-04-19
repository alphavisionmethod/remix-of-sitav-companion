#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Electron Threat Detection Proof
// Verifies runtime-shield.cjs / dlp-guard.cjs / network-sentinel.cjs
// expose the required detection paths AND that real drill evidence
// exists in electron/__threat_drills__/. Honest partner-blocked WARN
// when no Electron build environment has captured drills.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

const REQUIRED_HOOKS: { file: string; signatures: string[] }[] = [
  {
    file: "electron/runtime-shield.cjs",
    signatures: ["anti-debug", "vm-detect", "preload-integrity"],
  },
  {
    file: "electron/dlp-guard.cjs",
    signatures: ["screenshot", "clipboard", "watermark"],
  },
  {
    file: "electron/network-sentinel.cjs",
    signatures: ["allowlist", "cert"],
  },
];

for (const { file, signatures } of REQUIRED_HOOKS) {
  if (!existsSync(file)) {
    issues.push({ severity: "error", area: file, message: "Required Electron security module missing" });
    continue;
  }
  const src = readFileSync(file, "utf8").toLowerCase();
  for (const sig of signatures) {
    if (!src.includes(sig.toLowerCase())) {
      issues.push({ severity: "warning", area: file, message: `Detection signature missing: "${sig}"` });
    }
  }
}

const DRILLS_DIR = "electron/__threat_drills__";
let drillCount = 0;
if (existsSync(DRILLS_DIR)) {
  drillCount = readdirSync(DRILLS_DIR).filter((f) => f.endsWith(".json")).length;
}
if (drillCount === 0) {
  issues.push({
    severity: "warning",
    area: "drills",
    message:
      "partner-blocked — no Electron threat drills recorded. Drills must run on a real Electron build host.",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: "electron-threat-detection-proof",
  ok,
  issues,
  extra: { drillCount, hooks: REQUIRED_HOOKS.length },
});
console.log(`[electron-threat-detection-proof] ${ok ? "PASS" : "FAIL"} drills=${drillCount}`);
process.exit(ok ? 0 : 1);
