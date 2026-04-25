#!/usr/bin/env tsx
/**
 * Wave D §D.1 — Profile Route Visibility Map Generator
 *
 * Pure projection of `generated/profile-and-runtime-hardening/app-route-profile-map.json`
 * into the canonical foundation-tier location `generated/manifests/profile-route-visibility-map.json`.
 *
 * Schema:
 *   {
 *     generatedAt, schemaVersion, sourceManifest,
 *     totalRoutes, operatorOnlyCount, userAllowedCount, bothCount, unscopedCount,
 *     entries: [{ path, plane, profiles[], operatorOnly, sourceOwner, routeAdapter,
 *                 requiredPermission, guards[], validationStatus }]
 *   }
 *
 * Owner: Architecture Governance · Constitution Rule 45 (Wave D §D.1)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "generated", "profile-and-runtime-hardening", "app-route-profile-map.json");
const OUT = join(ROOT, "generated", "manifests", "profile-route-visibility-map.json");

type SourceRoute = {
  path: string;
  file?: string;
  guards?: string[];
  plane?: string | null;
  profiles?: string[];
  requiredPermission?: string | null;
  appBacked?: boolean;
  drift?: unknown[];
};
type Source = { routes: SourceRoute[]; totalRoutes?: number };

if (!existsSync(SOURCE)) {
  console.error(`❌ Source manifest missing: ${SOURCE}`);
  console.error("   Run the profile-and-runtime hardening pass first.");
  process.exit(1);
}

const src = JSON.parse(readFileSync(SOURCE, "utf8")) as Source;
const routes = src.routes ?? [];

const entries = routes.map((r) => {
  const profiles = r.profiles ?? [];
  const operatorOnly = profiles.length === 1 && profiles[0] === "operator";
  const guards = r.guards ?? [];
  const hasAdminGuard = guards.some((g) => /AdminRoute|PermissionGated|RequirePermission|RequireRole/i.test(g));

  let validationStatus: "ok" | "leak-risk" | "missing-profile" = "ok";
  if (!profiles.length) validationStatus = "missing-profile";
  else if (operatorOnly && !hasAdminGuard && r.plane !== "admin") validationStatus = "leak-risk";

  return {
    path: r.path,
    plane: r.plane ?? null,
    profiles,
    operatorOnly,
    sourceOwner: r.file ?? null,
    routeAdapter: r.file ?? null,
    requiredPermission: r.requiredPermission ?? null,
    guards,
    validationStatus,
  };
});

const operatorOnlyCount = entries.filter((e) => e.operatorOnly).length;
const userAllowedCount = entries.filter((e) => e.profiles.includes("user")).length;
const bothCount = entries.filter((e) => e.profiles.includes("user") && e.profiles.includes("operator")).length;
const unscopedCount = entries.filter((e) => !e.profiles.length).length;

const out = {
  generatedAt: new Date().toISOString(),
  schemaVersion: 1,
  rule: "Constitution Rule 45 (Wave D §D.1 — Profile Visibility Law)",
  sourceManifest: "generated/profile-and-runtime-hardening/app-route-profile-map.json",
  totalRoutes: entries.length,
  operatorOnlyCount,
  userAllowedCount,
  bothCount,
  unscopedCount,
  entries,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(
  `✅ profile-route-visibility-map.json — total=${entries.length} operator-only=${operatorOnlyCount} user=${userAllowedCount} both=${bothCount} unscoped=${unscopedCount}`,
);