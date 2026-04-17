// ═══════════════════════════════════════════════════════════════
// recents.service — recently launched apps for current user
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface RecentApp {
  app_id: string;
  last_launched_at: string;
  launch_count: number;
}

const sb = () => supabase as unknown as { from: (t: string) => any };

export const recentsService = {
  async listForUser(userId: string, limit = 12): Promise<RecentApp[]> {
    const { data, error } = await sb()
      .from("installed_apps")
      .select("app_id,last_launched_at,launch_count")
      .eq("user_id", userId)
      .not("last_launched_at", "is", null)
      .order("last_launched_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as RecentApp[];
  },
};
