// ═══════════════════════════════════════════════════════════════
// update.service — pending updates for current user
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface PendingUpdate {
  app_id: string;
  name: string;
  icon_url: string | null;
  installed_version: string;
  latest_version: string;
  channel: string;
}

const sb = () => supabase as unknown as { functions: any };

export const updateService = {
  async check(): Promise<PendingUpdate[]> {
    const { data, error } = await sb().functions.invoke("app-update-check", { method: "GET" });
    if (error) throw error;
    return (data?.updates ?? []) as PendingUpdate[];
  },
};
