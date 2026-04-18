// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Section Profile Filter
//
// Filters the existing Settings page's section list by active
// deployment profile + role. Operator-only sections (release
// rings, kill switches, fleet diagnostics) hide in user profile.
// ═══════════════════════════════════════════════════════════════

import type { DeploymentProfileKey } from "@/lib/architecture/route-plane-map";
import { getDeploymentProfile } from "@/lib/runtime/deployment-profile";

export interface SettingsSectionDescriptor {
  id: string;
  label: string;
  /** Profiles where this section is visible. Defaults to both. */
  profiles?: DeploymentProfileKey[];
  /** Optional permission required. */
  requiredPermission?: string;
  /** Section group: account / device / privacy / advanced / operator. */
  group?: "account" | "device" | "privacy" | "advanced" | "operator";
}

export interface SettingsFilterContext {
  profile?: DeploymentProfileKey;
  permissions?: ReadonlySet<string> | string[];
}

function hasPerm(ctx: SettingsFilterContext, key?: string): boolean {
  if (!key) return true;
  const perms = ctx.permissions;
  if (!perms) return false;
  return Array.isArray(perms) ? perms.includes(key) : perms.has(key);
}

export function filterSettingsForProfile<T extends SettingsSectionDescriptor>(
  sections: T[],
  ctx: SettingsFilterContext = {},
): T[] {
  const profile = ctx.profile ?? getDeploymentProfile().profile;
  return sections.filter((s) => {
    if (s.profiles && !s.profiles.includes(profile)) return false;
    // Operator group requires operator profile OR explicit permission
    if (s.group === "operator" && profile !== "operator" && !hasPerm(ctx, s.requiredPermission)) {
      return false;
    }
    if (!hasPerm(ctx, s.requiredPermission)) return false;
    return true;
  });
}
