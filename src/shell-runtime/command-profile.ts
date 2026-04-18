// ═══════════════════════════════════════════════════════════════
// SITA OS — Command Palette Profile Filter
//
// Filters command/search entries by deployment profile + role.
// Wraps any existing command source — does NOT replace it.
// ═══════════════════════════════════════════════════════════════

import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";
import { ROUTE_PLANE_MAP } from "@/platform/architecture/route-plane-map";
import { getDeploymentProfile } from "@/runtimes/deployment-profile";

export interface CommandEntry {
  id: string;
  label: string;
  /** Optional explicit route this command navigates to. */
  route?: string;
  /** Optional plane/profile constraints (overrides route lookup). */
  plane?: string;
  /** Profiles the command is visible in. Defaults to both. */
  profiles?: DeploymentProfileKey[];
  /** Optional permission needed. */
  requiredPermission?: string;
  /** Catch-all metadata. */
  meta?: Record<string, unknown>;
}

export interface CommandFilterContext {
  profile?: DeploymentProfileKey;
  permissions?: ReadonlySet<string> | string[];
}

function hasPerm(ctx: CommandFilterContext, key?: string): boolean {
  if (!key) return true;
  const perms = ctx.permissions;
  if (!perms) return false;
  return Array.isArray(perms) ? perms.includes(key) : perms.has(key);
}

function resolveRouteVisibility(
  route: string,
  profile: DeploymentProfileKey,
): { visible: boolean; requiredPermission?: string } {
  // Longest-prefix match.
  const match = [...ROUTE_PLANE_MAP]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => route === r.prefix || route.startsWith(`${r.prefix}/`));
  if (!match) return { visible: true };
  if (!match.profiles.includes(profile)) return { visible: false };
  return { visible: true, requiredPermission: match.requiredPermission };
}

/** Filter a list of command entries down to what the user can actually run. */
export function filterCommandsForProfile<T extends CommandEntry>(
  entries: T[],
  ctx: CommandFilterContext = {},
): T[] {
  const profile = ctx.profile ?? getDeploymentProfile().profile;
  return entries.filter((cmd) => {
    if (cmd.profiles && !cmd.profiles.includes(profile)) return false;
    if (cmd.route) {
      const r = resolveRouteVisibility(cmd.route, profile);
      if (!r.visible) return false;
      if (!hasPerm(ctx, cmd.requiredPermission ?? r.requiredPermission)) return false;
      return true;
    }
    if (!hasPerm(ctx, cmd.requiredPermission)) return false;
    return true;
  });
}
