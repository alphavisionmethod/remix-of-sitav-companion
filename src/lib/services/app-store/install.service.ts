// ═══════════════════════════════════════════════════════════════
// install.service — install/uninstall/list installed for current user
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface InstalledAppRow {
  id: string;
  user_id: string;
  app_id: string;
  install_status:
    | "not_installed"
    | "installing"
    | "installed"
    | "updating"
    | "update_available"
    | "uninstalling"
    | "blocked";
  enabled: boolean;
  pinned: boolean;
  favorite: boolean;
  pinned_order: number;
  launch_count: number;
  last_launched_at: string | null;
  version_installed: string | null;
  permissions_granted: Record<string, unknown>;
  config_json: Record<string, unknown>;
  source_channel: string;
  installed_at: string;
  updated_at: string;
}

const TABLE = "installed_apps" as const;
const sb = () => supabase as unknown as { from: (t: string) => any; functions: any };

export const installService = {
  async listForUser(userId: string): Promise<InstalledAppRow[]> {
    const { data, error } = await sb()
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("pinned_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as InstalledAppRow[];
  },

  async install(appId: string, sourceChannel = "store") {
    const { data, error } = await sb().functions.invoke("app-install", {
      body: { app_id: appId, source_channel: sourceChannel },
    });
    if (error) throw error;
    return data?.installed as InstalledAppRow | undefined;
  },

  async uninstall(appId: string) {
    const { data, error } = await sb().functions.invoke("app-uninstall", {
      body: { app_id: appId },
    });
    if (error) throw error;
    return data;
  },

  async setPinned(userId: string, appId: string, pinned: boolean, order?: number) {
    const patch: Record<string, unknown> = { pinned };
    if (pinned && typeof order === "number") patch.pinned_order = order;
    const { data, error } = await sb()
      .from(TABLE)
      .update(patch)
      .eq("user_id", userId)
      .eq("app_id", appId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data as InstalledAppRow | null;
  },

  async setFavorite(userId: string, appId: string, favorite: boolean) {
    const { data, error } = await sb()
      .from(TABLE)
      .update({ favorite })
      .eq("user_id", userId)
      .eq("app_id", appId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data as InstalledAppRow | null;
  },

  async reorderPinned(userId: string, orderedAppIds: string[]) {
    // Sequential updates (RLS-safe, small N)
    await Promise.all(
      orderedAppIds.map((appId, idx) =>
        sb()
          .from(TABLE)
          .update({ pinned_order: idx, pinned: true })
          .eq("user_id", userId)
          .eq("app_id", appId),
      ),
    );
  },
};
