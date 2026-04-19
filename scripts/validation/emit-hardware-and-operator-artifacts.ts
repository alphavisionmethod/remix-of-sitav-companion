#!/usr/bin/env node
/* eslint-disable no-console */
// Hardware & Operator Closure — emitter
// Reads run files in generated/hardware-and-operator-closure/runs/* AND
// (when PG env present) public.hardware_certification_runs +
// public.operator_drill_executions, then regenerates the 4 canonical status
// JSON files used by the 7 hardware/operator validators.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const OUT_DIR = "generated/hardware-and-operator-closure";
mkdirSync(OUT_DIR, { recursive: true });
const RUNS_DIR = join(OUT_DIR, "runs");
mkdirSync(RUNS_DIR, { recursive: true });

interface HardwareRun {
  run_id: string;
  device_class: string;
  firmware?: string;
  secure_boot_pass: boolean;
  tpm_pass: boolean;
  dm_verity_pass: boolean;
  ab_rollback_pass: boolean;
  recovery_pass: boolean;
  attestation_quote_b64?: string;
  run_at: string;
}

interface OperatorDrill {
  drill_id: string;
  scenario: string;
  mttd_seconds: number | null;
  mttr_seconds: number | null;
  detect_pass: boolean;
  select_runbook_pass: boolean;
  kill_switch_pass: boolean;
  evidence_pass: boolean;
  rollback_pass: boolean;
  confirm_pass: boolean;
  signoff_at: string | null;
}

// --- Source 1: file-based hardware runs ---
const fileRuns: HardwareRun[] = [];
if (existsSync(RUNS_DIR)) {
  for (const f of readdirSync(RUNS_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      fileRuns.push(JSON.parse(readFileSync(join(RUNS_DIR, f), "utf-8")));
    } catch {
      /* skip malformed */
    }
  }
}

// --- Source 2: DB-based runs (best-effort) ---
let dbHardwareRuns: HardwareRun[] = [];
let dbDrills: OperatorDrill[] = [];
const havePg = !!process.env.PGHOST;
if (havePg) {
  try {
    const json = execSync(
      `psql -tA -c "SELECT json_agg(t) FROM (SELECT run_id, device_class, firmware, secure_boot_pass, tpm_pass, dm_verity_pass, ab_rollback_pass, recovery_pass, attestation_quote_b64, to_char(run_at,'YYYY-MM-DD\\"T\\"HH24:MI:SSZ') AS run_at FROM public.hardware_certification_runs ORDER BY run_at DESC LIMIT 200) t"`,
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    if (json && json !== "" && json !== "null") dbHardwareRuns = JSON.parse(json);
  } catch {
    /* DB unavailable — fall back to file evidence only */
  }
  try {
    const json = execSync(
      `psql -tA -c "SELECT json_agg(t) FROM (SELECT drill_id, scenario, mttd_seconds, mttr_seconds, detect_pass, select_runbook_pass, kill_switch_pass, evidence_pass, rollback_pass, confirm_pass, to_char(signoff_at,'YYYY-MM-DD\\"T\\"HH24:MI:SSZ') AS signoff_at FROM public.operator_drill_executions ORDER BY signoff_at DESC NULLS LAST LIMIT 200) t"`,
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    if (json && json !== "" && json !== "null") dbDrills = JSON.parse(json);
  } catch {
    /* skip */
  }
}

const allHardwareRuns: HardwareRun[] = [
  ...fileRuns,
  ...dbHardwareRuns.filter((d) => !fileRuns.some((f) => f.run_id === d.run_id)),
];

// --- Build 4 canonical status JSONs ---
const now = new Date().toISOString();
const thirtyDaysAgoMs = Date.now() - 30 * 86400_000;
const ninetyDaysAgoMs = Date.now() - 90 * 86400_000;

const freshRuns = allHardwareRuns.filter((r) => new Date(r.run_at).getTime() >= thirtyDaysAgoMs);
const deviceClasses = Array.from(new Set(allHardwareRuns.map((r) => r.device_class)));

const hardwareProofStatus = {
  generatedAt: now,
  hardware_runs_total: allHardwareRuns.length,
  fresh_runs_30d: freshRuns.length,
  device_classes_covered: deviceClasses,
  classification: allHardwareRuns.length === 0 ? "partner-blocked" : "real-evidence",
  capabilities_proven: {
    secure_boot: allHardwareRuns.some((r) => r.secure_boot_pass),
    tpm_2_0: allHardwareRuns.some((r) => r.tpm_pass),
    dm_verity: allHardwareRuns.some((r) => r.dm_verity_pass),
    ab_rollback: allHardwareRuns.some((r) => r.ab_rollback_pass),
    recovery: allHardwareRuns.some((r) => r.recovery_pass),
  },
  honest_limit:
    allHardwareRuns.length === 0
      ? "No real-device runs recorded yet. Use os/scripts/record-hardware-certification-run.sh to capture evidence."
      : null,
};
writeFileSync(join(OUT_DIR, "hardware-proof-status.json"), JSON.stringify(hardwareProofStatus, null, 2));

const certificationStatus = {
  generatedAt: now,
  matrix_rows: deviceClasses.map((dc) => {
    const runs = allHardwareRuns.filter((r) => r.device_class === dc);
    const latest = runs.sort((a, b) => new Date(b.run_at).getTime() - new Date(a.run_at).getTime())[0];
    return {
      device_class: dc,
      last_validated: latest?.run_at ?? null,
      secure_boot: latest?.secure_boot_pass ?? false,
      tpm_2_0: latest?.tpm_pass ?? false,
      dm_verity: latest?.dm_verity_pass ?? false,
      ab_rollback: latest?.ab_rollback_pass ?? false,
      recovery: latest?.recovery_pass ?? false,
      certification_status:
        latest && latest.secure_boot_pass && latest.tpm_pass && latest.dm_verity_pass && latest.ab_rollback_pass
          ? "certified"
          : "pending",
    };
  }),
  total_certified: 0,
};
certificationStatus.total_certified = certificationStatus.matrix_rows.filter((r) => r.certification_status === "certified").length;
writeFileSync(join(OUT_DIR, "hardware-certification-status.json"), JSON.stringify(certificationStatus, null, 2));

const recentDrills = dbDrills.filter(
  (d) => d.signoff_at && new Date(d.signoff_at).getTime() >= ninetyDaysAgoMs,
);
const scenariosCovered = Array.from(new Set(recentDrills.map((d) => d.scenario)));
const mttrSamples = recentDrills.filter((d) => typeof d.mttr_seconds === "number").map((d) => d.mttr_seconds!);
const operatorReadinessStatus = {
  generatedAt: now,
  drills_total: dbDrills.length,
  drills_recent_90d: recentDrills.length,
  scenarios_covered: scenariosCovered,
  scenarios_needed: 6,
  mttd_avg_seconds:
    recentDrills.length > 0
      ? Math.round(recentDrills.reduce((a, d) => a + (d.mttd_seconds ?? 0), 0) / recentDrills.length)
      : null,
  mttr_avg_seconds:
    mttrSamples.length > 0 ? Math.round(mttrSamples.reduce((a, s) => a + s, 0) / mttrSamples.length) : null,
  classification:
    recentDrills.length === 0 ? "pending-human-execution" : recentDrills.length >= 6 ? "real-execution" : "partial-execution",
  honest_limit:
    recentDrills.length === 0
      ? "No human-use drill executions recorded yet. Use the runbook-drill edge function or admin Drill Runner."
      : null,
};
writeFileSync(join(OUT_DIR, "operator-readiness-status.json"), JSON.stringify(operatorReadinessStatus, null, 2));

const verification = {
  generatedAt: now,
  closure: "hardware-and-operator",
  ok:
    hardwareProofStatus.classification === "real-evidence" &&
    certificationStatus.total_certified > 0 &&
    operatorReadinessStatus.classification === "real-execution",
  status:
    hardwareProofStatus.classification === "real-evidence" &&
    operatorReadinessStatus.classification === "real-execution"
      ? "GREEN"
      : "WARN-pending-real-evidence",
  hardware_runs: allHardwareRuns.length,
  certified_devices: certificationStatus.total_certified,
  drills_executed: dbDrills.length,
  honest_limits: [
    hardwareProofStatus.honest_limit,
    operatorReadinessStatus.honest_limit,
  ].filter(Boolean),
};
writeFileSync(join(OUT_DIR, "hardware-and-operator-verification.json"), JSON.stringify(verification, null, 2));

console.log(
  `✓ Emitted hardware-and-operator artifacts: ${allHardwareRuns.length} runs, ${dbDrills.length} drills, status=${verification.status}`,
);
