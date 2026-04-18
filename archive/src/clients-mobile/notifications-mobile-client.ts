// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Notifications Client
// Read alerts; mark-read may queue under "notifications" policy.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { enqueueMobileMutation } from "./_base";

export const notificationsMobileClient = {
  async listAlerts() {
    const { data, error } = await supabase
      .from("admin_action_audit")
      .select("id,action,severity,created_at,plane")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw error;
    return data ?? [];
  },

  async markRead(id: string) {
    const queued = await enqueueMobileMutation({
      domain: "notifications",
      verb: "alert.markRead",
      payload: { id },
      optimisticSnapshot: { id, read: true },
    });
    return queued;
  },
};
