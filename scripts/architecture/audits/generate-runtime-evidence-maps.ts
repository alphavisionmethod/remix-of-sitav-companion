#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Evidence Maps generator (Phase A, read-only)
//
// Emits 4 JSON evidence files into
// generated/profile-and-runtime-hardening/:
//   - app-registry-map.json
//   - app-route-profile-map.json
//   - mobile-capability-map.json
//   - profile-separation-map.json
//
// Read-only: no source files are modified.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const OUT_DIR = "generated/profile-and-runtime-hardening";
mkdirSync(OUT_DIR, { recursive: true });

// ───────────────────── helpers ─────────────────────
function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    let s; try { s = statSync(f); } catch { continue; }
    if (s.isDirectory()) {
      if (e === "node_modules" || e === ".git" || e === "dist") continue;
      walk(f, acc);
    } else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(e))) {
      acc.push(f);
    }
  }
  return acc;
}

function safeRead(f: string): string {
  try { return readFileSync(f, "utf-8"); } catch { return ""; }
}

function safeJson<T>(f: string, fallback: T): T {
  try { return JSON.parse(readFileSync(f, "utf-8")) as T; } catch { return fallback; }
}

// ───────────────────── load profile manifests ─────────────────────
interface ProfileManifest {
  profile: string;
  allowedApps: string[];
  enabledPlanes: string[];
  defaultShellHome: string;
}

const userProfile = safeJson<ProfileManifest>("os/profiles/user.profile.json", {
  profile: "user", allowedApps: [], enabledPlanes: [], defaultShellHome: "/",
});
const operatorProfile = safeJson<ProfileManifest>("os/profiles/operator.profile.json", {
  profile: "operator", allowedApps: [], enabledPlanes: [], defaultShellHome: "/",
});

// ───────────────────── parse app-plane-map.ts ─────────────────────
interface AppPlaneEntry {
  appId: string;
  displayName: string;
  plane: string;
  profiles: string[];
  roleRequired?: string;
  launcherVisible: boolean;
  commandVisible: boolean;
  defaultPinned: string[];
  riskTier: string;
  description: string;
}

function parseAppPlaneMap(): AppPlaneEntry[] {
  const src = safeRead("src/platform/architecture/app-plane-map.ts");
  if (!src) return [];
  const out: AppPlaneEntry[] = [];
  // Match each `{ appId: "...", ... },` block heuristically.
  const blockRe = /\{\s*appId:\s*"([^"]+)"[^}]*?\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(src))) {
    const block = m[0];
    const get = (k: string): string | undefined => {
      const r = new RegExp(`${k}:\\s*"([^"]+)"`).exec(block);
      return r?.[1];
    };
    const getBool = (k: string): boolean => {
      const r = new RegExp(`${k}:\\s*(true|false)`).exec(block);
      return r?.[1] === "true";
    };
    const getArr = (k: string): string[] => {
      const r = new RegExp(`${k}:\\s*\\[([^\\]]*)\\]`).exec(block);
      if (!r) return [];
      return [...r[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    };
    out.push({
      appId: m[1],
      displayName: get("displayName") ?? m[1],
      plane: get("plane") ?? "unknown",
      profiles: getArr("profiles"),
      roleRequired: get("roleRequired"),
      launcherVisible: getBool("launcherVisible"),
      commandVisible: getBool("commandVisible"),
      defaultPinned: getArr("defaultPinned"),
      riskTier: get("riskTier") ?? "R0",
      description: get("description") ?? "",
    });
  }
  return out;
}

const appPlaneMap = parseAppPlaneMap();

// ───────────────────── parse route-plane-map.ts ─────────────────────
interface RoutePlaneEntry {
  prefix: string;
  plane: string;
  profiles: string[];
  requiredPermission?: string;
  description: string;
}

function parseRoutePlaneMap(): RoutePlaneEntry[] {
  const src = safeRead("src/platform/architecture/route-plane-map.ts");
  if (!src) return [];
  const out: RoutePlaneEntry[] = [];
  const blockRe = /\{\s*prefix:\s*"([^"]+)"[^}]*?\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(src))) {
    const block = m[0];
    const get = (k: string): string | undefined => {
      const r = new RegExp(`${k}:\\s*"([^"]+)"`).exec(block);
      return r?.[1];
    };
    const getArr = (k: string): string[] => {
      const r = new RegExp(`${k}:\\s*\\[([^\\]]*)\\]`).exec(block);
      if (!r) return [];
      return [...r[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    };
    out.push({
      prefix: m[1],
      plane: get("plane") ?? "unknown",
      profiles: getArr("profiles"),
      requiredPermission: get("requiredPermission"),
      description: get("description") ?? "",
    });
  }
  return out;
}

const routePlaneMap = parseRoutePlaneMap();

// ───────────────────── extract route declarations ─────────────────────
interface RouteDecl {
  path: string;
  file: string;
  guards: string[];
}

function extractRoutes(): RouteDecl[] {
  const out: RouteDecl[] = [];
  const routeFiles = walk("src/routes").concat(["src/App.tsx"]);
  for (const f of routeFiles) {
    if (!existsSync(f)) continue;
    const c = safeRead(f);
    // Match <Route path="..." or path={"..."}
    const re = /<Route\s+[^>]*?path\s*=\s*\{?["'`]([^"'`]+)["'`]\}?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(c))) {
      const path = m[1];
      // Look at surrounding 600 chars for guard wrappers / helpers
      const start = Math.max(0, m.index - 600);
      const end = Math.min(c.length, m.index + 600);
      const ctx = c.slice(start, end);
      const guards: string[] = [];
      if (/AdminRoute/.test(ctx)) guards.push("AdminRoute");
      if (/PermissionGatedRoute/.test(ctx)) guards.push("PermissionGatedRoute");
      if (/ProtectedRoute/.test(ctx)) guards.push("ProtectedRoute");
      // Local helpers used in route files
      if (/\bgated\s*\(/.test(ctx)) guards.push("gated()");
      if (/\brequirePermission\s*\(/.test(ctx)) guards.push("requirePermission()");
      out.push({ path, file: relative(".", f), guards });
    }
  }
  return out;
}

const routeDecls = extractRoutes();

// ───────────────────── App Registry Map ─────────────────────
interface AppRegistryRow extends AppPlaneEntry {
  routeMatches: string[];
  inUserManifest: boolean;
  inOperatorManifest: boolean;
  drift: string[];
}

function appExpectedRoute(appId: string): string {
  const map: Record<string, string> = {
    "business-os": "/business",
    "money-os": "/money",
    "concierge": "/concierge",
    "boardroom": "/boardroom",
    "workspace": "/workspace",
    "app-store": "/apps",
    "files": "/files",
    "desktop": "/desktop",
    "settings": "/settings",
    "notifications": "/notifications",
    "search": "/search",
    "observability": "/admin/system",
    "release-center": "/admin/releases",
    "verification-center": "/admin/verification",
    "kill-switch-center": "/admin/security",
    "support-diagnostics": "/admin/support",
    "ai-governance": "/admin/ai-governance",
    "platform-control": "/admin/system",
    "user-org-intervention": "/admin/users",
    "incident-triage": "/admin/incidents",
  };
  return map[appId] ?? `/${appId}`;
}

const appRegistryRows: AppRegistryRow[] = appPlaneMap.map((app) => {
  const expected = appExpectedRoute(app.appId);
  const routeMatches = routeDecls
    .filter((r) => r.path === expected || r.path.startsWith(expected + "/") || r.path === expected.replace(/^\//, ""))
    .map((r) => r.path);
  const inUser = userProfile.allowedApps.includes(app.appId);
  const inOp = operatorProfile.allowedApps.includes(app.appId);
  const drift: string[] = [];
  if (routeMatches.length === 0) drift.push("missing-route");
  if (app.profiles.includes("user") && !inUser) drift.push("user-manifest-missing");
  if (app.profiles.includes("operator") && !inOp) drift.push("operator-manifest-missing");
  if (!app.profiles.includes("user") && inUser) drift.push("user-manifest-orphan");
  if (!app.profiles.includes("operator") && inOp) drift.push("operator-manifest-orphan");
  if (app.plane === "admin" && !app.roleRequired) drift.push("admin-app-missing-role");
  return { ...app, routeMatches, inUserManifest: inUser, inOperatorManifest: inOp, drift };
});

// Manifest apps not in registry
const allRegisteredIds = new Set(appPlaneMap.map((a) => a.appId));
const manifestOrphans = [...userProfile.allowedApps, ...operatorProfile.allowedApps]
  .filter((id) => !allRegisteredIds.has(id));

writeFileSync(join(OUT_DIR, "app-registry-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalApps: appPlaneMap.length,
  apps: appRegistryRows,
  manifestOrphans: [...new Set(manifestOrphans)],
  driftSummary: {
    missingRoute: appRegistryRows.filter((a) => a.drift.includes("missing-route")).length,
    userManifestMissing: appRegistryRows.filter((a) => a.drift.includes("user-manifest-missing")).length,
    operatorManifestMissing: appRegistryRows.filter((a) => a.drift.includes("operator-manifest-missing")).length,
    adminMissingRole: appRegistryRows.filter((a) => a.drift.includes("admin-app-missing-role")).length,
  },
}, null, 2));

// ───────────────────── App-Route-Profile cross-map ─────────────────────
function resolvePlane(path: string): RoutePlaneEntry | null {
  let best: RoutePlaneEntry | null = null;
  for (const e of routePlaneMap) {
    if (path === e.prefix || path.startsWith(e.prefix + "/") || (e.prefix === "/" && path === "/")) {
      if (!best || e.prefix.length > best.prefix.length) best = e;
    }
  }
  return best;
}

interface RouteRow {
  path: string;
  file: string;
  guards: string[];
  plane: string | null;
  profiles: string[];
  requiredPermission?: string;
  appBacked: boolean;
  appId?: string;
  hiddenAppLike: boolean;
  drift: string[];
}

const dedupRoutes = new Map<string, RouteDecl>();
for (const r of routeDecls) {
  const key = `${r.path}::${r.file}`;
  if (!dedupRoutes.has(key)) dedupRoutes.set(key, r);
}

const routeRows: RouteRow[] = [...dedupRoutes.values()].map((r) => {
  const planeEntry = resolvePlane(r.path);
  const plane = planeEntry?.plane ?? null;
  const profiles = planeEntry?.profiles ?? [];
  // app-backed = there's an app whose expected route equals or contains this path
  const appBacked = appPlaneMap.find((a) => {
    const er = appExpectedRoute(a.appId);
    return r.path === er || r.path.startsWith(er + "/");
  });
  const drift: string[] = [];
  if (!planeEntry) drift.push("route-not-in-plane-map");
  if (plane === "admin" && r.guards.length === 0) drift.push("admin-route-unguarded");
  // Hidden app-like: top-level route segment, plane=user, has no app backing, not under existing app
  const isTopLevel = /^\/[^/]+$/.test(r.path);
  const hiddenAppLike = isTopLevel && plane === "user" && !appBacked && !["/", "/auth"].includes(r.path);
  if (hiddenAppLike) drift.push("hidden-app-like");
  return {
    path: r.path,
    file: r.file,
    guards: r.guards,
    plane,
    profiles,
    requiredPermission: planeEntry?.requiredPermission,
    appBacked: !!appBacked,
    appId: appBacked?.appId,
    hiddenAppLike,
    drift,
  };
});

writeFileSync(join(OUT_DIR, "app-route-profile-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalRoutes: routeRows.length,
  routes: routeRows,
  driftSummary: {
    routeNotInPlaneMap: routeRows.filter((r) => r.drift.includes("route-not-in-plane-map")).length,
    adminRouteUnguarded: routeRows.filter((r) => r.drift.includes("admin-route-unguarded")).length,
    hiddenAppLike: routeRows.filter((r) => r.drift.includes("hidden-app-like")).length,
  },
}, null, 2));

// ───────────────────── Mobile Capability Map ─────────────────────
interface MobileCapRow {
  file: string;
  feature: string;
  persistence: ("localStorage" | "sessionStorage" | "indexedDB" | "supabase" | "none")[];
  usesAuth: boolean;
  usesBiometric: boolean;
  hasSearch: boolean;
  hasOfflineQueue: boolean;
  classification: "live" | "partial" | "responsive-only" | "mock" | "planned";
  notes: string[];
}

function classify(c: string): MobileCapRow["classification"] {
  if (/TODO|FIXME|placeholder|mock data|hardcoded/i.test(c)) return "mock";
  if (/\bplanned\b|coming soon|not yet/i.test(c)) return "planned";
  if (/from ["']@\/integrations\/supabase/.test(c) || /supabase\./.test(c)) return "live";
  if (/useState|useEffect/.test(c) && !/from ["']@\//.test(c)) return "responsive-only";
  return "partial";
}

const mobileFiles = [
  ...walk("src/pages/mobile"),
  ...walk("src/components/mobile"),
  ...walk("src/hooks").filter((f) => /mobile/i.test(f)),
  ...walk("src/lib").filter((f) => /mobile/i.test(f)),
];

const mobileRows: MobileCapRow[] = mobileFiles.map((f) => {
  const c = safeRead(f);
  const persistence: MobileCapRow["persistence"] = [];
  if (/localStorage/.test(c)) persistence.push("localStorage");
  if (/sessionStorage/.test(c)) persistence.push("sessionStorage");
  if (/indexedDB|IDB|idb-keyval|NovaFS/.test(c)) persistence.push("indexedDB");
  if (/from ["']@\/integrations\/supabase/.test(c) || /\.from\(['"]/.test(c)) persistence.push("supabase");
  if (persistence.length === 0) persistence.push("none");
  const usesAuth = /useAuth|useUser|getUser|signIn|signOut/.test(c);
  const usesBiometric = /WebAuthn|navigator\.credentials|Biometric|biometric/i.test(c);
  const hasSearch = /Search|search/.test(f) || /useSearch|useGlobalSearch/.test(c);
  const hasOfflineQueue = /offline.*queue|queueOffline|sync.*queue/i.test(c);
  const classification = classify(c);
  const notes: string[] = [];
  if (persistence.includes("localStorage") && hasOfflineQueue) notes.push("offline-queue-on-localStorage (not durable)");
  if (usesBiometric && !/register|enroll/i.test(c)) notes.push("biometric-used-without-enrollment-flow");
  return {
    file: relative(".", f),
    feature: f.split("/").pop()!.replace(/\.tsx?$/, ""),
    persistence,
    usesAuth,
    usesBiometric,
    hasSearch,
    hasOfflineQueue,
    classification,
    notes,
  };
});

writeFileSync(join(OUT_DIR, "mobile-capability-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalFiles: mobileRows.length,
  features: mobileRows,
  summary: {
    live: mobileRows.filter((r) => r.classification === "live").length,
    partial: mobileRows.filter((r) => r.classification === "partial").length,
    responsiveOnly: mobileRows.filter((r) => r.classification === "responsive-only").length,
    mock: mobileRows.filter((r) => r.classification === "mock").length,
    planned: mobileRows.filter((r) => r.classification === "planned").length,
    usingLocalStorage: mobileRows.filter((r) => r.persistence.includes("localStorage")).length,
    withBiometric: mobileRows.filter((r) => r.usesBiometric).length,
  },
}, null, 2));

// ───────────────────── Profile Separation Map ─────────────────────
interface SeparationRow {
  file: string;
  category: "shared-component" | "shared-hook" | "shared-runtime" | "user-page";
  importsAdmin: string[];
  importsUserOnly: string[];
}

function extractImports(c: string): string[] {
  const out: string[] = [];
  const re = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(c))) out.push(m[1]);
  return out;
}

const sharedDirs = ["src/components", "src/shell-runtime", "src/hooks", "src/runtimes"];
const sharedFiles: string[] = [];
for (const d of sharedDirs) {
  for (const f of walk(d)) {
    if (/\/admin\//.test(f) || /\/mobile\//.test(f)) continue;
    sharedFiles.push(f);
  }
}

const separationRows: SeparationRow[] = [];
for (const f of sharedFiles) {
  const c = safeRead(f);
  const imports = extractImports(c);
  const adminImports = imports.filter(
    (i) =>
      i.startsWith("@/admin/") ||
      i.startsWith("@/pages/admin/") ||
      i.includes("/admin-only/") ||
      i.startsWith("@/components/admin/") ||
      i.startsWith("@/components/sita/admin"),
  );
  // Allowlist: sita/admin is canonically a shared presentation primitive set
  const realAdminImports = adminImports.filter((i) => !i.startsWith("@/components/sita/admin"));
  if (realAdminImports.length === 0) continue;
  let category: SeparationRow["category"] = "shared-component";
  if (f.includes("/hooks/")) category = "shared-hook";
  else if (f.includes("/shell-runtime/") || f.includes("/runtimes/")) category = "shared-runtime";
  separationRows.push({
    file: relative(".", f),
    category,
    importsAdmin: realAdminImports,
    importsUserOnly: [],
  });
}

// Manifest mismatches
const manifestMismatches: Array<{ appId: string; issue: string }> = [];
for (const a of appPlaneMap) {
  if (a.profiles.includes("user") && !userProfile.allowedApps.includes(a.appId)) {
    manifestMismatches.push({ appId: a.appId, issue: "declared user-profile but missing from user.profile.json allowedApps" });
  }
  if (a.profiles.includes("operator") && !operatorProfile.allowedApps.includes(a.appId)) {
    manifestMismatches.push({ appId: a.appId, issue: "declared operator-profile but missing from operator.profile.json allowedApps" });
  }
}

writeFileSync(join(OUT_DIR, "profile-separation-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  sharedComponentLeakage: separationRows,
  manifestMismatches,
  summary: {
    leakageCount: separationRows.length,
    manifestMismatchCount: manifestMismatches.length,
    userProfileApps: userProfile.allowedApps.length,
    operatorProfileApps: operatorProfile.allowedApps.length,
    appPlaneMapEntries: appPlaneMap.length,
  },
}, null, 2));

// ───────────────────── Markdown summaries ─────────────────────
function md(s: string) { return s.replace(/^\s+/gm, ""); }

writeFileSync(join(OUT_DIR, "APP_REGISTRY_AND_LAUNCHER_AUDIT.md"), md(`
# App Registry & Launcher Audit (Phase A)

Generated: ${new Date().toISOString()}

## Coverage
- Apps in registry: **${appPlaneMap.length}**
- Routes scanned: **${routeRows.length}**
- User profile allowedApps: **${userProfile.allowedApps.length}**
- Operator profile allowedApps: **${operatorProfile.allowedApps.length}**

## Drift Summary
- Apps with missing route: **${appRegistryRows.filter((a) => a.drift.includes("missing-route")).length}**
- Apps missing from user manifest (but declare user profile): **${appRegistryRows.filter((a) => a.drift.includes("user-manifest-missing")).length}**
- Apps missing from operator manifest (but declare operator profile): **${appRegistryRows.filter((a) => a.drift.includes("operator-manifest-missing")).length}**
- Admin apps without roleRequired: **${appRegistryRows.filter((a) => a.drift.includes("admin-app-missing-role")).length}**
- Manifest orphans (apps in profile manifest but not in registry): **${manifestOrphans.length}**

## Drift Detail (only entries with drift)
${appRegistryRows.filter((a) => a.drift.length > 0).map((a) => `- \`${a.appId}\` (${a.plane}, profiles=${JSON.stringify(a.profiles)}) → ${a.drift.join(", ")}`).join("\n") || "_no drift detected_"}

## Manifest Orphans
${manifestOrphans.length === 0 ? "_none_" : manifestOrphans.map((id) => `- \`${id}\``).join("\n")}

See \`app-registry-map.json\` for full detail.
`));

writeFileSync(join(OUT_DIR, "APP_ROUTE_PROFILE_CROSSMAP.md"), md(`
# App ↔ Route ↔ Profile Cross-Map (Phase A)

Generated: ${new Date().toISOString()}

## Totals
- Total declared routes: **${routeRows.length}**
- Routes not in route-plane-map: **${routeRows.filter((r) => r.drift.includes("route-not-in-plane-map")).length}**
- Admin routes without guards: **${routeRows.filter((r) => r.drift.includes("admin-route-unguarded")).length}**
- Hidden app-like routes (top-level, user-plane, no app backing): **${routeRows.filter((r) => r.hiddenAppLike).length}**

## Hidden App-Like Routes
${routeRows.filter((r) => r.hiddenAppLike).slice(0, 50).map((r) => `- \`${r.path}\` (${r.file})`).join("\n") || "_none_"}

See \`app-route-profile-map.json\` for full detail.
`));

writeFileSync(join(OUT_DIR, "MOBILE_RUNTIME_READINESS_AUDIT.md"), md(`
# Mobile Runtime Readiness Audit (Phase A)

Generated: ${new Date().toISOString()}

## Inventory
- Mobile-related files scanned: **${mobileRows.length}**

## Classification
- live: **${mobileRows.filter((r) => r.classification === "live").length}**
- partial: **${mobileRows.filter((r) => r.classification === "partial").length}**
- responsive-only: **${mobileRows.filter((r) => r.classification === "responsive-only").length}**
- mock: **${mobileRows.filter((r) => r.classification === "mock").length}**
- planned: **${mobileRows.filter((r) => r.classification === "planned").length}**

## Risk Indicators
- Files using \`localStorage\` for persistence: **${mobileRows.filter((r) => r.persistence.includes("localStorage")).length}**
- Files referencing biometric APIs: **${mobileRows.filter((r) => r.usesBiometric).length}**
- Files with offline-queue logic on \`localStorage\`: **${mobileRows.filter((r) => r.notes.some((n) => n.includes("offline-queue-on-localStorage"))).length}**

## Capability Verdict
Mobile is **NOT globally production-hard**. Per-feature truth classification is required.
The honest readiness target is: hardened *Web/PWA mobile surface*, with native (APNs/FCM/biometric) features explicitly **deferred** and labeled in-app.

See \`mobile-capability-map.json\` for full detail.
`));

writeFileSync(join(OUT_DIR, "MOBILE_CAPABILITY_TRUTH_MAP.md"), md(`
# Mobile Capability Truth Map (Phase A)

Generated: ${new Date().toISOString()}

| File | Feature | Class | Persistence | Auth | Biometric | Notes |
|---|---|---|---|---|---|---|
${mobileRows.map((r) => `| \`${r.file}\` | ${r.feature} | ${r.classification} | ${r.persistence.join(",")} | ${r.usesAuth ? "Y" : "—"} | ${r.usesBiometric ? "Y" : "—"} | ${r.notes.join("; ") || "—"} |`).join("\n")}
`));

writeFileSync(join(OUT_DIR, "USER_OPERATOR_PROFILE_SEPARATION_AUDIT.md"), md(`
# User vs Operator Profile Separation Audit (Phase A)

Generated: ${new Date().toISOString()}

## Manifest Alignment
- App-plane-map entries: **${appPlaneMap.length}**
- User profile allowedApps: **${userProfile.allowedApps.length}**
- Operator profile allowedApps: **${operatorProfile.allowedApps.length}**
- Manifest mismatches: **${manifestMismatches.length}**

### Mismatches
${manifestMismatches.length === 0 ? "_none_" : manifestMismatches.map((m) => `- \`${m.appId}\` — ${m.issue}`).join("\n")}

## Shared Component Plane Pollution
- Shared files importing admin-only modules (excluding allowlisted \`sita/admin\`): **${separationRows.length}**

${separationRows.length === 0 ? "_none — shared layer is clean_" : separationRows.slice(0, 50).map((r) => `- \`${r.file}\` (${r.category}) → imports: ${r.importsAdmin.join(", ")}`).join("\n")}

See \`profile-separation-map.json\` for full detail.
`));

writeFileSync(join(OUT_DIR, "SHARED_COMPONENT_PROFILE_LEAKAGE.md"), md(`
# Shared Component Profile Leakage (Phase A)

Generated: ${new Date().toISOString()}

## Findings
- Total shared files scanned: **${sharedFiles.length}**
- With admin-only imports: **${separationRows.length}**

${separationRows.length === 0 ? "✅ **Shared layer is clean.** No remediation required." : separationRows.map((r) => `### \`${r.file}\`\n- Category: ${r.category}\n- Admin imports:\n${r.importsAdmin.map((i) => `  - \`${i}\``).join("\n")}`).join("\n\n")}
`));

writeFileSync(join(OUT_DIR, "ROUTE_GUARD_AND_ACCESS_COVERAGE.md"), md(`
# Route Guard & Access Coverage (Phase A)

Generated: ${new Date().toISOString()}

## Coverage
- Total routes: **${routeRows.length}**
- Admin-plane routes: **${routeRows.filter((r) => r.plane === "admin").length}**
- Admin routes with guards (AdminRoute or PermissionGatedRoute): **${routeRows.filter((r) => r.plane === "admin" && r.guards.length > 0).length}**
- Admin routes WITHOUT guards: **${routeRows.filter((r) => r.plane === "admin" && r.guards.length === 0).length}**

## Unguarded Admin Routes
${routeRows.filter((r) => r.plane === "admin" && r.guards.length === 0).slice(0, 50).map((r) => `- \`${r.path}\` (${r.file})`).join("\n") || "✅ _All admin routes are guarded._"}
`));

console.log("Phase A — runtime evidence maps generated:");
console.log(`  - apps: ${appPlaneMap.length}, routes: ${routeRows.length}, mobile files: ${mobileRows.length}`);
console.log(`  - shared leakage: ${separationRows.length}, manifest mismatches: ${manifestMismatches.length}`);
console.log(`  - hidden app-like routes: ${routeRows.filter((r) => r.hiddenAppLike).length}`);
console.log(`Output → ${OUT_DIR}`);
