// ═══════════════════════════════════════════════════════════════
// Permission Engine — gate for SDK calls
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { PackagePermission } from "./package-schema";

export interface PermissionGrant {
  app_id: string;
  permission_key: string;
  granted: boolean;
  granted_at?: string | null;
  source?: "user" | "default" | "admin" | "manifest";
}

export interface PermissionDecision {
  permission: PackagePermission;
  granted: boolean;
  reason: string;
  source: "manifest" | "user" | "default" | "denied" | "missing";
}

const HIGH_RISK: PackagePermission[] = ["files.write", "shell.window", "deep-links", "storage.persist"];

export const permissionEngine = {
  /** List effective permissions for an installed app. */
  async listForApp(userId: string, appId: string): Promise<PermissionGrant[]> {
    const sb = supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (k: string, v: string) => { eq: (k: string, v: string) => Promise<{ data: unknown[] | null }> };
        };
      };
    };
    const { data } = await sb
      .from("app_permission_grants")
      .select("app_id,permission_key,granted,granted_at,source")
      .eq("user_id", userId)
      .eq("app_id", appId);
    return ((data as PermissionGrant[]) ?? []);
  },

  /** Decide whether a permission is granted for an app at runtime. */
  decide(args: {
    permission: PackagePermission;
    manifestRequested: PackagePermission[];
    userGrants: PermissionGrant[];
  }): PermissionDecision {
    const { permission, manifestRequested, userGrants } = args;
    if (!manifestRequested.includes(permission)) {
      return {
        permission,
        granted: false,
        reason: "Permission not declared in manifest.",
        source: "missing",
      };
    }
    const grant = userGrants.find((g) => g.permission_key === permission);
    if (grant) {
      return {
        permission,
        granted: grant.granted,
        reason: grant.granted ? "User granted." : "User denied.",
        source: "user",
      };
    }
    // Auto-grant low-risk by default
    if (!HIGH_RISK.includes(permission)) {
      return { permission, granted: true, reason: "Default low-risk permission.", source: "default" };
    }
    return { permission, granted: false, reason: "High-risk permission requires explicit grant.", source: "denied" };
  },

  isHighRisk(p: PackagePermission): boolean {
    return HIGH_RISK.includes(p);
  },
};
