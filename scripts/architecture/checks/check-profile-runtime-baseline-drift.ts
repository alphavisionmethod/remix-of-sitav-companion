#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase H — Baseline Drift Detection (block-level)
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = "generated/profile-and-runtime-hardening";
const BASELINE_PATH = join(SRC_DIR, "baseline.sealed.json");
const OUT = "generated";
mkdirSync(OUT, { recursive: true });

if (!existsSync(BASELINE_PATH)) {
  console.warn("[baseline-drift] no sealed baseline — run seal-profile-runtime-baseline.ts");
  writeFileSync(join(OUT, "profile-runtime-baseline-drift.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    gate: "profile-runtime-baseline-drift",
    level: "block",
    ok: false,
    reason: "no baseline sealed",
  }, null, 2));
  process.exit(1);
}

interface BaselineSurface {
  appIds: string[];
  routePaths: string[];
  adminRoutes: string[];
  guardedAdmin: string[];
  appProfilesMatrix: Record<string, string[]>;
  mobileFeaturesByClass: Record<string, string[]>;
}
interface Baseline { fingerprint: string; sealedAt: string; surface: BaselineSurface; counts: Record<string, number> }

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf-8")) as Baseline;

interface AppEntry { appId: string; profiles?: string[] }
interface RouteEntry { path: string; plane?: string | null; guard?: string | null }
interface FeatureEntry { id?: string; file?: string; classification?: string }

const apps = (JSON.parse(readFileSync(join(SRC_DIR, "app-registry-map.json"), "utf-8")).apps ?? []) as AppEntry[];
const routes = (JSON.parse(readFileSync(join(SRC_DIR, "app-route-profile-map.json"), "utf-8")).routes ?? []) as RouteEntry[];
const mobile = (JSON.parse(readFileSync(join(SRC_DIR, "mobile-capability-map.json"), "utf-8")).features ?? []) as FeatureEntry[];

const cur = {
  appIds: [...apps.map(a => a.appId)].sort(),
  routePaths: [...routes.map(r => r.path)].sort(),
  adminRoutes: [...routes.filter(r => r.plane === "admin").map(r => r.path)].sort(),
  guardedAdmin: [...routes.filter(r => r.plane === "admin" && r.guard).map(r => r.path)].sort(),
  appProfilesMatrix: Object.fromEntries(apps.map(a => [a.appId, [...(a.profiles ?? [])].sort()])),
  mobileFeaturesByClass: (() => {
    const m: Record<string, string[]> = {};
    for (const f of mobile) (m[f.classification ?? "unknown"] ??= []).push(f.id ?? f.file ?? "anonymous");
    for (const k of Object.keys(m)) m[k].sort();
    return m;
  })(),
};

function diff(base: string[], current: string[]) {
  const baseSet = new Set(base); const curSet = new Set(current);
  return { added: current.filter(x => !baseSet.has(x)), removed: base.filter(x => !curSet.has(x)) };
}

const drift = {
  apps: diff(baseline.surface.appIds, cur.appIds),
  routes: diff(baseline.surface.routePaths, cur.routePaths),
  adminRoutes: diff(baseline.surface.adminRoutes, cur.adminRoutes),
  guardedAdmin: diff(baseline.surface.guardedAdmin, cur.guardedAdmin),
};

const profileMutations: Array<{ appId: string; was: string[]; now: string[] }> = [];
const allAppIds = new Set([...Object.keys(baseline.surface.appProfilesMatrix), ...Object.keys(cur.appProfilesMatrix)]);
for (const id of allAppIds) {
  const was = baseline.surface.appProfilesMatrix[id] ?? [];
  const now = cur.appProfilesMatrix[id] ?? [];
  if (JSON.stringify(was) !== JSON.stringify(now)) profileMutations.push({ appId: id, was, now });
}

const STRENGTH: Record<string, number> = { live: 4, partial: 3, "responsive-only": 2, deferred: 1, planned: 1, mock: 0, unknown: 0 };
const flatBase = new Map<string, string>();
for (const [cls, ids] of Object.entries(baseline.surface.mobileFeaturesByClass)) for (const id of ids) flatBase.set(id, cls);
const flatCur = new Map<string, string>();
for (const [cls, ids] of Object.entries(cur.mobileFeaturesByClass)) for (const id of ids) flatCur.set(id, cls);
const mobileRegressions: Array<{ id: string; was: string; now: string }> = [];
for (const [id, wasCls] of flatBase) {
  const nowCls = flatCur.get(id);
  if (nowCls && (STRENGTH[nowCls] ?? 0) < (STRENGTH[wasCls] ?? 0)) mobileRegressions.push({ id, was: wasCls, now: nowCls });
}

const baseGuarded = new Set(baseline.surface.guardedAdmin);
const newUnguardedAdmin = drift.adminRoutes.added.filter(p => !cur.guardedAdmin.includes(p) && !baseGuarded.has(p));

const ALLOW_ADD = process.env.ALLOW_BASELINE_DRIFT === "1";
const hardFailures: string[] = [];
if (newUnguardedAdmin.length) hardFailures.push(`${newUnguardedAdmin.length} new admin route(s) without guard`);
if (mobileRegressions.length) hardFailures.push(`${mobileRegressions.length} mobile feature(s) classification regressed`);
if (drift.guardedAdmin.removed.length) hardFailures.push(`${drift.guardedAdmin.removed.length} previously-guarded admin route(s) lost their guard`);

const totalSoftDrift =
  drift.apps.added.length + drift.apps.removed.length +
  drift.routes.added.length + drift.routes.removed.length +
  drift.adminRoutes.added.length + drift.adminRoutes.removed.length +
  profileMutations.length;

const ok = hardFailures.length === 0 && (totalSoftDrift === 0 || ALLOW_ADD);

const report = {
  generatedAt: new Date().toISOString(),
  gate: "profile-runtime-baseline-drift",
  level: "block",
  baselineSealedAt: baseline.sealedAt,
  baselineFingerprint: baseline.fingerprint,
  ok,
  hardFailures,
  totalSoftDrift,
  drift: {
    apps: drift.apps,
    routes: { addedCount: drift.routes.added.length, removedCount: drift.routes.removed.length, sampleAdded: drift.routes.added.slice(0, 10), sampleRemoved: drift.routes.removed.slice(0, 10) },
    adminRoutes: drift.adminRoutes,
    guardedAdmin: drift.guardedAdmin,
    profileMutations,
    mobileRegressions,
    newUnguardedAdmin,
  },
  guidance: ok ? "no drift detected" : "re-seal baseline only on intentional approved change",
};

writeFileSync(join(OUT, "profile-runtime-baseline-drift.json"), JSON.stringify(report, null, 2));
writeFileSync(join(OUT, "profile-runtime-baseline-drift-report.json"), JSON.stringify({
  generatedAt: report.generatedAt, gate: report.gate, level: report.level, ok: report.ok,
  errorCount: hardFailures.length + (ok ? 0 : (ALLOW_ADD ? 0 : totalSoftDrift)),
  warningCount: 0,
  issues: ok ? [] : hardFailures.map(m => ({ severity: "error", area: "baseline-drift", message: m })),
}, null, 2));

console.log(`baseline-drift: ${ok ? "OK" : "FAIL"} — hardFailures=${hardFailures.length} softDrift=${totalSoftDrift}`);
if (hardFailures.length) for (const f of hardFailures) console.log(`  ✗ ${f}`);
process.exit(ok ? 0 : 1);
