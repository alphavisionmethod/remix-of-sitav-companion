#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase H — Baseline Sealing
// Captures the current GREEN state of the profile-and-runtime
// hardening surface as an immutable baseline. Drift detection
// (check-profile-runtime-baseline-drift.ts) compares future runs
// against this baseline.
//
// Re-run only when intentional surface expansion is approved.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SRC_DIR = "generated/profile-and-runtime-hardening";
const BASELINE_PATH = join(SRC_DIR, "baseline.sealed.json");

interface AppEntry { appId: string; route?: string | null; profiles?: string[]; roleRequired?: string | null }
interface RouteEntry { path: string; plane?: string | null; profiles?: string[]; guard?: string | null }
interface FeatureEntry { id?: string; file?: string; classification?: string }
interface AppRegistry { apps?: AppEntry[] }
interface RouteRegistry { routes?: RouteEntry[] }
interface MobileRegistry { features?: FeatureEntry[] }
interface ProfileSep { sharedComponentLeakage?: unknown[]; manifestMismatches?: unknown[]; summary?: Record<string, number> }

function load<T>(rel: string): T {
  const p = join(SRC_DIR, rel);
  if (!existsSync(p)) throw new Error(`evidence missing: ${p} — run generate-runtime-evidence-maps first`);
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

const apps = load<AppRegistry>("app-registry-map.json").apps ?? [];
const routes = load<RouteRegistry>("app-route-profile-map.json").routes ?? [];
const mobile = load<MobileRegistry>("mobile-capability-map.json").features ?? [];
const sep = load<ProfileSep>("profile-separation-map.json");

// Stable, sorted projections (drift-resistant to ordering).
const appIds = [...apps.map(a => a.appId)].sort();
const routePaths = [...routes.map(r => r.path)].sort();
const adminRoutes = [...routes.filter(r => r.plane === "admin").map(r => r.path)].sort();
const guardedAdmin = [...routes.filter(r => r.plane === "admin" && r.guard).map(r => r.path)].sort();
const mobileFeaturesByClass: Record<string, string[]> = {};
for (const f of mobile) {
  const c = f.classification ?? "unknown";
  (mobileFeaturesByClass[c] ??= []).push(f.id ?? f.file ?? "anonymous");
}
for (const k of Object.keys(mobileFeaturesByClass)) mobileFeaturesByClass[k].sort();

const appProfilesMatrix: Record<string, string[]> = {};
for (const a of apps) appProfilesMatrix[a.appId] = [...(a.profiles ?? [])].sort();

const baseline = {
  schemaVersion: 1,
  sealedAt: new Date().toISOString(),
  sealedBy: process.env.USER ?? "ci",
  notes: "Phase H baseline — represents GREEN state after Phases A–G. Re-seal only on intentional, approved surface change.",
  counts: {
    apps: appIds.length,
    routes: routePaths.length,
    adminRoutes: adminRoutes.length,
    guardedAdminRoutes: guardedAdmin.length,
    mobileFeatures: mobile.length,
    sharedLayerLeakage: (sep.sharedComponentLeakage ?? []).length,
    manifestMismatches: (sep.manifestMismatches ?? []).length,
  },
  surface: {
    appIds,
    routePaths,
    adminRoutes,
    guardedAdmin,
    appProfilesMatrix,
    mobileFeaturesByClass,
  },
};

const canonical = JSON.stringify(baseline, Object.keys(baseline).sort(), 2);
const fingerprint = createHash("sha256").update(canonical).digest("hex");
const sealed = { ...baseline, fingerprint };

mkdirSync(SRC_DIR, { recursive: true });
writeFileSync(BASELINE_PATH, JSON.stringify(sealed, null, 2));
console.log(`baseline sealed → ${BASELINE_PATH}`);
console.log(`fingerprint: ${fingerprint}`);
console.log(`apps=${baseline.counts.apps} routes=${baseline.counts.routes} adminRoutes=${baseline.counts.adminRoutes} mobile=${baseline.counts.mobileFeatures}`);
