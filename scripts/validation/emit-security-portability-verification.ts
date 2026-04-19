#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Security & Portability Closure Verification Emitter
// Aggregates per-area status JSONs into one verification artifact
// consumed by SecurityAndPortabilityTruthPanel and the meta validator.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "generated/security-and-portability-closure";
mkdirSync(DIR, { recursive: true });

function readJson<T = unknown>(name: string): T | null {
  const p = join(DIR, name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

interface RotationStatus {
  overdue: number;
  dueSoon: number;
  fresh: number;
  noEvidence: number;
  controlPlaneBlocked: number;
}

interface AdversarialStatus {
  rls: { evidenceCount: number };
  electron: { wired: boolean; drillEvidence: number };
  debugger: { wired: boolean; drillEvidence: number };
  session: { wired: boolean; runEvidence: number };
}

const rot = readJson<RotationStatus>("secret-rotation-status.json");
const adv = readJson<AdversarialStatus>("security-adversarial-proof-status.json");
const port = readJson<{ violations: number; classified: number }>("portability-boundary-status.json");

const partnerBlocked: string[] = [];
const pendingExecution: string[] = [];

if (adv?.electron && !adv.electron.drillEvidence) partnerBlocked.push("electron-threat-detection");
if (adv?.debugger && !adv.debugger.drillEvidence) pendingExecution.push("debugger-tamper-drill");
if (adv?.rls && adv.rls.evidenceCount === 0) pendingExecution.push("rls-under-stress");
if (adv?.session && adv.session.runEvidence === 0) pendingExecution.push("session-threat-runs");

const errors: string[] = [];
if (rot && rot.overdue > 0) errors.push(`${rot.overdue} secret class(es) overdue`);
if (port && port.violations > 0) errors.push(`${port.violations} portability violation(s)`);

const status: "GREEN" | "YELLOW" | "RED" =
  errors.length > 0 ? "RED" : partnerBlocked.length + pendingExecution.length > 0 ? "YELLOW" : "GREEN";

const verification = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  status,
  rotation: rot,
  adversarial: adv,
  portability: port,
  partner_blocked: partnerBlocked,
  pending_human_execution: pendingExecution,
  errors,
};

writeFileSync(join(DIR, "security-and-portability-verification.json"), JSON.stringify(verification, null, 2));
console.log(`[emit-security-portability-verification] status=${status} errors=${errors.length}`);
