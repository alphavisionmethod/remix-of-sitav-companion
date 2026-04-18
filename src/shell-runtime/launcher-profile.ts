// ═══════════════════════════════════════════════════════════════
// SITA OS — Launcher Profile Composer
//
// Pure helpers used by every launcher surface (dock, app grid,
// app store, search results) to filter visible apps based on the
// active deployment profile and current user role.
//
// One shared launcher → profile-aware composition (NOT a fork).
// ═══════════════════════════════════════════════════════════════

import {
  APP_PLANE_MAP,
  type AppPlaneEntry,
} from "@/lib/architecture/app-plane-map";
import type { DeploymentProfileKey } from "@/lib/architecture/route-plane-map";
import { getDeploymentProfile } from "@/lib/runtime/deployment-profile";

export interface LauncherFilterContext {
  /** Active deployment profile. Defaults to runtime resolution. */
  profile?: DeploymentProfileKey;
  /** Caller-supplied permission keys (from admin-rbac). */
  permissions?: ReadonlySet<string> | string[];
  /** Include hidden/utility apps (e.g. "search"). */
  includeHidden?: boolean;
}

function hasPerm(ctx: LauncherFilterContext, key?: string): boolean {
  if (!key) return true;
  const perms = ctx.permissions;
  if (!perms) return false;
  return Array.isArray(perms) ? perms.includes(key) : perms.has(key);
}

function activeProfile(ctx: LauncherFilterContext): DeploymentProfileKey {
  return ctx.profile ?? getDeploymentProfile().profile;
}

/** Apps visible in the launcher grid for the active profile + role. */
export function filterAppsForLauncher(ctx: LauncherFilterContext = {}): AppPlaneEntry[] {
  const profile = activeProfile(ctx);
  return APP_PLANE_MAP.filter((app) => {
    if (!app.profiles.includes(profile)) return false;
    if (!ctx.includeHidden && !app.launcherVisible) return false;
    if (!hasPerm(ctx, app.roleRequired)) return false;
    return true;
  });
}

/** Apps surfaced by the command palette / global search. */
export function filterAppsForCommandPalette(ctx: LauncherFilterContext = {}): AppPlaneEntry[] {
  const profile = activeProfile(ctx);
  return APP_PLANE_MAP.filter((app) => {
    if (!app.profiles.includes(profile)) return false;
    if (!app.commandVisible) return false;
    if (!hasPerm(ctx, app.roleRequired)) return false;
    return true;
  });
}

/** Default pinned dock apps for the active profile. */
export function defaultPinnedAppsForProfile(profile?: DeploymentProfileKey): AppPlaneEntry[] {
  const p = profile ?? getDeploymentProfile().profile;
  return APP_PLANE_MAP.filter((app) => app.defaultPinned.includes(p));
}

/** Visibility check for a single app id (used by app-store grid). */
export function isAppVisibleInProfile(
  appId: string,
  ctx: LauncherFilterContext = {},
): boolean {
  const app = APP_PLANE_MAP.find((a) => a.appId === appId);
  if (!app) return false;
  const profile = activeProfile(ctx);
  if (!app.profiles.includes(profile)) return false;
  if (!hasPerm(ctx, app.roleRequired)) return false;
  return true;
}
