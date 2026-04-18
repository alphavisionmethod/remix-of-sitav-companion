#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// CI: every app in APP_PLANE_MAP must declare plane + ≥1 profile.
// Emits generated/app-plane-map.json for downstream tooling.
// ═══════════════════════════════════════════════════════════════
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { APP_PLANE_MAP } from "../../../src/lib/architecture/app-plane-map";
import { CANONICAL_PLANES } from "../../../src/lib/architecture/plane-registry";

interface Issue { appId: string; severity: "error" | "warn"; message: string; }
const issues: Issue[] = [];

const seen = new Set<string>();
for (const app of APP_PLANE_MAP) {
  if (seen.has(app.appId)) {
    issues.push({ appId: app.appId, severity: "error", message: "duplicate appId" });
  }
  seen.add(app.appId);

  if (!CANONICAL_PLANES[app.plane]) {
    issues.push({ appId: app.appId, severity: "error", message: `unknown plane '${app.plane}'` });
  }
  if (!app.profiles || app.profiles.length === 0) {
    issues.push({ appId: app.appId, severity: "error", message: "must declare ≥1 profile" });
  }
  if (app.plane === "admin" && !app.profiles.includes("operator")) {
    issues.push({ appId: app.appId, severity: "error", message: "admin app must include operator profile" });
  }
  if (app.plane === "admin" && !app.roleRequired) {
    issues.push({ appId: app.appId, severity: "warn", message: "admin app should declare roleRequired" });
  }
  if ((app.riskTier === "R4" || app.riskTier === "R5") && !app.roleRequired) {
    issues.push({ appId: app.appId, severity: "error", message: `R4+ app requires roleRequired` });
  }
}

const errors = issues.filter(i => i.severity === "error");
const warns = issues.filter(i => i.severity === "warn");

const outDir = resolve(process.cwd(), "generated");
mkdirSync(outDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  totalApps: APP_PLANE_MAP.length,
  byPlane: APP_PLANE_MAP.reduce((acc, a) => { acc[a.plane] = (acc[a.plane] || 0) + 1; return acc; }, {} as Record<string, number>),
  byProfile: {
    user:     APP_PLANE_MAP.filter(a => a.profiles.includes("user")).length,
    operator: APP_PLANE_MAP.filter(a => a.profiles.includes("operator")).length,
  },
  errors: errors.length,
  warnings: warns.length,
  issues,
  apps: APP_PLANE_MAP,
};
writeFileSync(resolve(outDir, "app-plane-map.json"), JSON.stringify(report, null, 2));

console.log(`[check-app-plane-coverage] ${APP_PLANE_MAP.length} apps · ${errors.length} errors · ${warns.length} warnings`);
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e.appId}: ${e.message}`);
  process.exit(1);
}
console.log("[check-app-plane-coverage] ✓ ok");
