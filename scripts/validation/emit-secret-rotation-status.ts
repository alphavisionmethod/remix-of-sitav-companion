#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Secret Rotation Status Emitter
// Reads secret_rotation_log via psql (when PGHOST is set) and emits
// generated/security-and-portability-closure/secret-rotation-status.json
// keyed by canonical class from src/lib/security/secret-rotation-cadence.ts.
// Falls back to "no-evidence" classification when DB is unreachable.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  SECRET_ROTATION_CADENCE,
  SECRET_CLASSES,
  type SecretClass,
} from "../../src/lib/security/secret-rotation-cadence";

const OUT_DIR = "generated/security-and-portability-closure";
mkdirSync(OUT_DIR, { recursive: true });

interface ClassFreshness {
  class: SecretClass;
  intervalDays: number;
  staleThresholdDays: number;
  controlPlaneBlocked: boolean;
  ownerRole: string;
  lastRotatedAt: string | null;
  cadenceDueAt: string | null;
  daysSinceLast: number | null;
  daysUntilDue: number | null;
  status: "fresh" | "due-soon" | "overdue" | "no-evidence" | "control-plane-blocked";
  rowCount: number;
}

function queryDb(): Map<SecretClass, { lastRotated: Date; due: Date | null; count: number }> {
  const map = new Map<SecretClass, { lastRotated: Date; due: Date | null; count: number }>();
  if (!process.env.PGHOST) return map;
  try {
    const sql =
      "SELECT secret_class, MAX(rotated_at)::text, MAX(cadence_due_at)::text, COUNT(*)::text " +
      "FROM secret_rotation_log GROUP BY secret_class;";
    const out = execSync(`psql -t -A -F '|' -c "${sql.replace(/"/g, '\\"')}"`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    for (const line of out.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const [cls, last, due, cnt] = line.split("|");
      if (!cls || !last) continue;
      map.set(cls as SecretClass, {
        lastRotated: new Date(last),
        due: due ? new Date(due) : null,
        count: parseInt(cnt ?? "0", 10),
      });
    }
  } catch (e) {
    console.warn(`[emit-secret-rotation-status] DB query failed: ${(e as Error).message}`);
  }
  return map;
}

const dbState = queryDb();
const now = new Date();
const perClass: ClassFreshness[] = [];

for (const cls of SECRET_CLASSES) {
  const policy = SECRET_ROTATION_CADENCE[cls];
  const row = dbState.get(cls);
  if (policy.controlPlaneBlocked) {
    perClass.push({
      class: cls,
      intervalDays: policy.intervalDays,
      staleThresholdDays: policy.staleThresholdDays,
      controlPlaneBlocked: true,
      ownerRole: policy.ownerRole,
      lastRotatedAt: row?.lastRotated.toISOString() ?? null,
      cadenceDueAt: row?.due?.toISOString() ?? null,
      daysSinceLast: row ? Math.floor((now.getTime() - row.lastRotated.getTime()) / 86_400_000) : null,
      daysUntilDue: row?.due ? Math.floor((row.due.getTime() - now.getTime()) / 86_400_000) : null,
      status: "control-plane-blocked",
      rowCount: row?.count ?? 0,
    });
    continue;
  }
  if (!row) {
    perClass.push({
      class: cls,
      intervalDays: policy.intervalDays,
      staleThresholdDays: policy.staleThresholdDays,
      controlPlaneBlocked: false,
      ownerRole: policy.ownerRole,
      lastRotatedAt: null,
      cadenceDueAt: null,
      daysSinceLast: null,
      daysUntilDue: null,
      status: "no-evidence",
      rowCount: 0,
    });
    continue;
  }
  const daysSince = Math.floor((now.getTime() - row.lastRotated.getTime()) / 86_400_000);
  const daysUntilDueVal = row.due
    ? Math.floor((row.due.getTime() - now.getTime()) / 86_400_000)
    : policy.intervalDays - daysSince;
  let status: ClassFreshness["status"] = "fresh";
  if (daysSince > policy.intervalDays + policy.staleThresholdDays) status = "overdue";
  else if (daysSince > policy.intervalDays) status = "due-soon";
  perClass.push({
    class: cls,
    intervalDays: policy.intervalDays,
    staleThresholdDays: policy.staleThresholdDays,
    controlPlaneBlocked: false,
    ownerRole: policy.ownerRole,
    lastRotatedAt: row.lastRotated.toISOString(),
    cadenceDueAt: row.due?.toISOString() ?? null,
    daysSinceLast: daysSince,
    daysUntilDue: daysUntilDueVal,
    status,
    rowCount: row.count,
  });
}

const summary = {
  generatedAt: now.toISOString(),
  source: dbState.size > 0 ? "db" : "no-db-access",
  totalClasses: SECRET_CLASSES.length,
  overdue: perClass.filter((c) => c.status === "overdue").length,
  dueSoon: perClass.filter((c) => c.status === "due-soon").length,
  fresh: perClass.filter((c) => c.status === "fresh").length,
  noEvidence: perClass.filter((c) => c.status === "no-evidence").length,
  controlPlaneBlocked: perClass.filter((c) => c.status === "control-plane-blocked").length,
  perClass,
};

writeFileSync(join(OUT_DIR, "secret-rotation-status.json"), JSON.stringify(summary, null, 2));
console.log(
  `[emit-secret-rotation-status] ${summary.overdue} overdue, ${summary.dueSoon} due-soon, ` +
    `${summary.fresh} fresh, ${summary.noEvidence} no-evidence, ${summary.controlPlaneBlocked} control-plane-blocked`,
);
