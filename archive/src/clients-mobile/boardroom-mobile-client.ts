// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Boardroom Client
// Read-only on mobile. Decisions are taken on desktop boardroom.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export const boardroomMobileClient = {
  async listOpenItems() {
    const { data, error } = await supabase
      .from("boardroom_items")
      .select("id,title,description,domain,severity,status,updated_at")
      .neq("status", "closed")
      .order("updated_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  },

  async getItem(id: string) {
    const { data, error } = await supabase
      .from("boardroom_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
