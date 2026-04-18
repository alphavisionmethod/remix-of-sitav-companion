#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Profile Composition Emitter (Part 2)
//
// Derives ALL profile-aware truth artifacts from the canonical
// registries — never authored by hand.
//
// Outputs:
//   generated/profile-composition-user.json
//   generated/profile-composition-operator.json
//   generated/profile-visibility-report.json
//   generated/user-profile-readiness-report.json
//   generated/operator-readiness-report.json
// ═══════════════════════════════════════════════════════════════
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { CANONICAL_PLANES, type CanonicalPlaneKey } from "../../../src/lib/architecture/plane-registry";
import { ROUTE_PLANE_MAP } from "../../../src/lib/architecture/route-plane-map";
import { APP_PLANE_MAP } from "../../../src/lib/architecture/app-plane-map";
import { ADMIN_WORKFLOWS } from "../../../src/lib/admin/admin-workflow-registry";

type Profile = "user" | "operator";

const REPO_ROOT = process.cwd();
const OUT_DIR = resolve(REPO_ROOT, "generated");
mkdirSync(OUT_DIR, { recursive: true });

function readProfileManifest(profile: Profile) {
  const p = resolve(REPO_ROOT, "os/profiles", `${profile}.profile.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function buildComposition(profile: Profile) {
  const manifest = readProfileManifest(profile);
  const planes = (manifest?.enabledPlanes ?? []) as CanonicalPlaneKey[];
  const routes = ROUTE_PLANE_MAP.filter(r => r.profiles.includes(profile));
  const apps = APP_PLANE_MAP.filter(a => a.profiles.includes(profile));
  const launcherApps = apps.filter(a => a.launcherVisible);
  const commandApps = apps.filter(a => a.commandVisible);
  const pinnedApps = apps.filter(a => a.defaultPinned.includes(profile));
  const adminWorkflows = profile === "operator" ? ADMIN_WORKFLOWS : [];

  return {
    generatedAt: new Date().toISOString(),
    profile,
    manifest,
    enabledPlanes: planes,
    planeDetails: planes.map(k => ({
      key: k,
      label: CANONICAL_PLANES[k]?.label ?? k,
      description: CANONICAL_PLANES[k]?.description ?? "",
    })),
    routes: {
      total: routes.length,
      byPlane: routes.reduce((acc, r) => { acc[r.plane] = (acc[r.plane] || 0) + 1; return acc; }, {} as Record<string, number>),
      entries: routes,
    },
    apps: {
      total: apps.length,
      byPlane: apps.reduce((acc, a) => { acc[a.plane] = (acc[a.plane] || 0) + 1; return acc; }, {} as Record<string, number>),
      launcherVisible: launcherApps.length,
      commandVisible: commandApps.length,
      defaultPinned: pinnedApps.map(a => a.appId),
      entries: apps,
    },
    adminWorkflows: {
      total: adminWorkflows.length,
      keys: adminWorkflows.map(w => w.key),
    },
    defaultShellHome: manifest?.defaultShellHome ?? null,
    branding: manifest?.branding ?? null,
    supportToolingLevel: manifest?.supportToolingLevel ?? null,
  };
}

const compUser = buildComposition("user");
const compOperator = buildComposition("operator");

writeFileSync(resolve(OUT_DIR, "profile-composition-user.json"),     JSON.stringify(compUser, null, 2));
writeFileSync(resolve(OUT_DIR, "profile-composition-operator.json"), JSON.stringify(compOperator, null, 2));

// ── Cross-profile visibility report ────────────────────────────
const visibility = {
  generatedAt: new Date().toISOString(),
  routes: ROUTE_PLANE_MAP.map(r => ({
    prefix: r.prefix,
    plane: r.plane,
    visibleInUser: r.profiles.includes("user"),
    visibleInOperator: r.profiles.includes("operator"),
    requiredPermission: r.requiredPermission ?? null,
  })),
  apps: APP_PLANE_MAP.map(a => ({
    appId: a.appId,
    plane: a.plane,
    visibleInUser: a.profiles.includes("user"),
    visibleInOperator: a.profiles.includes("operator"),
    roleRequired: a.roleRequired ?? null,
    riskTier: a.riskTier,
  })),
  summary: {
    routesUserOnly:     ROUTE_PLANE_MAP.filter(r =>  r.profiles.includes("user") && !r.profiles.includes("operator")).length,
    routesOperatorOnly: ROUTE_PLANE_MAP.filter(r => !r.profiles.includes("user") &&  r.profiles.includes("operator")).length,
    routesShared:       ROUTE_PLANE_MAP.filter(r =>  r.profiles.includes("user") &&  r.profiles.includes("operator")).length,
    appsUserOnly:       APP_PLANE_MAP.filter(a =>    a.profiles.includes("user") && !a.profiles.includes("operator")).length,
    appsOperatorOnly:   APP_PLANE_MAP.filter(a =>   !a.profiles.includes("user") &&  a.profiles.includes("operator")).length,
    appsShared:         APP_PLANE_MAP.filter(a =>    a.profiles.includes("user") &&  a.profiles.includes("operator")).length,
  },
};
writeFileSync(resolve(OUT_DIR, "profile-visibility-report.json"), JSON.stringify(visibility, null, 2));

// ── Per-profile readiness reports ──────────────────────────────
function readinessReport(profile: Profile, comp: ReturnType<typeof buildComposition>) {
  const manifest = comp.manifest;
  const checks: { id: string; status: "pass" | "warn" | "fail"; message: string }[] = [];

  checks.push({
    id: "manifest-present",
    status: manifest ? "pass" : "fail",
    message: manifest ? "profile manifest loaded" : `os/profiles/${profile}.profile.json missing`,
  });
  checks.push({
    id: "planes-declared",
    status: comp.enabledPlanes.length > 0 ? "pass" : "fail",
    message: `${comp.enabledPlanes.length} planes enabled`,
  });
  checks.push({
    id: "routes-mapped",
    status: comp.routes.total > 0 ? "pass" : "fail",
    message: `${comp.routes.total} routes resolve to this profile`,
  });
  checks.push({
    id: "apps-allowed",
    status: comp.apps.total > 0 ? "pass" : "fail",
    message: `${comp.apps.total} apps shippable in this profile`,
  });
  checks.push({
    id: "default-shell-home",
    status: comp.defaultShellHome ? "pass" : "fail",
    message: comp.defaultShellHome ? `shell home → ${comp.defaultShellHome}` : "no defaultShellHome",
  });

  if (profile === "operator") {
    checks.push({
      id: "operator-workflows",
      status: comp.adminWorkflows.total >= 8 ? "pass" : "warn",
      message: `${comp.adminWorkflows.total} canonical workflows wired`,
    });
    checks.push({
      id: "admin-plane-enabled",
      status: comp.enabledPlanes.includes("admin") ? "pass" : "fail",
      message: comp.enabledPlanes.includes("admin") ? "admin plane enabled" : "operator profile must enable admin plane",
    });
    checks.push({
      id: "support-tooling",
      status: comp.supportToolingLevel === "operator-full" ? "pass" : "warn",
      message: `support tooling = ${comp.supportToolingLevel}`,
    });
  } else {
    checks.push({
      id: "admin-plane-gated",
      status: !comp.enabledPlanes.includes("admin") ? "pass" : "warn",
      message: comp.enabledPlanes.includes("admin")
        ? "admin plane present in user profile (must be role-gated)"
        : "admin plane correctly excluded from user profile",
    });
    checks.push({
      id: "support-tooling",
      status: comp.supportToolingLevel === "self-service" ? "pass" : "warn",
      message: `support tooling = ${comp.supportToolingLevel}`,
    });
  }

  const fails = checks.filter(c => c.status === "fail").length;
  const warns = checks.filter(c => c.status === "warn").length;
  return {
    generatedAt: new Date().toISOString(),
    gate: profile === "user" ? "user-profile-readiness" : "operator-readiness",
    phase: "phase-12-native-deployability",
    profile,
    ok: fails === 0,
    errorCount: fails,
    warningCount: warns,
    overall: fails > 0 ? "RED" : warns > 0 ? "YELLOW" : "GREEN",
    counts: { pass: checks.length - fails - warns, warn: warns, fail: fails },
    checks,
  };
}

writeFileSync(
  resolve(OUT_DIR, "user-profile-readiness-report.json"),
  JSON.stringify(readinessReport("user", compUser), null, 2),
);
writeFileSync(
  resolve(OUT_DIR, "operator-readiness-report.json"),
  JSON.stringify(readinessReport("operator", compOperator), null, 2),
);

console.log("[emit-profile-composition] ✓ generated 5 reports");
console.log(`  user:     ${compUser.routes.total} routes · ${compUser.apps.total} apps · home ${compUser.defaultShellHome}`);
console.log(`  operator: ${compOperator.routes.total} routes · ${compOperator.apps.total} apps · home ${compOperator.defaultShellHome}`);
