// ═══════════════════════════════════════════════════════════════
// permissions.service — read/write per-user app permission grants
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface PermissionOverride {
  app_id: string;
  permission_key: string;
  granted: boolean;
  permission_value: Record<string, unknown>;
  updated_at: string;
}

const sb = () =>
  supabase as unknown as { from: (t: string) => any; functions: any };

export const permissionsService = {
  async listForUser(userId: string, appId?: string): Promise<PermissionOverride[]> {
    let q = sb()
      .from("app_permissions_overrides")
      .select("*")
      .eq("user_id", userId);
    if (appId) q = q.eq("app_id", appId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as PermissionOverride[];
  },

  async setGrants(
    appId: string,
    grants: Array<{ key: string; granted: boolean; value?: unknown }>,
  ) {
    const { data, error } = await sb().functions.invoke("app-permissions-sync", {
      body: { app_id: appId, grants },
    });
    if (error) throw error;
    return data;
  },
};
