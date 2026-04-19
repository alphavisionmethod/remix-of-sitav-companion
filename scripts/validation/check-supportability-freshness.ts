#!/usr/bin/env node
/* eslint-disable no-console */
// Real validator: parses DRILL_CADENCE_AND_FRESHNESS_POLICY.md for cadence windows,
// reads drill-cadence-status.json for last-execution timestamps, and computes freshness.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

interface CadenceCategory { category: string; windowDays: number }

const POLICY = "generated/hardware-and-operator-closure/DRILL_CADENCE_AND_FRESHNESS_POLICY.md";
const CADENCE_STATUS = "generated/final-hardening/drill-cadence-status.json";

// Default cadence windows (in days) — matched against policy markdown if present
const DEFAULT_CADENCE: CadenceCategory[] = [
  { category: "hardware", windowDays: 30 },
  { category: "restore", windowDays: 7 },
  { category: "runbook", windowDays: 90 },
  { category: "kill-switch", windowDays: 30 },
  { category: "operator-readiness", windowDays: 30 },
  { category: "connector-refresh", windowDays: 7 },
  { category: "release", windowDays: 30 },
  { category: "baseline-seal", windowDays: 30 },
  { category: "notification-calmness", windowDays: 30 },
  { category: "admin-golden-path", windowDays: 30 },
];

function parsePolicyWindows(): CadenceCategory[] {
  if (!existsSync(POLICY)) return DEFAULT_CADENCE;
  const md = readFileSync(POLICY, "utf-8");
  const overrides: CadenceCategory[] = [];
  // Match lines like "- hardware: monthly" or "- restore: weekly (7d)"
  for (const line of md.split("\n")) {
    const m = line.match(/[-*]\s+([a-z][a-z0-9-]+)\s*:\s*(weekly|monthly|quarterly|daily|(\d+)\s*d)/i);
    if (!m) continue;
    const cat = m[1].toLowerCase();
    const spec = m[2].toLowerCase();
    const days = spec === "daily" ? 1 : spec === "weekly" ? 7 : spec === "monthly" ? 30 : spec === "quarterly" ? 90 : Number(m[3]);
    if (Number.isFinite(days)) overrides.push({ category: cat, windowDays: days });
  }
  // Merge overrides over defaults
  const map = new Map(DEFAULT_CADENCE.map((d) => [d.category, d.windowDays]));
  for (const o of overrides) map.set(o.category, o.windowDays);
  return Array.from(map.entries()).map(([category, windowDays]) => ({ category, windowDays }));
}

const cadence = parsePolicyWindows();
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

let drillStatus: { registeredDrills?: string[]; categoriesCovered?: string[]; lastExecutions?: Record<string, string> } = {};
if (existsSync(CADENCE_STATUS)) drillStatus = JSON.parse(readFileSync(CADENCE_STATUS, "utf-8"));

const lastExec = drillStatus.lastExecutions ?? {};
const now = Date.now();
const perCategory = cadence.map((c) => {
  const ts = lastExec[c.category];
  const ageDays = ts ? Math.floor((now - new Date(ts).getTime()) / 86_400_000) : null;
  let status: "fresh" | "stale" | "expired" | "no-data";
  if (ageDays === null) status = "no-data";
  else if (ageDays <= c.windowDays) status = "fresh";
  else if (ageDays <= c.windowDays * 2) status = "stale";
  else status = "expired";
  return { category: c.category, windowDays: c.windowDays, ageDays, lastExecutionAt: ts ?? null, status };
});

const expired = perCategory.filter((p) => p.status === "expired");
const stale = perCategory.filter((p) => p.status === "stale");
const noData = perCategory.filter((p) => p.status === "no-data");

if (expired.length > 0) {
  issues.push({ severity: "warning", area: "expired", message: `${expired.length} categor${expired.length === 1 ? "y" : "ies"} expired (>2× window): ${expired.map((e) => e.category).join(", ")}` });
}
if (stale.length > 0) {
  issues.push({ severity: "warning", area: "stale", message: `${stale.length} categor${stale.length === 1 ? "y" : "ies"} stale (>1× window): ${stale.map((e) => e.category).join(", ")}` });
}
if (noData.length > 0) {
  issues.push({ severity: "warning", area: "no-data", message: `${noData.length} categor${noData.length === 1 ? "y" : "ies"} have no execution data: ${noData.map((e) => e.category).join(", ")}` });
}

const fresh = perCategory.filter((p) => p.status === "fresh").length;
const classification = expired.length > 0 ? "expired-cadence" : stale.length > 0 ? "stale-cadence" : noData.length === perCategory.length ? "no-data" : noData.length > 0 ? "partial-data" : "block-eligible";
emitGateReport({ gate: "supportability-freshness", ok: true, issues, extra: { cadenceCategories: perCategory.length, fresh, stale: stale.length, expired: expired.length, noData: noData.length, classification, perCategory } });
console.log(`${classification === "block-eligible" ? "✅" : "⚠"} supportability-freshness: ${fresh}/${perCategory.length} fresh [${classification === "block-eligible" ? "BLOCK" : `WARN-${classification}`}]`);
process.exit(0);
