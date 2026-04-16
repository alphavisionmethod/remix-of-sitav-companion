// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Money Client
// Money mutations are NOT queued — server-of-record only.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { classifyNetwork } from "@/lib/mobile-platform";

export const moneyMobileClient = {
  async listOpenItems() {
    const { data, error } = await supabase
      .from("advisor_action_queue")
      .select("id,summary,status,confidence,created_at")
      .eq("domain", "money")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw error;
    return data ?? [];
  },

  async markAcknowledged(id: string): Promise<{ ok: boolean; reason?: string }> {
    if (classifyNetwork() === "offline") {
      return { ok: false, reason: "Money actions require an online connection on mobile." };
    }
    const { error } = await supabase
      .from("advisor_action_queue")
      .update({ status: "acknowledged" })
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  },
};
