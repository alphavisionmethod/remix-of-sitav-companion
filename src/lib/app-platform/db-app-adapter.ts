// ═══════════════════════════════════════════════════════════════
// SITA OS — DB row → AppDefinition adapter
// Maps the production `apps` + `installed_apps` rows into the
// AppDefinition shape that the existing UI / launcher / dock expect.
// This is the bridge that makes the 17 store pages and the
// shell consume the real DB without a rewrite.
// ═══════════════════════════════════════════════════════════════

import type { CatalogApp } from "@/lib/services/app-store/catalog.service";
import type { InstalledAppRow } from "@/lib/services/app-store/install.service";
import type {
  AppDefinition,
  AppCategory,
  AppClass,
  AppTrustLevel,
  AppInstallStatus,
  AppPermission,
  AppSourceOrigin,
  AppSandboxLevel,
  AppPackageType,
  AppUpdateMode,
} from "./types";

// ── Type → AppClass mapping ─────────────────────────────────────
const APP_TYPE_TO_CLASS: Record<CatalogApp["app_type"], AppClass> = {
  internal: "internal",
  web: "web-app",
  pwa: "wrapped-app",
  external_desktop: "native",
  pack: "internal",
};

// ── DB trust_level → AppTrustLevel ──────────────────────────────
function mapTrust(
  trust: CatalogApp["trust_level"],
  verification: CatalogApp["verification_status"],
): AppTrustLevel {
  if (trust === "first_party") return "sita-verified";
  if (verification === "verified" || verification === "publisher_verified") return "publisher-verified";
  if (trust === "trusted") return "publisher-verified";
  if (trust === "restricted") return "unknown-source";
  return "community-reviewed";
}

// ── DB category → known AppCategory ─────────────────────────────
const CATEGORY_ALIAS: Record<string, AppCategory> = {
  "browsers": "browsers",
  "communication": "communication",
  "productivity": "productivity",
  "developer-tools": "developer-tools",
  "business": "business",
  "finance": "finance",
  "media": "media",
  "utilities": "utilities",
  "household": "household",
  "security": "security",
  "education": "education",
  "entertainment": "entertainment",
  "enterprise": "enterprise",
  "extensions": "extensions",
};

function mapCategory(c: string | null): AppCategory {
  if (!c) return "utilities";
  return CATEGORY_ALIAS[c] ?? "utilities";
}

// ── Permission risk normalization ───────────────────────────────
function normalizePermissions(
  required: CatalogApp["permissions_required"],
  granted: InstalledAppRow["permissions_granted"] | undefined,
): AppPermission[] {
  const grantedSet = new Set(
    Array.isArray(granted)
      ? (granted as Array<{ key?: string; granted?: boolean }>)
          .filter((g) => g?.granted !== false)
          .map((g) => g.key ?? "")
      : [],
  );
  return (required ?? []).map((p) => ({
    id: p.key,
    domain: p.key,
    label: p.label ?? p.key.replace(/_/g, " "),
    description: (p as { description?: string }).description ?? `Access to ${p.key}`,
    granted: grantedSet.size > 0 ? grantedSet.has(p.key) : !!p.required,
    required: !!p.required,
    riskLevel: ((p.risk as "low" | "medium" | "high") ?? "low"),
  }));
}

// ── Icon emoji extraction ───────────────────────────────────────
// DB `icon_url` may be an emoji or a real URL; we accept both.
function extractIcon(app: CatalogApp): string {
  const raw = app.icon_url ?? "";
  // Single emoji (heuristic) → use as-is
  if (raw && raw.length <= 4 && !/^https?:/i.test(raw)) return raw;
  if (raw) return raw;
  // Sensible fallback per type
  switch (app.app_type) {
    case "internal": return "📦";
    case "web": return "🌐";
    case "pwa": return "📱";
    case "external_desktop": return "🖥️";
    default: return "📦";
  }
}

function pickIconBg(app: CatalogApp): string {
  // Stable hash for a tasteful gradient
  const palettes = [
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-indigo-500 to-blue-500",
    "from-lime-500 to-green-500",
    "from-fuchsia-500 to-pink-500",
  ];
  let h = 0;
  for (let i = 0; i < app.app_id.length; i++) h = (h * 31 + app.app_id.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
}

// ── Launch target → routePath / externalUrl ─────────────────────
function pickRouteAndUrl(app: CatalogApp) {
  const lt = (app.launch_target ?? {}) as Record<string, unknown>;
  const route = typeof lt.route === "string" ? lt.route : undefined;
  const url =
    typeof lt.url === "string" ? lt.url :
    typeof lt.fallback_url === "string" ? lt.fallback_url :
    undefined;
  return { routePath: route, externalUrl: url };
}

// ── source_origin / package_type / update_mode ──────────────────
function pickSourceOrigin(app: CatalogApp): AppSourceOrigin {
  switch (app.app_type) {
    case "internal": return "system-preinstalled";
    case "web": return "web-install";
    case "pwa": return "web-install";
    case "external_desktop": return "publisher-direct";
    default: return "sita-store";
  }
}

function pickPackageType(app: CatalogApp): AppPackageType {
  switch (app.app_type) {
    case "internal": return "internal-tool";
    case "web": return "web-app";
    case "pwa": return "wrapped-web-app";
    case "external_desktop": return "native-application";
    default: return "external-package";
  }
}

function pickUpdateMode(app: CatalogApp): AppUpdateMode {
  if (app.app_type === "external_desktop") return "publisher-managed";
  if (app.app_type === "internal") return "store-managed";
  return "web-runtime";
}

// ── Install-status mapping (DB enum → UI enum) ──────────────────
function mapInstallStatus(
  dbStatus: InstalledAppRow["install_status"] | undefined,
  versionInstalled: string | null | undefined,
  latestVersion: string,
  isPreinstalled: boolean,
): AppInstallStatus {
  if (!dbStatus) {
    return isPreinstalled ? "installed" : "not-installed";
  }
  // Update available?
  if (
    dbStatus === "installed" &&
    versionInstalled &&
    versionInstalled !== latestVersion
  ) {
    return "update-available";
  }
  // DB uses snake_case for the enum; UI uses kebab-case for some tokens.
  switch (dbStatus) {
    case "not_installed": return "not-installed";
    case "update_available": return "update-available";
    default: return dbStatus as AppInstallStatus;
  }
}

// ── Core mapper ─────────────────────────────────────────────────
export function dbToAppDefinition(
  app: CatalogApp,
  installed?: InstalledAppRow,
): AppDefinition {
  const { routePath, externalUrl } = pickRouteAndUrl(app);
  const sourceOrigin = pickSourceOrigin(app);
  const packageType = pickPackageType(app);
  const updateMode = pickUpdateMode(app);
  const isPreinstalled = app.installability === "preinstalled";

  const installStatus = mapInstallStatus(
    installed?.install_status,
    installed?.version_installed,
    app.latest_version,
    isPreinstalled,
  );

  const sandboxLevel: AppSandboxLevel =
    app.app_type === "internal" ? "standard" : "limited-files";

  const lastUpdatedIso =
    installed?.updated_at ??
    (app.manifest_json as { released_at?: string } | undefined)?.released_at ??
    new Date().toISOString();

  const sizeMb =
    (app.manifest_json as { size_mb?: number } | undefined)?.size_mb ?? 0;

  return {
    id: app.app_id,
    name: app.name,
    publisher: app.publisher ?? "Unknown publisher",
    icon: extractIcon(app),
    iconBg: pickIconBg(app),
    category: mapCategory(app.category),
    appClass: APP_TYPE_TO_CLASS[app.app_type],
    trustLevel: mapTrust(app.trust_level, app.verification_status),
    version: installed?.version_installed ?? app.version ?? "1.0.0",
    size: sizeMb > 0 ? `${sizeMb} MB` : "—",
    shortDescription: app.short_name ?? app.description?.slice(0, 80) ?? app.name,
    fullDescription: app.description ?? `${app.name} from ${app.publisher ?? "Unknown publisher"}.`,
    whySitaRecommends: (app.manifest_json as { why?: string } | undefined)?.why,
    screenshots: app.screenshots ?? [],
    rating: (app.manifest_json as { rating?: number } | undefined)?.rating ?? 4.5,
    downloads: (app.manifest_json as { downloads?: number } | undefined)?.downloads ?? 0,
    lastUpdated: lastUpdatedIso.slice(0, 10),
    releaseNotes:
      ((app.manifest_json as { release_notes?: string[] } | undefined)?.release_notes) ?? [],
    permissions: normalizePermissions(app.permissions_required, installed?.permissions_granted),
    fileAssociations:
      (app.manifest_json as { file_associations?: AppDefinition["fileAssociations"] } | undefined)
        ?.file_associations ?? [],
    protocolAssociations:
      (app.manifest_json as { protocol_associations?: AppDefinition["protocolAssociations"] } | undefined)
        ?.protocol_associations ?? [],
    worksWithSita: app.supported_surfaces.map((s) =>
      s === "desktop" ? "Desktop shell" :
      s === "mobile" ? "Mobile" :
      s === "pwa" ? "PWA standalone" :
      "Electron host",
    ),
    updateSource:
      updateMode === "store-managed" || updateMode === "publisher-managed" || updateMode === "enterprise-managed"
        ? updateMode
        : "store-managed",
    startupBehavior: ((installed?.config_json as { startupBehavior?: "none" | "background" | "visible" } | undefined)
      ?.startupBehavior) ?? "none",
    notificationPermission:
      ((installed?.config_json as { notificationEnabled?: boolean } | undefined)?.notificationEnabled) ?? true,
    installStatus,
    installedAt: installed?.installed_at,
    pinnedToDock: !!installed?.pinned,
    featured: app.featured,
    isNew: false,
    tags: app.tags ?? [],
    receipts: [],
    sourceOrigin,
    installScope: ((installed?.config_json as { installScope?: AppSourceOrigin } | undefined)
      ?.installScope as unknown as AppDefinition["installScope"]) ?? "user",
    sandboxLevel,
    packageType,
    updateMode,
    routePath,
    externalUrl,
    badgeCount: 0,
    lastUsedAt: installed?.last_launched_at ?? undefined,
  };
}

export function dbRowsToAppDefinitions(
  catalog: CatalogApp[],
  installed: InstalledAppRow[],
): AppDefinition[] {
  const installedById = new Map(installed.map((r) => [r.app_id, r]));
  return catalog.map((c) => dbToAppDefinition(c, installedById.get(c.app_id)));
}
