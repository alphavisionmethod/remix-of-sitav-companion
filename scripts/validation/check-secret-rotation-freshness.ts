#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Secret Rotation Freshness
// Reads generated/security-and-portability-closure/secret-rotation-status.json
// (DB-derived). BLOCK on overdue non-control-plane classes; honest
// WARN-tier on control-plane-blocked and no-evidence classes.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS_FILE = "generated/security-and-portability-closure/secret-rotation-status.json";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

interface ClassFreshness {
  class: string;
  controlPlaneBlocked: boolean;
  status: "fresh" | "due-soon" | "overdue" | "no-evidence" | "control-plane-blocked";
  daysSinceLast: number | null;
  rowCount: number;
}

if (!existsSync(STATUS_FILE)) {
  issues.push({
    severity: "warning",
    area: "emitter",
    message: "secret-rotation-status.json missing — run `npm run closure:security-portability:emit`",
  });
} else {
  try {
    const raw = JSON.parse(readFileSync(STATUS_FILE, "utf8"));
    const perClass: ClassFreshness[] = raw.perClass ?? [];
    for (const c of perClass) {
      switch (c.status) {
        case "overdue":
          issues.push({
            severity: "error",
            area: c.class,
            message: `Overdue: ${c.daysSinceLast}d since last rotation (control-plane=${c.controlPlaneBlocked})`,
          });
          break;
        case "due-soon":
          issues.push({
            severity: "warning",
            area: c.class,
            message: `Due soon: ${c.daysSinceLast}d since last rotation`,
          });
          break;
        case "no-evidence":
          issues.push({
            severity: "warning",
            area: c.class,
            message: "no-evidence — no rotation log rows yet (pending-execution)",
          });
          break;
        case "control-plane-blocked":
          issues.push({
            severity: "warning",
            area: c.class,
            message: "control-plane-blocked — managed by Lovable Cloud (honest WARN-tier)",
          });
          break;
        case "fresh":
        default:
          break;
      }
    }
  } catch (e) {
    issues.push({ severity: "error", area: "parse", message: `Could not parse status: ${(e as Error).message}` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "secret-rotation-freshness", ok, issues });
console.log(`[secret-rotation-freshness] ${ok ? "PASS" : "FAIL"} (${issues.length} issues)`);
process.exit(ok ? 0 : 1);
