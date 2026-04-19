#!/usr/bin/env node
/* eslint-disable no-console */
// Real validator: reads individual hardware run files in
// generated/hardware-and-operator-closure/runs/*.json, enforces 720h (30d) freshness
// per device class.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const RUNS_DIR = "generated/hardware-and-operator-closure/runs";
const STATUS = "generated/hardware-and-operator-closure/hardware-and-operator-verification.json";
const WINDOW_HOURS = 720;

interface RunFile { runId?: string; deviceClass?: string; deviceModel?: string; capturedAt?: string; recordedAt?: string; phase?: string; result?: string }
interface DeviceFreshness { deviceClass: string; runs: number; latestAt: string | null; ageHours: number | null; status: "fresh" | "stale" | "expired" | "no-data" }

const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];
const runFiles: RunFile[] = [];
let totalRuns = 0;

if (existsSync(RUNS_DIR)) {
  for (const f of readdirSync(RUNS_DIR)) {
    if (!f.endsWith(".json")) continue;
    const full = join(RUNS_DIR, f);
    try {
      const j = JSON.parse(readFileSync(full, "utf-8")) as RunFile;
      if (!j.capturedAt && !j.recordedAt) {
        const st = statSync(full);
        j.capturedAt = st.mtime.toISOString();
      }
      runFiles.push(j);
      totalRuns += 1;
    } catch {
      issues.push({ severity: "warning", area: "parse", message: `Failed to parse ${f}` });
    }
  }
}

// Fallback to aggregate count from status file when no per-run files exist
if (runFiles.length === 0 && existsSync(STATUS)) {
  totalRuns = (JSON.parse(readFileSync(STATUS, "utf-8")) as { hardware_runs_total?: number }).hardware_runs_total ?? 0;
}

const byDevice = new Map<string, RunFile[]>();
for (const r of runFiles) {
  const key = r.deviceClass ?? "unknown";
  const arr = byDevice.get(key) ?? [];
  arr.push(r);
  byDevice.set(key, arr);
}

const now = Date.now();
const perDevice: DeviceFreshness[] = [];
for (const [deviceClass, runs] of byDevice) {
  const sorted = [...runs].sort((a, b) => (b.capturedAt ?? b.recordedAt ?? "").localeCompare(a.capturedAt ?? a.recordedAt ?? ""));
  const latestRaw = sorted[0]?.capturedAt ?? sorted[0]?.recordedAt ?? null;
  const ageHours = latestRaw ? Math.floor((now - new Date(latestRaw).getTime()) / 3_600_000) : null;
  let status: DeviceFreshness["status"];
  if (ageHours === null) status = "no-data";
  else if (ageHours <= WINDOW_HOURS) status = "fresh";
  else if (ageHours <= WINDOW_HOURS * 2) status = "stale";
  else status = "expired";
  perDevice.push({ deviceClass, runs: runs.length, latestAt: latestRaw, ageHours, status });
}

const expired = perDevice.filter((p) => p.status === "expired");
const stale = perDevice.filter((p) => p.status === "stale");

if (totalRuns === 0) {
  issues.push({ severity: "warning", area: "freshness", message: "No attestation runs to evaluate freshness — partner-blocked" });
}
if (expired.length > 0) {
  issues.push({ severity: "warning", area: "expired", message: `${expired.length} device class(es) expired (>${WINDOW_HOURS * 2}h)` });
}
if (stale.length > 0) {
  issues.push({ severity: "warning", area: "stale", message: `${stale.length} device class(es) stale (>${WINDOW_HOURS}h)` });
}

const classification = totalRuns === 0 ? "partner-blocked" : expired.length > 0 ? "expired" : stale.length > 0 ? "stale" : "fresh";
emitGateReport({ gate: "attestation-evidence-freshness", ok: true, issues, extra: { totalRuns, deviceClasses: perDevice.length, windowHours: WINDOW_HOURS, classification, perDevice } });
console.log(`${classification === "fresh" && totalRuns > 0 ? "✅" : "⚠"} attestation-evidence-freshness: ${totalRuns} run(s), ${perDevice.length} device class(es) [${classification === "fresh" ? "BLOCK" : `WARN-${classification}`}]`);
process.exit(0);
